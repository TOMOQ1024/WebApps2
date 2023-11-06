precision highp float;

struct Graph {
  float x0;
  float y0;
  float r;
};

struct Mandel {
  vec2 z;
  vec2 z0;
  int i;
};

uniform vec2 u_resolution;
uniform Graph u_graph;

Mandel mandel(vec2 c){
  vec2 z = vec2(0.);
  vec2 z0 = vec2(0.);
  bool f = true;
  int r = 0;
  for(int i=0; i<300; i++){
    if(100. < length(z) && f){
      f = false;
      z0 = vec2(z.x, z.y);
    }
    z = vec2(
      z.x*z.x - z.y*z.y + c.x,
      2.*z.x*z.y + c.y
    );
    if(f)r = i;
  }
  return Mandel(z, z0, r);
}

vec4 calcIColor(Mandel m0, Mandel mx, Mandel my){
  float r = length(m0.z);
  float arg = atan(length(my.z)-length(m0.z), length(mx.z)-length(m0.z));
  vec2 Z = m0.z;//r * vec2(cos(arg), sin(arg));
  float argz = atan(m0.z.y, m0.z.x);
  float angX = atan(mx.z.y-m0.z.y, mx.z.x-m0.z.x);
  float angY = atan(my.z.y-m0.z.y, my.z.x-m0.z.x);
  // float arg = atan(length(my.z0-m0.z0), length(mx.z0-m0.z0));

  // float p = (1.-sin(arg*5.))/2.;
  // float p = 1.;//(sin(arg*6.-r*30.)+19.)/20.;
  // vec4 c0 = vec4(p*.6, p*.7, p*.9, 1.);
  // p = (1.-cos(arg+r*0.))/2.;
  // vec4 c1 = vec4(p*.8, p*.9, p*.8+.2, 1.);
  return vec4(0.);
}

vec4 calcOColor(Mandel m0, Mandel mx, Mandel my){
  float i = float(m0.i);
  float r = length(m0.z);
  float arg = atan(length(my.z0)-length(m0.z0), length(mx.z0)-length(m0.z0));
  // float arg = atan(length(my.z0-m0.z0), length(mx.z0-m0.z0));
  float angX = atan(mx.z0.y-m0.z0.y, mx.z0.x-m0.z0.x);
  float angY = atan(my.z0.y-m0.z0.y, my.z0.x-m0.z0.x);

  float p = 1.-pow(i/1000.,.3);
  vec4 c0 = vec4(1.-p/1., 1.-p/2., 1.-p/6., 1.);

  p = (1.+cos((arg)))/2.;
  vec4 c1 = vec4(p*.9, p*.95, p*.8+.2, 1.);

  return c0*c1;
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
  float d = 1e-5;
  Mandel m0 = mandel(pos);
  Mandel mx = mandel(pos+vec2(d, 0.));
  Mandel my = mandel(pos+vec2(0., d));
  // vec4 oColor = vec4(vec3(1.) * sqrt(float(itr) / 1000.0) * vec3(1., .5, 1.), 1.);
	gl_FragColor = length(m0.z) < 2. ? calcIColor(m0, mx, my) : calcOColor(m0, mx, my);
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
