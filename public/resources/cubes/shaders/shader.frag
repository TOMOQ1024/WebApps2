precision mediump float;

// uniform sampler2D uImage0;
// uniform sampler2D uImage1;
uniform vec2 uResolution;
uniform float uTime;
uniform mat4 mMat;
uniform mat4 miMat;
uniform vec3 eyeDirection;
uniform vec3 lightPosition;
uniform vec3 lightDirection;
uniform vec4 ambientColor;
uniform vec4 rotInfo;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vTexCoord;

void main ()
{
  float index = rotInfo.w;
  vec3 axis;
  bool isGuide = false;
  vec4 guideColor = vec4(.8, .8, .8, 1.);
  if (index >= 0.) {
    if (index < rotInfo.x) {
      axis = vec3(1., 0., 0.);
    }
    else if ((index -= rotInfo.x) < rotInfo.y) {
      axis = vec3(0., 1., 0.);
    }
    else if ((index -= rotInfo.y) < rotInfo.z) {
      axis = vec3(0., 0., 1.);
    }
    vec3 S = rotInfo.xyz - 1.;
    vec3 p = (vec3(mMat[3]) + S) / 2.;
    isGuide = true;

    if (.5 < axis.x && abs(p.x - index) > .1) isGuide = false;
    if (.5 < axis.y && abs(p.y - index) > .1) isGuide = false;
    if (.5 < axis.z && abs(p.z - index) > .1) isGuide = false;
  }



  vec3  lightVec  = lightDirection;// lightPosition - vPosition;
  vec3  invLight  = normalize(miMat * vec4(lightVec, 0.0)).xyz;
  vec3  invEye   = normalize(miMat * vec4(eyeDirection, 0.0)).xyz;
	vec3  halfLE   = normalize(invLight + invEye);
	float diffuse  = clamp(dot(vNormal, invLight), 0.0, 1.0) + .2;
	float specular = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 50.0);
	// gl_FragColor = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 0.0);
	gl_FragColor = dot(pow(vTexCoord*2.-1., vec2(12., 12.)), vec2(1., 1.)) > .6 ? vec4(0., 0., 0., 1.) : vColor;
  // gl_FragColor = vec4(1., .5, .5, 1.);

  if (isGuide) {
    gl_FragColor *= guideColor;
  }
}
