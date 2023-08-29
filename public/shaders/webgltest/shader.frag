precision mediump float;

// uniform sampler2D u_image;
// uniform vec2 uResolution;
uniform mat4 miMat;
uniform vec3 eyeDirection;
uniform vec3 lightPosition;
uniform vec3 lightDirection;
uniform vec4 ambientColor;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;
// varying vec2 v_tex_coord;

void main ()
{
  // vec2 col = vec2(
  //   gl_FragCoord.x / u_resolution.x,
  //   gl_FragCoord.y / u_resolution.y
  // );
	// gl_FragColor = vec4 (1., col, 1.);
  vec3  lightVec  = lightDirection;
  // vec3  lightVec  = lightPosition - vPosition;
  vec3  invLight  = normalize(miMat * vec4(lightVec, 0.0)).xyz;
  // vec3  invLight = normalize(miMat * vec4(lightDirection, 0.0)).xyz;
  vec3  invEye   = normalize(miMat * vec4(eyeDirection, 0.0)).xyz;
	vec3  halfLE   = normalize(invLight + invEye);
	float diffuse  = clamp(dot(vNormal, invLight), 0.0, 1.0) + .2;
	float specular = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 50.0);
	vec4  light    = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);
	gl_FragColor = light + ambientColor;
  // gl_FragColor = texture2D(u_image, v_tex_coord);
}
