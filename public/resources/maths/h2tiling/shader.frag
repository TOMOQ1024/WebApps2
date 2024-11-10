precision mediump float;

varying vec2 vPosition;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;
uniform float A;
uniform float B;
uniform float C;
const int wythoff_index = 2;
#define PI 3.1415926535
#define EP (1E-4)
#define DX vec2(EP,0)
#define DY vec2(0, EP)
#define COL0 vec4(1.,.8,.8,1.)
#define COL1 vec4(.8,1.,.8,1.)
#define COL2 vec4(.8,.8,1.,1.)
#define WHITE vec4(vec3(1.), 1.)
#define BLACK vec4(vec3(0.), 1.)

float hi(vec2 p, vec2 q) {
  return q.y * (dot(p, p) + 1.) - p.y * (dot(q, q) + 1.);
}

float hj(vec2 p, vec2 q) {
  return p.x * (dot(q, q) + 1.) - q.x * (dot(p, p) + 1.);
}

float hk(vec2 p, vec2 q) {
  return p.x * q.y - p.y * q.x;
}

float hLine(vec2 p, vec2 q, vec2 v) {
  return hk(p, q) * (dot(v, v) + 1.) - dot(vec2(hi(p, q), hj(p, q)), v);
}

float hAngle(vec2 p, vec2 q, vec2 r) {
  float i1 = hi(p, q);
  float j1 = hj(p, q);
  float k1 = hk(p, q);
  float i2 = hi(q, r);
  float j2 = hj(q, r);
  float k2 = hk(q, r);
  float rtn = acos((i1 * i2 + j1 * j2 - 4. * k1 * k2) /
    sqrt(i1 * i1 + j1 * j1 - 4. * k1 * k1) /
    sqrt(i2 * i2 + j2 * j2 - 4. * k2 * k2));
  return 1. / (.5 - abs(rtn / PI - .5));
}

vec2 hMirror(vec2 p, vec2 q, vec2 v) {
  float i = hi(p, q);
  float j = hj(p, q);
  float k = hk(p, q);
  vec2 c = vec2(i, j);

  if(k == 0.)
    return v - 2. * dot(c, v) / dot(c, c) * c;

  vec2 d = 2. * k * v - c;
  float dd = dot(d, d);
  return ((dot(c, c) - 4. * k * k) * d + dd * c) / (2. * k * dd);
}

// bool E(vec2 p) {
//   if(p.y < 0.)
//     return false;
//   if(p.x * sin(PI / A) - p.y * cos(PI / A) < 0.)
//     return false;
//   if(distance(p, C) < R) {
//     return false;
//   }
//   return true;
// }

// vec2 I(vec2 p) {
//   if(p.y < 0.)
//     return vec2(p.x, -p.y);
//   if(p.x * sin(PI / A) - p.y * cos(PI / A) < 0.)
//     return vec2(p.xy - 2. * (sin(PI / A) * p.x - cos(PI / A) * p.y) * vec2(sin(PI / A), -cos(PI / A)));
//   if(distance(p.xy, C) < R) {
//     return vec2(R * R / dot(p.xy - C, p.xy - C) * (p.xy - C) + C);
//   }
//   return p;
// }

float val0B(vec2 x) {
  return hAngle(vec2(0, 0), vec2(x.x, 0), x.y * vec2(cos(PI / A), sin(PI / A))) - B;
}

float val0C(vec2 x) {
  return hAngle(vec2(x.x, 0), x.y * vec2(cos(PI / A), sin(PI / A)), vec2(0, 0)) - C;
}

vec2 gAddM(vec2 p, vec2 q) {
  return ((1. + 2. * dot(p, q) + dot(q, q)) * p + (1. - dot(p, p)) * q) / (1. + 2. * dot(p, q) + dot(p, p) * dot(q, q));
}

float tanh(float val) {
  float tmp = exp(val);
  float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);
  return tanH;
}

float gTan(float x) {
  return tanh(x);
}

float gAtan(float x) {
  return log((1. + x) / (1. - x)) / 2.;
}

vec2 gMulM(float r, vec2 p) {
  if(r * length(p) == 0.)
    return vec2(0, 0);
  return gTan(r * gAtan(length(p))) * normalize(p);
}

vec2 gMix(vec2 p, vec2 q, float t) {
  return gAddM(p, gMulM(t, gAddM(-p, q)));
}

float gDist(vec2 p, vec2 q) {
  return 2. * gAtan(length(gAddM(-p, q)));
}

float val2A(vec2 a, vec2 b, vec2 c, float x) {
  vec2 p = gMix(b, c, x);
  float s = hAngle(p, gMix(p, hMirror(a, b, p), .5), a) - 2.;
  float t = hAngle(p, gMix(p, hMirror(c, a, p), .5), a) - 2.;
  float u = gDist(p, hMirror(a, b, p)) - gDist(p, hMirror(c, a, p));
  return s * s + t * t + u * u;
}

float val2B(vec2 a, vec2 b, vec2 c, float x) {
  vec2 p = gMix(c, a, x);
  float s = hAngle(p, gMix(p, hMirror(b, c, p), .5), b) - 2.;
  float t = hAngle(p, gMix(p, hMirror(a, b, p), .5), b) - 2.;
  float u = gDist(p, hMirror(b, c, p)) - gDist(p, hMirror(a, b, p));
  return s * s + t * t + u * u;
}

