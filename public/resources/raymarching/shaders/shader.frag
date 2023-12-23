precision mediump float;
const float PI = 3.14159265358979;
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

vec3 dir(vec2 angle) {
  return vec3(
    cos(angle.y) * cos(angle.x),
    sin(angle.y),
    cos(angle.y) * sin(angle.x)
  );
}


float sdfSphere (vec3 p, vec3 c, float r) {
  return distance(c, p) - r;
}

float sdfCube (vec3 p, vec3 c, float r) {
  vec3 q = abs(p - c) - r;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdfBox (vec3 p, vec3 c, vec3 b) {
  vec3 q = abs(p - c) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sMax (float x, float y) {
  return log(exp(x) + exp(y));
}

float sMin (float x, float y) {
  return -log(exp(-x) + exp(-y));
}

float sdf (vec3 p) {
  // return sdfCube(p, vec3(5., 0., -2.), 3.);
  return sMin(
    sdfCube(p, vec3(18., 3., 3.), 3.),
    sdfCube(p, vec3(15., 0., -3.), 3.)
  );
  // return sMin(
  //   sdfSphere(p, vec3(15., 0., 3.), 3.),
  //   sdfCube(p, vec3(15., 0., -3.), 3.)
  // );
}


void main () {
  float d;
  vec2 view = vec2(PI, PI);
  vec3 light = normalize(vec3(-3., 2., 1.));

  Ray ray = Ray(
    vec3(uCamera.position),
    dir(uCamera.angle + vPosition * uResolution / min(uResolution.x, uResolution.y) * uCamera.view / 2.)
  );

  for(int i=0; i<100; i++){
    d = sdf(ray.origin);
    if(d < 1e-2){
      float h = 1e-3;
      vec3 rx = ray.origin+vec3(h, 0., 0.);
      vec3 ry = ray.origin+vec3(0., h, 0.);
      vec3 rz = ray.origin+vec3(0., 0., h);
      vec3 norm = normalize(vec3(sdf(rx), sdf(ry), sdf(rz)) - d);
      gl_FragColor = vec4(vec3(dot(norm, light)), 1.);
      return;
    }
    ray.origin += ray.direction * d;
  }
  gl_FragColor = vec4((vPosition+1.)/2., 1., 1.);
}
