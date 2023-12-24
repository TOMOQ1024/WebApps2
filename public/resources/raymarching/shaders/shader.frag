precision mediump float;
const float PI = 3.14159265358979;
const float MINDIST = 1e-2;
const float MAXDIST = 1e+2;
varying vec2 vPosition;
uniform vec2 uResolution;
struct Camera {
  vec3 position;
  vec2 angle;
  vec2 view;
};
uniform Camera uCamera;

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct HitInfo {
  float dist;
  int index;
};

// 補間関数
float interpolate(float a, float b, float x){
    float f = (1.0 - cos(x * PI)) * 0.5;
    return a * (1.0 - f) + b * f;
}

// https://wgld.org/d/glsl/g007.html
// 乱数生成
float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}

// 補間乱数
float irnd(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec4 v = vec4(rnd(vec2(i.x,       i.y      )),
                  rnd(vec2(i.x + 1.0, i.y      )),
                  rnd(vec2(i.x,       i.y + 1.0)),
                  rnd(vec2(i.x + 1.0, i.y + 1.0)));
    return interpolate(interpolate(v.x, v.y, f.x), interpolate(v.z, v.w, f.x), f.y);
}

// ノイズ生成
float noise(vec2 p){
    float t = 0.0;
    for(int i = 0; i < 8; i++){
        float freq = pow(2.0, float(i));
        float amp  = pow(.5, float(8 - i));
        t += irnd(vec2(p.x / freq, p.y / freq)) * amp;
    }
    return t;
}

// シームレスノイズ生成
float snoise(vec2 p, vec2 q, vec2 r){
    return noise(vec2(p.x,       p.y      )) *        q.x  *        q.y  +
           noise(vec2(p.x,       p.y + r.y)) *        q.x  * (1.0 - q.y) +
           noise(vec2(p.x + r.x, p.y      )) * (1.0 - q.x) *        q.y  +
           noise(vec2(p.x + r.x, p.y + r.y)) * (1.0 - q.x) * (1.0 - q.y);
}




float sdPlane (vec3 p, vec3 n, float s) {
  return dot(n, p) - s;
}

float sdSphere (vec3 p, vec3 c, float r) {
  return distance(c, p) - r;
}

