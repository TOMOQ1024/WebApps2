precision highp float;

struct Graph {
  float x0;
  float y0;
  float r;
};

uniform vec2 u_resolution;
uniform Graph u_graph;

int mandel(vec2 c){
  vec2 z = vec2(0.);
  for(int i=0; i<1000; i++){
    if(2. < length(z))return i;
    z = vec2(
      z.x*z.x - z.y*z.y + c.x,
      2.*z.x*z.y + c.y
    );
  }
  return -1;
}

void main ()
{
  vec2 col = vec2(
    gl_FragCoord.x / u_resolution.x,
    gl_FragCoord.y / u_resolution.y
  );
  vec2 pos = vec2(
    col.x,
    col.y
  ) * u_graph.r * 2. - u_graph.r - vec2(u_graph.x0, u_graph.y0);
	// gl_FragColor = vec4 (1., pos, 1.);
  int itr = mandel(pos);
	gl_FragColor = itr < 0 ?
    vec4 (1., col, 1.) :
    vec4(vec3(1.) * sqrt(float(itr) / 1000.0) * vec3(1., .5, 1.), 1.);
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
