export const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec2 uResolution;
uniform float uRadius;
varying vec2 vUv;

// 関数アート：数学関数による美しいパターン
float functionArt(vec2 p) {
  float t = uTime * 0.5;
  float r = length(p);
  float theta = atan(p.y, p.x);
  
  // 複数の数学関数を組み合わせ
  float wave1 = sin(r * 8.0 - t * 2.0) * 0.5;
  float wave2 = cos(theta * 6.0 + t) * 0.3;
  float spiral = sin(r * 4.0 + theta * 3.0 - t) * 0.4;
  
  return wave1 + wave2 + spiral;
}

// フラクタル図形：マンデルブロ集合風
float fractalPattern(vec2 p) {
  vec2 z = p * 2.0;
  vec2 c = p * 1.5 + vec2(sin(uTime * 0.1), cos(uTime * 0.15)) * 0.3;
  
  float iterations = 0.0;
  for(int i = 0; i < 32; i++) {
    if(length(z) > 2.0) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iterations += 1.0;
  }
  
  return iterations / 32.0;
}

// 空間充填：ボロノイ図風パターン
float spaceFilling(vec2 p) {
  vec2 grid = floor(p * 8.0);
  vec2 f = fract(p * 8.0);
  
  float minDist = 1.0;
  for(int y = -1; y <= 1; y++) {
    for(int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = neighbor + sin(grid + neighbor + uTime * 0.3) * 0.5 + 0.5;
      float dist = length(f - point);
      minDist = min(minDist, dist);
    }
  }
  
  return minDist;
}

// 非ユークリッド幾何学：双曲面タイリング風
float hyperbolicGeometry(vec2 p) {
  float r = length(p);
  if(r > 0.95) return 0.0; // 境界処理
  
  // 双曲面座標変換
  vec2 h = p / (1.0 - r * r + 0.01);
  
  // 双曲面タイリングパターン
  float scale = 6.0;
  vec2 grid = h * scale;
  vec2 id = floor(grid);
  vec2 f = fract(grid) - 0.5;
  
  float pattern = 0.0;
  // 複数の格子パターンを重ね合わせ
  for(int i = 0; i < 3; i++) {
    float angle = float(i) * 2.094395; // 120度ずつ回転
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 rotated = rot * f;
    pattern += abs(sin(rotated.x * 3.14159)) * abs(cos(rotated.y * 3.14159));
  }
  
  return pattern * (1.0 - r * r); // 境界で減衰
}

void main() {
  // 画面中心を原点とした正規化座標
  vec2 uv = (vUv - 0.5) * 2.0; // -1.0 to 1.0
  
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
  float stage = scrollNorm * 3.0; // 0-3の範囲
  
  float pattern = 0.0;
  
  if (stage <= 1.0) {
    // 関数アート → フラクタル図形
    pattern = mix(functionArt(p), fractalPattern(p), stage);
  } else if (stage <= 2.0) {
    // フラクタル図形 → 空間充填
    pattern = mix(fractalPattern(p), spaceFilling(p), stage - 1.0);
  } else {
    // 空間充填 → 非ユークリッド幾何学
    pattern = mix(spaceFilling(p), hyperbolicGeometry(p), stage - 2.0);
  }
  
  // 白黒のカラーパレット
  float intensity = smoothstep(-0.2, 0.2, pattern);
  vec3 color = vec3(intensity);
  
  // 境界での自然な減衰
  float boundary = 1.0 - smoothstep(uRadius * 0.8, uRadius, length(p));
  color *= boundary;
  
  gl_FragColor = vec4(color, 1.0);
}
`;
