export const complexFunctionShader = /* glsl */ `
const float PI = 3.14159265359;
const float E = 2.71828182846;

vec2 d2p(vec2 z) {
  return vec2(length(z), atan(z.y, z.x));
}

vec2 p2d(vec2 z) {
  return max(z.x, 1e-38) * vec2(cos(z.y), sin(z.y));
}

vec2 p2d(float x, float y) {
  return max(x, 1e-38) * vec2(cos(y), sin(y));
}

vec2 cre(vec2 z) {
  return vec2(z.x, 0.);
}

vec2 cim(vec2 z) {
  return vec2(z.y, 0.);
}

vec2 cexp(vec2 z) {
  return p2d(exp(z.x), z.y);
}

vec2 csq(vec2 z) {
  return vec2(z.x * z.x - z.y * z.y, 2. * z.x * z.y);
}

vec2 cprod(vec2 z, vec2 w) {
  return vec2(z.x * w.x - z.y * w.y, z.x * w.y + z.y * w.x);
}

vec2 cdiv(vec2 z, vec2 w) {
  return vec2(z.x * w.x + z.y * w.y, z.y * w.x - z.x * w.y) / (w.x * w.x + w.y * w.y);
}

vec2 cpow(vec2 z, vec2 w) {
  if(length(z) == 0.)
    return vec2(0., 0.);
  vec2 Z = d2p(z);
  return cprod(p2d(pow(Z.x, w.x), Z.y * w.x), p2d(cosh(Z.y * w.y) - sinh(Z.y * w.y), w.y * log(Z.x)));
}

vec2 cconj(vec2 z) {
  return vec2(z.x, -z.y);
}

vec2 ccos(vec2 z) {
  return vec2(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y));
}

vec2 csin(vec2 z) {
  return vec2(sin(z.x) * cosh(z.y), -cos(z.x) * sinh(z.y));
}

vec2 ctan(vec2 z) {
    float cx = cos(z.x);
    float cy = cosh(z.y);
    float sx = sin(z.x);
    float sy = sinh(z.y);
    
    vec2 sin_z = vec2(sx * cy, cx * sy);
    
    vec2 cos_z = vec2(cx * cy, -sx * sy);
    
    float denominator = cos_z.x * cos_z.x + cos_z.y * cos_z.y;
    return vec2(
        (sin_z.x * cos_z.x + sin_z.y * cos_z.y) / denominator,
        (sin_z.y * cos_z.x - sin_z.x * cos_z.y) / denominator
    );
}

vec2 ccot(vec2 z) {
    float cx = cos(z.x);
    float cy = cosh(z.y);
    float sx = sin(z.x);
    float sy = sinh(z.y);
    
    vec2 sin_z = vec2(sx * cy, cx * sy);
    
    vec2 cos_z = vec2(cx * cy, -sx * sy);
    
    float denominator = sin_z.x * sin_z.x + sin_z.y * sin_z.y;
    return vec2(
        (cos_z.x * sin_z.x + cos_z.y * sin_z.y) / denominator,
        (cos_z.y * sin_z.x - cos_z.x * sin_z.y) / denominator
    );
}

vec2 csec(vec2 z) {
  float cx = cos(z.x);
  float cy = cosh(z.y);
  float sx = sin(z.x);
  float sy = sinh(z.y);
  
  vec2 cos_z = vec2(cx * cy, -sx * sy);
  
  float denominator = cos_z.x * cos_z.x + cos_z.y * cos_z.y;
  return vec2(cos_z.x, -cos_z.y) / denominator;
}

vec2 ccsc(vec2 z) {
  float cx = cos(z.x);
  float cy = cosh(z.y);
  float sx = sin(z.x);
  float sy = sinh(z.y);
  
  vec2 sin_z = vec2(sx * cy, cx * sy);
  
  float denominator = sin_z.x * sin_z.x + sin_z.y * sin_z.y;
  return vec2(sin_z.x, -sin_z.y) / denominator;
}

vec2 ccosh(vec2 z) {
  return vec2(cosh(z.x) * cos(z.y), sinh(z.x) * sin(z.y));
}

vec2 csinh(vec2 z) {
  return vec2(sinh(z.x) * cos(z.y), cosh(z.x) * sin(z.y));
}

vec2 ctanh(vec2 z) {
  return cdiv(csinh(z), ccosh(z));
}

vec2 ccoth(vec2 z) {
  return cdiv(ccosh(z), csinh(z));
}

vec2 csech(vec2 z) {
  return cdiv(vec2(1.0, 0.0), ccosh(z));
}

vec2 ccsch(vec2 z) {
  return cdiv(vec2(1.0, 0.0), csinh(z));
}

vec2 cabs(vec2 z) {
  return vec2(length(z), 0.);
}

vec2 carg(vec2 z) {
  return vec2(atan(z.y, z.x), 0.);
}

vec2 clog(vec2 z) {
  if(length(z) == 0.)
    return vec2(-1e20, 0.);
  return vec2(log(length(z)), atan(z.y, z.x));
}

vec2 csqrt(vec2 z) {
  return cpow(z, vec2(.5, 0.));
}

vec2 ccbrt(vec2 z) {
  return cpow(z, vec2(1. / 3., 0.));
}

vec2 cmix(vec2 z, vec2 w, vec2 t) {
  return mix(z, w, t.x);
}

vec2 cfloor(vec2 z) {
  return vec2(floor(z.x), floor(z.y));
}

vec2 cround(vec2 z) {
  return vec2(floor(z.x + .5), floor(z.y + .5));
}

vec2 cceil(vec2 z) {
  return vec2(ceil(z.x), ceil(z.y));
}
`;
