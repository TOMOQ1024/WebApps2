export const mathFunctionShader = /* glsl */ `
const float PI = 3.14159265359;
const float E = 2.71828182846;

float sec(float x) {
  return 1. / cos(x);
}

float csc(float x) {
  return 1. / sin(x);
}

float cot(float x) {
  return 1. / tan(x);
}

float sech(float x) {
  return 1. / cosh(x);
}

float csch(float x) {
  return 1. / sinh(x);
}

float coth(float x) {
  return 1. / tanh(x);
}
`;
