attribute vec3 position;
attribute vec4 a_color;
// attribute vec2 a_tex_coord;
uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;
varying vec4 v_color;
// varying vec2 v_tex_coord;

void main ()
{
	v_color = a_color;
	// v_tex_coord = a_tex_coord;
	gl_Position = pMatrix * vMatrix * mMatrix * vec4(position, 1.0);
}