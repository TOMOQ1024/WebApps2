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

// 逆双曲線関数
float arsinh(float x) {
  return log(x + sqrt(x * x + 1.));
}

float arcosh(float x) {
  return log(x + sqrt(x * x - 1.));
}

float artanh(float x) {
  return 0.5 * log((1. + x) / (1. - x));
}

float arcoth(float x) {
  return 0.5 * log((x + 1.) / (x - 1.));
}

float arsech(float x) {
  return log((1. + sqrt(1. - x * x)) / x);
}

float arcsch(float x) {
  return log(1. / x + sqrt(1. / (x * x) + 1.));
}

// 逆余割三角関数
float arccot(float x) {
  return atan(1. / x);
}

float arcsec(float x) {
  return acos(1. / x);
}

float arccsc(float x) {
  return asin(1. / x);
}
`;
