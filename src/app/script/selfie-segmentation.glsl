// selfie-segmentation.glsl
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_threshold;
uniform vec2 u_textureSize;

// シェーダー本体：アルファ値からマスク境界だけを白く描画
void main() {
  float alpha = texture2D(u_image, v_texCoord).a;
  float mask = alpha > u_threshold ? 1.0 : 0.0;

  // 隣接ピクセル比較でエッジ検出
  vec2 onePixel = 1.0 / u_textureSize;
  float left = texture2D(u_image, v_texCoord - vec2(onePixel.x, 0)).a > u_threshold ? 1.0 : 0.0;
  float right = texture2D(u_image, v_texCoord + vec2(onePixel.x, 0)).a > u_threshold ? 1.0 : 0.0;
  float up = texture2D(u_image, v_texCoord - vec2(0, onePixel.y)).a > u_threshold ? 1.0 : 0.0;
  float down = texture2D(u_image, v_texCoord + vec2(0, onePixel.y)).a > u_threshold ? 1.0 : 0.0;

  // 周囲すべてマスク内なら非境界
  float edge = mask * (1.0 - left * right * up * down);
  gl_FragColor = vec4(edge, edge, edge, 1.0);
}