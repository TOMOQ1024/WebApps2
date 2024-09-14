attribute vec2 aPosition;
varying vec2 vPosition;

void main ()
{
	vPosition = aPosition;
	gl_Position = vec4(aPosition, 0., 1.);
	// gl_PointSize = 5.;
}