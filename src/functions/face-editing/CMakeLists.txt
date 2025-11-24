cmake_minimum_required(VERSION 3.20)

# プロジェクト名と使用言語
project(web_puri_project LANGUAGES CXX)

# C++ 標準の指定
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ソースコードを functions ディレクトリから取得
file(GLOB_RECURSE SOURCES
    "${CMAKE_SOURCE_DIR}./*.cpp"
    "${CMAKE_SOURCE_DIR}./*.c"
)

# 実行ファイルの生成
add_executable(web_puri ${SOURCES})

# 出力先を dist に設定
set_target_properties(web_puri PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}../../../dist"
)

# インクルードディレクトリの追加
target_include_directories(web_puri PRIVATE
    "${CMAKE_SOURCE_DIR}./"
)

# 必要ならライブラリをリンク
# target_link_libraries(web_puri PRIVATE <ライブラリ名>)

# Emscripten 環境でのみ設定を適用
if(EMSCRIPTEN)
    # --- デバッグ時の設定 ---
    # デバッグビルドでは、例外とアサーションを有効にし、最適化を無効(-O0)にする
    set(DEBUG_LINK_FLAGS 
        "-s DISABLE_EXCEPTION_CATCHING=0" 
        "-s ASSERTIONS=2" 
        "-O0"
    )
    
    # --- リリース時の設定 ---
    # リリースビルドでは、例外処理を無効化（サイズ削減）、LTOを有効化し、-O3で最適化
    set(RELEASE_LINK_FLAGS 
        "-s DISABLE_EXCEPTION_CATCHING=1" 
        "-flto" 
        "-O3"
        "--closure 1" # JSグルーコードの圧縮
    )

    # --- オプションの適用 ---
    # target_link_options を使って、ビルドタイプごとに異なるフラグを適用
    target_link_options(web_puri PRIVATE
        # config属性でビルドタイプを指定
        "$<$<CONFIG:Debug>:${DEBUG_LINK_FLAGS}>"
        "$<$<CONFIG:Release>:${RELEASE_LINK_FLAGS}>"
        "$<$<CONFIG:RelWithDebInfo>:${RELEASE_LINK_FLAGS}>" # デバッグ情報付きリリースも同様に扱う
        "$<$<CONFIG:MinSizeRel>:${RELEASE_LINK_FLAGS}>"     # 最小サイズリリースも同様に扱う
    )
    
    # コンパイルオプションも同様に設定可能
    target_compile_options(web_puri PRIVATE
        "$<$<CONFIG:Debug>:-O0>"
        "$<$<CONFIG:Release>:-O3;-flto>"
        "$<$<CONFIG:RelWithDebInfo>:-O3;-flto>"
        "$<$<CONFIG:MinSizeRel>:-Oz>" # サイズ最小化オプション
    )

endif()