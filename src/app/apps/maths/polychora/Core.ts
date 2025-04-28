import axios from "axios";
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  BufferGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  OrthographicCamera,
  RawShaderMaterial,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from "three";
import {
  GLTFExporter,
  LineMaterial,
  OrbitControls,
} from "three/examples/jsm/Addons";
import { CreatePolychoron } from "./Polychora";

export default class Core {
  cvs: HTMLCanvasElement;
  interval: NodeJS.Timeout | null = null;
  renderer: WebGLRenderer;
  camera: OrthographicCamera;
  scene: Scene;
  textureLoader = new TextureLoader();
  depthLimit: number = 1;
  labels = {
    ab: [2, 1],
    ba: [2, 1],
    bc: [4, 1],
    cb: [4, 1],
    cd: [3, 1],
    dc: [3, 1],
    ad: [3, 1],
    da: [3, 1],
    ac: [2, 1],
    ca: [2, 1],
    bd: [2, 1],
    db: [2, 1],
  } as { [genPair: string]: [number, number] };
  nodeMarks = {
    a: "o",
    b: "x",
    c: "o",
    d: "o",
  } as { [nodeKey: string]: string };
  ctrls: OrbitControls;
  geometry: BufferGeometry | null = null;
  mesh: LineSegments | Mesh | null = null;
  buildTime: number = 0;
  material = new RawShaderMaterial({
    side: DoubleSide,
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;
attribute vec4 color;
uniform float time;

varying vec2 vUv;
varying vec4 vColor;
varying vec3 vDepth;
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
  vec3 origin = vec3(0.,0.,0.);
  // vec3 origin = g_mul(time, vec3(0.,0.,.1));
  vec3 S = g_add(origin, position);
  float l = 1.;
  vec3 P = S*l/(dot(S,S)*(l-1.)+l);
  vDepth = -(modelViewMatrix * vec4(P.xyz, 1.)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P.xyz, 1.0);
  vUv = uv;
  vColor = color;
}
                `,
    fragmentShader: `
precision highp float;

varying vec2 vUv;
varying vec4 vColor;
varying vec3 vDepth;
#define PI 3.14159265358979323846

float tanh(float x) {
  return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

vec4 tanh(vec4 x) {
  return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

void main() {
  vec4 t = vColor-.9;
  // float r = min(abs(t.x), min(abs(t.y), abs(t.z)));
  // vec4 c = mix(vec4(0.), .9 + .1 * sign(t), r/.1);
  vec4 c = .9 + .1 * tanh(30.*t);
  // vec4 c = pow(vColor, vec4(3.));
  float d = tanh(vDepth.z);
  float alpha = (3.-d)/4.;
  gl_FragColor = vec4(c.rgb*alpha, alpha);
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
      this.loop(0);
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
    this.loop(0);
  }

  beginLoop() {
    this.setPolychoron();
    this.interval = setInterval(() => {
      this.loop(1 / 20);
    }, 1000 / 20);
  }

  endLoop() {
    if (!this.interval) return;
    clearInterval(this.interval);
  }

  loop(deltaTime: number) {
    // console.log("loop");
    if (this.renderer) this.renderer.render(this.scene, this.camera);
    this.material.uniforms.time.value += deltaTime;
  }

  // メッシュをglbとしてエクスポート
  downloadGLB() {
    if (!this.mesh) return;
    const exporter = new GLTFExporter();
    const scene = new Scene();
    const mesh = this.mesh.clone();
    mesh.material = new MeshBasicMaterial({ color: 0xffffff });
    scene.add(mesh);
    exporter.parse(
      scene,
      (gltf: ArrayBuffer | { [key: string]: unknown }) => {
        if (gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: "model/gltf-binary" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "model.glb";
          a.click();
          URL.revokeObjectURL(url);
        } else {
          console.error(
            "GLBのエクスポートに失敗しました: 不正なデータ形式です"
          );
        }
      },
      (error: ErrorEvent) => {
        console.error("GLBのエクスポートに失敗しました:", error.message);
      },
      { binary: true }
    );
  }

  async setPolychoron() {
    console.clear();
    const startTime = performance.now();
    const g0 = (await CreatePolychoron(this.labels, this.nodeMarks, !true))!;
    const endTime = performance.now();
    const buildTime = endTime - startTime;
    this.buildTime = buildTime;
    if (this.mesh) this.scene.remove(this.mesh);
    this.geometry = g0;
    this.mesh = new Mesh(g0, this.material);
    // g.computeVertexNormals();
    // this.mesh = new Mesh(
    //   g,
    //   new MeshLambertMaterial({ color: 0xffffff, side: DoubleSide })
    // );
    // this.mesh = new LineSegments(
    //   new EdgesGeometry(g),
    //   new LineBasicMaterial({ color: 0xffffff, linewidth: 1 })
    // );
    this.scene.add(this.mesh);
  }
}
