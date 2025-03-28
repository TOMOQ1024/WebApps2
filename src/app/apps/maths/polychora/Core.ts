import axios from "axios";
import {
  AmbientLight,
  AxesHelper,
  BufferGeometry,
  DirectionalLight,
  DoubleSide,
  Mesh,
  OrthographicCamera,
  RawShaderMaterial,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons";

export default class Core {
  cvs: HTMLCanvasElement;
  interval: NodeJS.Timeout | null = null;
  renderer: WebGLRenderer;
  camera: OrthographicCamera;
  scene: Scene;
  textureLoader = new TextureLoader();
  depthLimit: number = 1;
  labels = {
    "01": 1,
    "02": 1,
    "03": 1,
    "12": 1,
    "13": 1,
    "23": 1,
  };
  ctrls: OrbitControls;
  geometry: BufferGeometry | null = null;
  mesh: Mesh | null = null;
  material = new RawShaderMaterial({
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;
uniform float time;

varying vec2 vUv;

#define cv 1.0

// #region gyrovector functions
float tanh(float x) {
  return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

float atanh(float x) {
  return 0.5 * log((1.0 + x) / (1.0 - x));
}

float g_tan(float x) {
  if (cv < 0.0) return tanh(x);
  if (cv > 0.0) return tan(x);
  return x;
}

float g_atan(float x) {
  if (cv < 0.0) return atanh(x);
  if (cv > 0.0) return atan(x);
  return x;
}

vec3 g_add(vec3 p, vec3 q) {
  float k = cv;
  return ((1. - 2. * k * dot(p, q) - k * dot(q, q)) * p + (1. + k * dot(p, p)) * q) / (1. - 2. * k * dot(p, q) + k * k * dot(p, p) * dot(q, q));
}

vec3 g_sub(vec3 p, vec3 q) {
  return g_add(-q, p);
}

vec3 g_mul(float r, vec3 p) {
  if (r == 0.0 || length(p) == 0.0) return vec3(0.0);
  return normalize(p) * g_tan(r * g_atan(length(p)));
}
// #endregion

void main() {
  // vec3 origin = vec3(0.,0.,0.);
  vec3 origin = g_mul(time, vec3(1.,0.,0.));
  vec3 S = g_add(origin, position);
  float l = 1.;
  vec3 P = S*l/(dot(S,S)*(l-1.)+l);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P.xyz, 1.0);
  vUv = uv;
}
                `,
    fragmentShader: `
precision highp float;

varying vec2 vUv;

#define PI 3.14159265358979323846

void main() {
  const float div = 10.;
  vec2 uv = vUv;
  float p = floor(uv.x * div) + floor(uv.y * div)*div;
  vec2 v = mod(uv*div, 1.) * 2. - 1.;

  float a = atan(v.y, v.x);
  float r = cos(PI/p) / cos(2./p*asin(cos(p/2.*a)));
  float col = pow(1. - abs(length(v) - r), 70.);
  gl_FragColor = vec4(col);
}
                  `,
  });

  constructor(cvs: HTMLCanvasElement | undefined = undefined) {
    if (cvs) {
      this.cvs = cvs;
    } else {
      this.cvs = document.createElement("canvas") as HTMLCanvasElement;
      this.cvs.width = 200;
      this.cvs.height = 200;
    }
    this.scene = new Scene();
    this.camera = new OrthographicCamera();
    this.camera.position.z = 1;

    this.renderer = new WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true,
    });
    // this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.ctrls = new OrbitControls(this.camera, this.renderer.domElement);
    const light = new DirectionalLight(0xffffff, 0.5);
    light.position.set(1, 2, 3).normalize();
    this.scene.add(light);
    this.scene.add(new AmbientLight(0xffffff, 0.3));
    // this.scene.add(new AxesHelper(10));

    this.scene.add(this.camera);
  }

  init(beginLoop = true) {
    this.resizeCanvas();

    if (beginLoop) {
      this.beginLoop();
    } else {
      this.loop();
    }
  }

  resizeCanvas() {
    console.log("resize");
    const wrapper = this.cvs.parentElement;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(rect.width, rect.height, false);
    const width = rect.width; // またはcanvas.width
    const height = rect.height; // またはcanvas.height
    const angle = 100;
    this.camera.left = width / -2 / angle;
    this.camera.right = width / 2 / angle;
    this.camera.top = height / 2 / angle;
    this.camera.bottom = height / -2 / angle;
    this.camera.near = -angle;
    this.camera.far = angle;
    this.camera.updateProjectionMatrix();
    this.loop();
  }

  beginLoop() {
    console.log("begin loop");
    this.interval = setInterval(() => {
      this.loop();
    }, 1000 / 20);
  }

  endLoop() {
    console.log("end loop");
    if (!this.interval) return;
    clearInterval(this.interval);
  }

  loop() {
    // console.log("loop");
    if (this.renderer) this.renderer.render(this.scene, this.camera);
    this.material.uniforms.time.value += 0.01;
  }

  export() {
    return this.cvs.toDataURL();
  }

  setPolychoron(g: BufferGeometry) {
    if (this.mesh) this.scene.remove(this.mesh);
    this.geometry = g;
    this.mesh = new Mesh(g, this.material);
    this.scene.add(this.mesh);
  }
}
