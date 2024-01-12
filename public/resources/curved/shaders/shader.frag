precision mediump float;
uniform vec2 uResolution;

varying vec4 vPosition;
varying vec4 vColor;
varying vec2 vTexCoord;

void main () {
  gl_FragColor = vColor;
}
