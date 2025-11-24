cmake_minimum_required(VERSION 3.16)

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

if("${CMAKE_BUILD_TYPE}" STREQUAL "Debug")
    # Debug ビルドの場合のオプション
    target_compile_options(web_puri PRIVATE "-O0" "-g")
    target_link_options(web_puri PRIVATE "-O0" "-s ASSERTIONS=2")

elseif("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
    # Release ビルドの場合のオプション
    target_compile_options(web_puri PRIVATE "-O3" "-flto")
    target_link_options(web_puri PRIVATE "-O3" "-flto" "--closure 1")

else()
    # 他のビルドタイプ (MinSizeRel, RelWithDebInfoなど) のデフォルト設定
    # 必要に応じて追加設定を記述
endif()