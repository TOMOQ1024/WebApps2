precision highp float;

uniform vec2 u_resolution;

bool mandel(vec2 c){
  vec2 z = vec2(0.);
  for(int i=0; i<50; i++){
    if(2. < length(z))return false;
    z = vec2(
      z.x*z.x - z.y*z.y + c.x,
      2.*z.x*z.y + c.y
    );
  }
  return true;
}

void main ()
{
  vec2 col = vec2(
    gl_FragCoord.x / u_resolution.x,
    gl_FragCoord.y / u_resolution.y
  );
  vec2 pos = vec2(
    col.x * 3. - 2.,
    col.y * 3. - 1.5
  );
	// gl_FragColor = vec4 (1., pos, 1.);
	gl_FragColor = mandel(pos) ? vec4 (1., col, 1.) : vec4(0.);
}

/*
void main ()
{
  vec2 pos = vec2(
    gl_FragCoord.x / u_resolution.x,
    gl_FragCoord.y / u_resolution.y
  ) * 4. - 2.;
	gl_FragColor = vec4 (1., col, 1.);
	// gl_FragColor = 1 ? vec4 (1., col, 1.) : vec4(0.);
}
*/
