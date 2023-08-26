precision highp float;

struct Graph {
  float x0;
  float y0;
  float r;
};

uniform vec2 u_resolution;


void main ()
{
  vec2 col = vec2(
    gl_FragCoord.x / u_resolution.x,
    gl_FragCoord.y / u_resolution.y
  );
	gl_FragColor = vec4 (1., col, 1.);
	// gl_FragColor = 1 ? vec4 (1., col, 1.) : vec4(0.);
}
