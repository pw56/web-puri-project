cmake_minimum_required(VERSION 3.16)

# プロジェクト名と使用言語
project(web_puri_project LANGUAGES CXX)

# C++ 標準の指定
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ソースコードを src ディレクトリから取得
file(GLOB_RECURSE SOURCES
    "${CMAKE_SOURCE_DIR}./*.cpp"
    "${CMAKE_SOURCE_DIR}./*.c"
)

# 実行ファイルの生成
add_executable(web_puri ${SOURCES})

set_target_properties(web_puri PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}./build"
)

# インクルードディレクトリの追加
target_include_directories(web_puri PRIVATE
    "${CMAKE_SOURCE_DIR}./src"
)

# 必要ならライブラリをリンク
# target_link_libraries(web_puri PRIVATE <ライブラリ名>)
