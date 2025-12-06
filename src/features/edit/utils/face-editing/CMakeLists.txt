cmake_minimum_required(VERSION 3.20)

# プロジェクト名と使用言語
project(web_puri_project LANGUAGES CXX)

# C++ 標準の指定
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ソースコードを取得
file(GLOB_RECURSE SOURCES
    "${CMAKE_SOURCE_DIR}./*.cpp"
    "${CMAKE_SOURCE_DIR}./*.c"
)

# 実行ファイルの生成
add_executable(web_puri ${SOURCES})

# 出力先をビルドタイプごとに切り替え
set_target_properties(web_puri PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "$<$<CONFIG:Release>:${CMAKE_BINARY_DIR}../../app>"
    RUNTIME_OUTPUT_DIRECTORY "$<$<NOT:$<CONFIG:Release>>:${CMAKE_BINARY_DIR}../../dist>"
)

# インクルードディレクトリの追加
target_include_directories(web_puri PRIVATE
    "${CMAKE_SOURCE_DIR}./"
)

# Emscripten 環境でのみ設定を適用
if(EMSCRIPTEN)
    # --- デバッグ時の設定 ---
    set(DEBUG_LINK_FLAGS 
        "-s DISABLE_EXCEPTION_CATCHING=0" 
        "-s ASSERTIONS=2" 
        "-O0"
    )
    
    # --- リリース時の設定 ---
    set(RELEASE_LINK_FLAGS 
        "-s DISABLE_EXCEPTION_CATCHING=1" 
        "-flto" 
        "-O3"
        "--closure 1"
    )

    # --- リンクオプション ---
    target_link_options(web_puri PRIVATE
        "$<$<CONFIG:Debug>:${DEBUG_LINK_FLAGS}>"
        "$<$<CONFIG:Release>:${RELEASE_LINK_FLAGS}>"
        "$<$<CONFIG:RelWithDebInfo>:${RELEASE_LINK_FLAGS}>"
        "$<$<CONFIG:MinSizeRel>:${RELEASE_LINK_FLAGS}>"
    )
    
    # --- コンパイルオプション ---
    target_compile_options(web_puri PRIVATE
        "$<$<CONFIG:Debug>:-O0>"
        "$<$<CONFIG:Release>:-O3;-flto>"
        "$<$<CONFIG:RelWithDebInfo>:-O3;-flto>"
        "$<$<CONFIG:MinSizeRel>:-Oz>"
    )
endif()