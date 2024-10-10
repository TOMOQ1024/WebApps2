precision mediump float;
const float PI = 3.14159265359;
const float E = 2.71828182846;
varying vec2 vPosition;
uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
  gl_FragColor = vec4(0., 0., sin(uTime) / 2. + .5, 1.);
}
