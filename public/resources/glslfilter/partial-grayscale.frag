in vec2 vTexCoord;
in vec2 vPosition;
out vec4 finalColor;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

void main ()
{
  vec4 col0 = texture2D(uTexture, vTexCoord);
  vec4 col1 = vec4((1.+cos(uTime)/2.), (1.+sin(uTime)/2.), 1., 1.);
  mat4 G = mat4(
    1./3., 1./3., 1./3., 0.,
    1./3., 1./3., 1./3., 0.,
    1./3., 1./3., 1./3., 0.,
       0.,    0.,    0., 1.
  );
  vec4 col2 = G*col0;
  
  bool flgX = 3. < abs(vPosition.x * uResolution.x - uMouse.x);
  bool flgY = 3. < abs(vPosition.y * uResolution.y - uMouse.y);
  float d = distance(uMouse/uResolution, vPosition);
  float a = exp(-.2/d);
  
	finalColor = mix(col0,col2,a);
}
