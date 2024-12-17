in vec2 vTexCoord;
in vec2 vPosition;
out vec4 finalColor;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

#define MAX_STEPS 50
#define MAX_DIST 5.
#define SURF_DIST 1e-4

#define PI 3.1415926535

const float ma = 2.;
const float mb = 3.;
const float mc = 5.;
const vec3 ni = vec3(1, 1, 1);

const float aa = PI / ma;
const float ab = PI / mb;
const float ac = PI / mc;

const float c = acos((cos(aa) * cos(ab) + cos(ac)) / (sin(aa) * sin(ab)));
const float b = asin(sin(c) / sin(ac) * sin(ab));

float t = mod(uTime / 2., 6.);
mat3 R = mat3(cos(t / 6. * PI), -sin(t / 6. * PI), 0., sin(t / 6. * PI), cos(t / 6. * PI), 0., 0., 0., 1.);
vec3 A = R * vec3(1, 0, 0);
vec3 B = R * vec3(cos(c), sin(c), 0);
vec3 C = R * vec3(cos(b), 0, sin(b));

float a = acos(dot(A, B));

vec3 Ma = normalize(cross(B, C));
vec3 Mb = normalize(cross(C, A));
vec3 Mc = normalize(cross(A, B));
// #define Q vec3(-1., -.5, .5)
// #define Q vec3(0., 0., .5)
// #define Q vec3(-.4, .2, .7)
// #define Q cross(Mc,Mb)
// #define Q cross(Ma,Mc)
// #define Q cross(Mb,Ma)
// float tss0 = clamp(0.,uMouse.y/uResolution.y*1.2-.1,1.);
// float tss1 = clamp(0.,uMouse.x/uResolution.x*1.2-.1,1.);
float tss0 = clamp(0., 2. - abs(mod(t - 1.5, 6.) - 2.), 1.);
float tss1 = clamp(0., 2. - abs(mod(t, 6.) - 2.), 1.);
vec3 Q = normalize(mix(A, mix(B, C, tss0), tss1));
// const vec3 Q = normalize(A+B+C);

vec3 rfl(vec3 p, vec3 q) {
  return p - 2. * dot(p, q) * q;
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdCylinder(vec3 p, vec3 a, float r) {
  return length(p - dot(p, a) * a) - r;
}

float sdFaces(vec3 p) {
  // return 999.;
  for(int i = 0; i < 20; i++) {
    if(dot(p, Ma) < 0.)
      p = rfl(p, Ma);
    else if(dot(p, Mb) < 0.)
      p -= 2. * dot(p, Mb) * Mb;
    else if(dot(p, Mc) < 0.)
      p -= 2. * dot(p, Mc) * Mc;
    else
      break;
  }

  vec3 Qa = rfl(Q, Ma);
  vec3 Qb = rfl(Q, Mb);
  vec3 Qc = rfl(Q, Mc);
  vec3 Qab = rfl(Qa, Mb);
  vec3 Qac = rfl(Qa, Mc);
  vec3 Qbc = rfl(Qb, Mc);
  vec3 Qba = rfl(Qb, Ma);
  vec3 Qca = rfl(Qc, Ma);
  vec3 Qcb = rfl(Qc, Mb);

  float s = .98;
  float fa = dot(Q * s - p, cross(Qbc - Qb, Qcb - Qc));
  float fb = dot(Q * s - p, cross(Qca - Qc, Qac - Qa));
  float fc = dot(Q * s - p, cross(Qab - Qa, Qba - Qb));

  return max(fa, max(fb, fc));
}

float getDist(vec3 p) {
  for(int i = 0; i < 20; i++) {
    if(dot(p, Ma) < 0.)
      p = rfl(p, Ma);
    else if(dot(p, Mb) < 0.)
      p -= 2. * dot(p, Mb) * Mb;
    else if(dot(p, Mc) < 0.)
      p -= 2. * dot(p, Mc) * Mc;
    else
      break;
  }

  float d = 99.;
  d = sdSphere(p - Q, 2e-2);
  // d = min(d, max(sdCylinder(p - Q, Ma, 1e-2), dot(p - Q, Ma)));
  // d = min(d, max(sdCylinder(p - Q, Mb, 1e-2), dot(p - Q, Mb)));
  // d = min(d, max(sdCylinder(p - Q, Mc, 1e-2), dot(p - Q, Mc)));

  d = min(d, sdFaces(p));
  return d;
}

float rayMarch(vec3 ro, vec3 rd) {
  float dO = 0.;

  for(int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;
    float dS = getDist(p);
    dO += dS;
    if(dO > MAX_DIST || dS < SURF_DIST)
      break;
  }

  return dO;
}

void main() {
  vec2 uv = (vPosition - .5) * 2.;
  if(max(abs(uv.x), abs(uv.y)) > .99) {
    finalColor = vec4(1., 1., 1., 1.);
    return;
  }
  if(max(abs(uv.x), abs(uv.y)) > .85) {
    finalColor = vec4(.2, .2, .2, 1.);
    return;
  }

  vec3 col = vec3(0);

  vec3 ro = vec3(.5, 3., .2);
  vec3 rd = normalize(vec3(uv.x, .1, uv.y) * 1.3 - ro);

  float d = rayMarch(ro, rd);
  mat3 G = mat3(.3, .3, .3, .3, .3, .3, .3, .3, .3);

  if(d < MAX_DIST) {
    vec3 p = ro + rd * d;

    float dif = 2.4 - d / MAX_DIST * 3.;
    // 	col = normalize(p)/2.+.5;
    // if()
    // col = vec3(1., 1., 1.);
    // col *= dif + .3;
    float dx = getDist(p + vec3(1e-3, 0., 0.));
    float dy = getDist(p + vec3(0., 1e-3, 0.));
    float dz = getDist(p + vec3(0., 0., 1e-3));
    col = vec3(dot(normalize(vec3(dx, dy, dz)), normalize(vec3(1., 1., 1.))));
    col = col * .8 + .2;
    // if(sdFaces(p) < 2e-3) col = G*col * .8;
  }

  // col = pow(col, vec3(.4545));	// gamma correction

  finalColor = vec4(col, 1.0);
}