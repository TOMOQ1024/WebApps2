export const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec2 uResolution;
uniform float uRadius;
varying vec2 vUv;

float functionArt(vec2 p) {
  float t = uTime * 0.5;
  float r = length(p);
  float theta = atan(p.y, p.x);
  
  float wave1 = sin(r * 8.0 - t * 2.0) * 0.5;
  float wave2 = cos(theta * 6.0 + t) * 0.3;
  float spiral = sin(r * 4.0 + theta * 3.0 - t) * 0.4;
  
  return wave1 + wave2 + spiral;
}

float fractalPattern(vec2 p) {
  vec2 z = vec2(0.0, 0.0);
  vec2 c = p * 2.0;
  // vec2 c = p * 1.5 + vec2(sin(uTime * 0.1), cos(uTime * 0.15)) * 0.3;
  
  float iterations = 0.0;
  for(int i = 0; i < 32; i++) {
    if(length(z) > 2.0) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iterations += 1.0;
  }
  
  return pow(iterations / 32.0, 2.0);
}

void main() {
  // 画面中心を原点とした正規化座標
  vec2 uv = (vUv - 0.5) * 64.0; // -1.0 to 1.0
  
  // アスペクト比を考慮
  float aspect = uResolution.x / uResolution.y;
  if(aspect > 1.0) {
    uv.x *= aspect;
  } else {
    uv.y /= aspect;
  }
  
  // 半径uRadiusでスケール
  vec2 p = uv / uRadius;
  
  // スクロール量に応じて連続的にパターンを変化
  float scrollNorm = clamp(uScroll / 4000.0, 0.0, 1.0);
  float stage = mod(uTime * 0.01, 3.0); // 0-3の範囲
  
  float pattern = 0.0;

  pattern = fractalPattern(p);
  
  // 白黒のカラーパレット
  float intensity = pattern;
  vec3 color = vec3(intensity);
  
  // 境界での自然な減衰
  float boundary = 1.0 - smoothstep(uRadius * 0.8, uRadius, length(p));
  color *= boundary;

  float alpha = 0.3;
  
  gl_FragColor = vec4(color, alpha);
}
`;