float val2C(vec2 a, vec2 b, vec2 c, float x) {
  vec2 p = gMix(a, b, x);
  float s = hAngle(p, gMix(p, hMirror(c, a, p), .5), c) - 2.;
  float t = hAngle(p, gMix(p, hMirror(b, c, p), .5), c) - 2.;
  float u = gDist(p, hMirror(c, a, p)) - gDist(p, hMirror(b, c, p));
  return s * s + t * t + u * u;
}

void main() {
  float f, g, fx, fy, gx, gy, df;
  vec2 p = vec2(vPosition * uResolution / min(uResolution.x, uResolution.y)) - EP;// 誤差によるガタつきを軽減するため，微小な値を引いている

  // generate unit triangle
  vec2 x = vec2(1.) - EP * 20.;
  vec2 a = vec2(0, 0);
  vec2 b = vec2(x.x, 0);
  vec2 c = x.y * vec2(cos(PI / A), sin(PI / A));
  for(int i = 0; i < 20; i++) {
    f = val0B(x);
    g = val0C(x);
    fx = (val0B(x + DX) - f) / EP;
    fy = (val0B(x + DY) - f) / EP;
    gx = (val0C(x + DX) - g) / EP;
    gy = (val0C(x + DY) - g) / EP;
    x -= vec2(gy * f - fy * g, fx * g - gx * f) / (fx * gy - fy * gx);
    b = vec2(x.x, 0);
    c = x.y * vec2(cos(PI / A), sin(PI / A));
  }

  // Beltrami-Klein Model
  // p /= sqrt(1. - dot(p, p)) + 1.;

  if(length(p) > 1.) {
    gl_FragColor = vec4(0., 0., 0., 1.);
    return;
  }

  // mirror
  vec2 q;
  for(float i = 0.; i < 10./* input iteration limit here */; i++) {
    if(0. > hLine(c, a, p)) {
      p = hMirror(c, a, p);
    } else if(0. > hLine(a, b, p)) {
      p = hMirror(a, b, p);
    } else if(0. > hLine(b, c, p)) {
      p = hMirror(b, c, p);
    } else {
      // color
      float y = .5;
      if(wythoff_index == 0) {
        gl_FragColor = vec4(mod(i, 2.));
      } else if(wythoff_index == 1) {
        gl_FragColor = vec4(hLine(a, hMirror(b, c, a), p) < 0. ? 1. : 0.);
      } else if(wythoff_index == 2) {
        gl_FragColor = vec4(hLine(b, hMirror(c, a, b), p) < 0. ? 1. : 0.);
      } else if(wythoff_index == 3) {
        gl_FragColor = vec4(hLine(c, hMirror(a, b, c), p) < 0. ? 1. : 0.);
      } else if(wythoff_index == 4) {
        for(int j = 0; j < 10; j++) {
          f = val2A(a, b, c, y);
          df = (val2A(a, b, c, y + EP) - f) / EP;
          y -= f / df;
        }
        q = gMix(b, c, y);
        if(hLine(q, hMirror(a, b, q), p) * hLine(q, hMirror(a, b, q), b) > 0.)
          gl_FragColor = COL0;
        else if(hLine(q, hMirror(c, a, q), p) * hLine(q, hMirror(c, a, q), c) > 0.)
          gl_FragColor = COL1;
        else
          gl_FragColor = COL2;
      } else if(wythoff_index == 5) {
        for(int j = 0; j < 10; j++) {
          f = val2B(a, b, c, y);
          df = (val2B(a, b, c, y + EP) - f) / EP;
          y -= f / df;
        }
        q = gMix(c, a, y);
        if(hLine(q, hMirror(b, c, q), p) * hLine(q, hMirror(b, c, q), c) > 0.)
          gl_FragColor = COL0;
        else if(hLine(q, hMirror(a, b, q), p) * hLine(q, hMirror(a, b, q), a) > 0.)
          gl_FragColor = COL1;
        else
          gl_FragColor = COL2;
      } else if(wythoff_index == 6) {
        for(int j = 0; j < 10; j++) {
          f = val2C(a, b, c, y);
          df = (val2C(a, b, c, y + EP) - f) / EP;
          y -= f / df;
        }
        q = gMix(a, b, y);
        if(hLine(q, hMirror(c, a, q), p) * hLine(q, hMirror(c, a, q), a) > 0.)
          gl_FragColor = COL0;
        else if(hLine(q, hMirror(b, c, q), p) * hLine(q, hMirror(b, c, q), b) > 0.)
          gl_FragColor = COL1;
        else
          gl_FragColor = COL2;
      } else {
        gl_FragColor = vec4(0.);
      }
      gl_FragColor.a = 1.;
      break;
    }
  }
  if(abs(hLine(a, b, p)) < .001)
    gl_FragColor = WHITE;
  if(abs(hLine(b, c, p)) < .001)
    gl_FragColor = WHITE;
  if(abs(hLine(c, a, p)) < .001)
    gl_FragColor = WHITE;
  // if(distance(p, q) < .01)
  //   gl_FragColor = vec4(0., 0., 0., 1.);

  return;
}
