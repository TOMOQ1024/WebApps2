attribute vec2 aPosition;
varying vec2 vPosition;

void main ()
{
	vPosition = aPosition;
	vPosition.y = vPosition.y;
	gl_Position = vec4(aPosition, 0., 1.);
}