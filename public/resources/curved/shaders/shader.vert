attribute vec2 aPosition;
attribute vec4 aColor;
attribute vec2 aTexCoord;
uniform vec2 uResolution;

varying vec4 vPosition;
varying vec4 vColor;
varying vec2 vTexCoord;

void main ()
{
	vPosition = vec4(
		aPosition.x*vec2(
			cos(aPosition.y),
			sin(aPosition.y)
		) / uResolution.xy * min(uResolution.x, uResolution.y)
	, 0., 1.);
	vColor = aColor;
	vTexCoord = aTexCoord;
	gl_Position = vPosition;
}