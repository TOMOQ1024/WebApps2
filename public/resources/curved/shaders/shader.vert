const float PI = 3.14159265358979;

uniform vec2 uResolution;
uniform float K;
uniform float k;
uniform vec3 uCameraPos;
uniform vec3 uModelPos;

attribute vec2 aPosition;
attribute vec4 aColor;
attribute vec2 aTexCoord;

varying vec4 vPosition;
varying vec4 vColor;
varying vec2 vTexCoord;



vec3 pSum(vec3 p1, vec3 p2) {
	if(p1.r == 0.){
		return vec3(p2.r, p2.g, p1.b+p2.b);
	}
	float b0 = mod(p1.b+p2.g, 2.*PI);
	float b = PI - abs(b0 - PI);
	float rr = k*acos(
		cos(p1.r/k)*cos(p2.r/k)+
		sin(p1.r/k)*sin(p2.r/k)*cos(b)
	);
	if(rr == 0.) return vec3(0., 0., p1.b+p2.b);
	float rg = p1.g+sign(b0-PI)*acos(
		(cos(p2.r/k)-cos(p1.r/k)*cos(rr/k))/
		(sin(p1.r/k)*sin(rr/k))
	);
	return vec3(rr, rg, p1.b);
}



void main ()
{
	vec3 p = vec3(aPosition, 0.);
	// p = pSum(uCameraPos, p);
	p = pSum(uCameraPos, pSum(uModelPos, p));
	vPosition = vec4(
		p.r*vec2(
			cos(p.g),
			sin(p.g)
		) / uResolution.xy * min(uResolution.x, uResolution.y)
	, 0., 1.);
	vColor = aColor;
	vTexCoord = aTexCoord;
	gl_Position = vPosition;
}