#version 300 es
in vec2 vPosition;
out vec4 finalColor;

uniform float uTime;

#define MAX_ITERATIONS 6

vec2 r(vec2 v) {
  float x = abs(v.x);
  float y = abs(v.y);

  return vec2(min(x, y), max(x, y));
}

void main() {
  float a = 1.f / (3.f + sin(uTime / 2.f));
  // float a = sqrt(2.f) - 1.f;
  // float a = (3.-sqrt(5.))/2.;
  // float a = 1./3.;

  vec3[] O = vec3[](vec3(1.f - a, 1.f - a, a), vec3(0.f, 2.f * a, 1.f - 2.f * a));

  vec2 P = r(vPosition * 2.f - 1.f);

  int maxBits = 1 << MAX_ITERATIONS;

  for(int bits = 0; bits < maxBits; bits++) {
    vec2 currentP = P;
    bool validPath = true;

    for(int depth = 0; depth < MAX_ITERATIONS; depth++) {
      int idx = (bits >> depth) & 1;

      currentP = r((currentP - O[idx].xy) / O[idx].z);

      if(currentP.y > 1.f) {
        validPath = false;
        break;
      }
    }

    if(validPath) {
      finalColor = vec4(0);
      return;
    }
  }

  finalColor = vec4(1);
}
