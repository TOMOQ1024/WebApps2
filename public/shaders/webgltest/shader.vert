attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
// attribute vec2 a_tex_coord;
uniform mat4 miMat;
uniform mat4 mMat;
uniform mat4 vMat;
uniform mat4 pMat;
uniform vec3 lightDirection;
uniform vec3 eyeDirection;
uniform vec4 ambientColor;
varying vec4 vColor;
// varying vec2 v_tex_coord;

void main ()
{
	vec3  invLight = normalize(miMat * vec4(lightDirection, 0.0)).xyz;
  vec3  invEye   = normalize(miMat * vec4(eyeDirection, 0.0)).xyz;
	vec3  halfLE   = normalize(invLight + invEye);
	float diffuse  = clamp(dot(aNormal, invLight), 0.0, 1.0);
	float specular = pow(clamp(dot(aNormal, halfLE), 0.0, 1.0), 50.0);
	vec4  light    = aColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);
	vColor = light + ambientColor;
	// v_tex_coord = a_tex_coord;
	gl_Position = pMat * vMat * mMat * vec4(aPosition, 1.0);
}