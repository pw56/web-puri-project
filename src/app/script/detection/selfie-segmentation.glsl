/* 頂点シェーダー */
// 画面全体を覆うポリゴンの頂点座標を受け取ります
attribute vec2 a_position;

// フラグメントシェーダーに渡すテクスチャ座標
varying vec2 v_texCoord;

void main() {
  // 頂点座標をそのまま出力します
  gl_Position = vec4(a_position, 0.0, 1.0);
  // テクスチャ座標を計算します (-1.0~1.0 -> 0.0~1.0)
  v_texCoord = a_position * 0.5 + 0.5;
}


/* フラグメントシェーダー */
precision mediump float;

// メインスレッドから渡されるセグメンテーションマスクのテクスチャ
uniform sampler2D u_maskTexture;
// テクスチャの解像度
uniform vec2 u_textureSize;

// 頂点シェーダーから受け取ったテクスチャ座標
varying vec2 v_texCoord;

void main() {
  // 1ピクセル分のテクスチャ座標における移動量を計算します
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
  
  // 周囲8ピクセルのアルファ値を取得します
  float a00 = texture2D(u_maskTexture, v_texCoord + onePixel * vec2(-1, -1)).a;
  float a10 = texture2D(u_maskTexture, v_texCoord + onePixel * vec2( 0, -1)).a;
  float a20 = texture2D(u_maskTexture, v_texCoord + onePixel * vec2( 1, -1)).a;
  float a01 = texture2D(u_maskTexture, v_texCoord + onePixel * vec2(-1,  0)).a;
  float a21 = texture2D(u_maskTexture, v_texCoord + onePixel * vec2( 1,  0)).a;
  float a02 = texture2D(u_maskTexture, v_texCoord + onePixel * vec2(-1,  1)).a;
  float a12 = texture2D(u_maskTexture, v_texCoord + onePixel * vec2( 0,  1)).a;
  float a22 = texture2D(u_maskTexture, v_texCoord + onePixel * vec2( 1,  1)).a;

  // Sobelフィルターを適用して、縦方向と横方向の輝度変化(勾配)を計算します
  float gx = a00 + 2.0 * a01 + a02 - a20 - 2.0 * a21 - a22;
  float gy = a00 + 2.0 * a10 + a20 - a02 - 2.0 * a12 - a22;

  // 勾配の大きさを計算します
  float magnitude = sqrt(gx * gx + gy * gy);

  // 勾配が一定のしきい値を超えていれば「エッジ」とみなし、ピクセルを白で描画します
  if (magnitude > 0.25) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // 白
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // 黒
  }
}