float sdCube (vec3 p, vec3 c, float r) {
  vec3 q = abs(p - c) - r;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdBox (vec3 p, vec3 c, vec3 b) {
  vec3 q = abs(p - c) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdOcta (vec3 p, vec3 c, float r) {
  return dot(normalize(vec3(1.)), abs(p-c)) - r;
}

float sdTrHexa (vec3 p, vec3 c, float r) {
  return max(
    sdOcta(p, c, r / sqrt(3.) * (sqrt(2.)+1.)),
    sdCube(p, c, r)
  );
}

float sdTrOcta (vec3 p, vec3 c, float r) {
  return max(
    sdOcta(p, c, r * sqrt(3.) / 2.),
    sdCube(p, c, r)
  );
}

float sdCubOcta (vec3 p, vec3 c, float r) {
  return max(
    sdOcta(p, c, r * 2. / sqrt(3.)),
    sdCube(p, c, r)
  );
}

float sdTetra (vec3 p, vec3 c, float r) {
  return 1.;
}

float sMax (float x, float y) {
  return log(exp(x) + exp(y));
}

float sMin (float x, float y) {
  return -log(exp(-x) + exp(-y));
}



HitInfo iter (vec3 p) {
  HitInfo hi = HitInfo(p.y, 0);
  float d;
  // hi.color = 
  // return sdfCube(p, vec3(5., 0., -2.), 3.);
  // return sdfCube(mod(p+3., 6.)-3., vec3(0., 0., 0.), 1.);

  d = sMin(
    sdCube(p, vec3(18., 7., 3.), 3.),
    sdCube(p, vec3(15., 4., -3.), 3.)
  ) - .2;
  if(hi.dist > d) {
    hi.dist = d;
    hi.index = 1;
  }

  d = sMin(
    sdSphere(p, vec3(17., 5., 17.), 4.),
    sdCube(p, vec3(15., 4., 23.), 3.) - .8
  );
  if(hi.dist > d) {
    hi.dist = d;
    hi.index = 2;
  }

  d = sdOcta(p, vec3(17., 5., -15.), 2.);
  if(hi.dist > d) {
    hi.dist = d;
    hi.index = 3;
  }

  d = sdCubOcta(p, vec3(10., 5., -21.), 2.);
  if(hi.dist > d) {
    hi.dist = d;
    hi.index = 3;
  }

  d = sdTrOcta(p, vec3(27., 5., -11.), 2.);
  if(hi.dist > d) {
    hi.dist = d;
    hi.index = 3;
  }

  d = sdTrHexa(p, vec3(29., 5., -18.), 2.);
  if(hi.dist > d) {
    hi.dist = d;
    hi.index = 3;
  }

  d = max(max(
    -sdCube(p, vec3(22., 5., -29.), 3.6),
    sdCube(p, vec3(22., 5., -29.), 4.)
  ),
    -sdOcta(p, vec3(22., 5., -29.), 4.)
  );
  if(hi.dist > d) {
    hi.dist = d;
    hi.index = 3;
  }

  return hi;
}

vec3 norm(vec3 p) {
  vec2 e = vec2(1e-3, 0.);
  return normalize(vec3(
    iter(p+e.xyy).dist,
    iter(p+e.xxy).dist,
    iter(p+e.yyx).dist
  ) - iter(p).dist);
}

HitInfo castRay(inout Ray ray) {
  HitInfo hi;

  for(int i=0; i<200; i++){
    hi = iter(ray.origin);
    if(hi.dist > MAXDIST) break;
    ray.origin += ray.direction * hi.dist;
    if(hi.dist < MINDIST) return hi;
  }

  return hi;
}


void main () {
  vec3 cF = vec3(
    cos(uCamera.angle.y) * cos(uCamera.angle.x),
    sin(uCamera.angle.y),
    cos(uCamera.angle.y) * sin(uCamera.angle.x)
  );
  vec3 cU = vec3(
    -sin(uCamera.angle.y) * cos(uCamera.angle.x),
    cos(uCamera.angle.y),
    -sin(uCamera.angle.y) * sin(uCamera.angle.x)
  );
  vec3 cL = vec3(
    -sin(uCamera.angle.x),
    0,
    cos(uCamera.angle.x)
  );
  vec2 p = vPosition * uResolution / min(uResolution.x, uResolution.y) * uCamera.view / 2.;
  vec3 light = normalize(vec3(-3., 2., 1.));

  Ray ray = Ray(
    vec3(uCamera.position),
    normalize(cF + cL*p.x + cU*p.y)
  );


  HitInfo hi = castRay(ray);
  if(hi.dist < MINDIST) {
    vec4 baseColor = vec4(vec3((dot(norm(ray.origin), light)+1.)/2.), 1.);
    Ray toLight = Ray(ray.origin - ray.direction * MINDIST * 2., light);
    HitInfo hi2l = castRay(toLight);

    if(hi.index == 0){
      float m = 25.;
      vec2 t = mod(ray.origin.xz*3., m);
      gl_FragColor = vec4(vec3(.3, 1., .1) * snoise(t, t/m, vec2(m)), 1.);
    }
    else if(hi.index == 1){
      gl_FragColor = vec4(1., 1., .3, 1.) * baseColor;
    }
    else if(hi.index == 2){
      gl_FragColor = vec4(.4, .2, 1., 1.) * baseColor;
    }
    else {
      gl_FragColor = baseColor;
    }

    if(hi2l.dist < MINDIST) {
      gl_FragColor *= vec4(vec3(.5), 1.);
      // gl_FragColor = gl_FragColor * .9 + .1;
    }
  }
  else {
    gl_FragColor = vec4((vPosition+1.)/2., 1., 1.);
  }
}
