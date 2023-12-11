precision mediump float;
varying vec2 vPosition;
// uniform vec2 uResolution;

void main ()
{
	gl_FragColor = vec4(vPosition/2.+.5, .6, 1.);
}
