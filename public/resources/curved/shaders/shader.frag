precision mediump float;
varying vec2 vPosition;
uniform vec2 uResolution;

void main () {
  vec2 c = gl_FragCoord.xy/uResolution;
  gl_FragColor = vec4(c.x, c.y, 0., 1.);
}
