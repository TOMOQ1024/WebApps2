precision mediump float;
varying vec2 vPosition;
uniform vec2 uResolution;
struct Camera {
  vec4 position;
  vec4 forward;
};
uniform Camera uCamera;

struct Ray {
  vec4 origin;
  vec4 direction;

  Ray() {
    //
  }
}



void main ()
{
  vec2 z0 = vPosition * uResolution / min(uResolution.x, uResolution.y) * uGraph.radius - uGraph.origin;
  Ray ray = Ray{
    vec4(uCamera.position),
    
  }
  for(int i=0; i<10; i++){
    
  }
  gl_FragColor = vec4((vPosition+1.)/2., 1., 1.);
}
