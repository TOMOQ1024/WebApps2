attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
// attribute vec2 a_tex_coord;
uniform mat4 miMat;
uniform mat4 mMat;
uniform mat4 vMat;
uniform mat4 pMat;
uniform vec3 lightDirection;
varying vec4 vColor;
// varying vec2 v_tex_coord;

void main ()
{
	vec3  invLight = normalize(miMat * vec4(lightDirection, 0.0)).xyz;
	float diffuse  = clamp(dot(aNormal, invLight), 0.1, 1.0);
	vColor = aColor * vec4(vec3(diffuse), 1.0);
	// v_tex_coord = a_tex_coord;
	gl_Position = pMat * vMat * mMat * vec4(aPosition, 1.0);
}