precision highp float;

// uniform sampler2D u_image;
uniform vec2 u_resolution;
varying vec4 v_color;
// varying vec2 v_tex_coord;

void main ()
{
  // vec2 col = vec2(
  //   gl_FragCoord.x / u_resolution.x,
  //   gl_FragCoord.y / u_resolution.y
  // );
	// gl_FragColor = vec4 (1., col, 1.);
	gl_FragColor = v_color;
  // gl_FragColor = texture2D(u_image, v_tex_coord);
}
