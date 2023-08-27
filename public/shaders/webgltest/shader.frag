precision highp float;

uniform vec2 u_resolution;
varying vec4 vColor;

void main ()
{
  // vec2 col = vec2(
  //   gl_FragCoord.x / u_resolution.x,
  //   gl_FragCoord.y / u_resolution.y
  // );
	// gl_FragColor = vec4 (1., col, 1.);
	gl_FragColor = vColor;
}
