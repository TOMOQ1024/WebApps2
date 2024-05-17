precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aTexCoord;
uniform mat4 mMat;
uniform mat4 vMat;
uniform mat4 pMat;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vTexCoord;

void main ()
{
	vPosition = (mMat * vec4(aPosition, 1.0)).xyz;
	vNormal = aNormal;
	vColor = aColor;
	vTexCoord = aTexCoord;
	gl_Position = pMat * vMat * mMat * vec4(aPosition, 1.0);
	// gl_Position = vec4(aPosition, 1.0);
}