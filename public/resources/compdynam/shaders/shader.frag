precision highp float;
// varying vec2 vPosition;

// uniform vec2 uResolution;

void main ()
{
  // vec2 col = vec2(
  //   gl_FragCoord.x / uResolution.x,
  //   gl_FragCoord.y / uResolution.y
  // );
  vec2 col = vec2(.5, .5);
	gl_FragColor = vec4(.2, col.x, col.y, 1.);
}
