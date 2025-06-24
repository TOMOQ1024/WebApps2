import axios from "axios";
import {
  AmbientLight,
  BufferGeometry,
  DirectionalLight,
  DoubleSide,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  RawShaderMaterial,
  Scene,
  WebGLRenderer,
} from "three";
import { GLTFExporter, OrbitControls } from "three/examples/jsm/Addons";
import { CreatePolychoronGeometry } from "./Geometry";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";

export default class Core {
  cvs: HTMLCanvasElement;
  interval: NodeJS.Timeout | null = null;
  renderer: WebGLRenderer;
  camera: OrthographicCamera;
  scene: Scene;
  diagram = new CoxeterDynkinDiagram(
    {
      ab: [2, 1],
      ba: [2, 1],
      bc: [3, 1],
      cb: [3, 1],
      cd: [3, 1],
      dc: [3, 1],
      ad: [3, 1],
      da: [3, 1],
      ac: [2, 1],
      ca: [2, 1],
      bd: [2, 1],
      db: [2, 1],
    },
    {
      a: "x",
      b: "x",
      c: "x",
      d: "x",
    }
  );
  ctrls: OrbitControls;
  mesh: LineSegments | Mesh | null = null;
  buildTime: number = 0;
  material = new RawShaderMaterial({
    side: DoubleSide,
    uniforms: {
      time: { value: 0 },
    },
  });
  isCompiled = false;

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

    this.loadShader();
  }

  async loadShader() {
    const res = await axios.get("/api/shaders/polychora");
    this.material.vertexShader = res.data.vert;
    this.material.fragmentShader = res.data.frag;
    this.material.needsUpdate = true;
    await this.renderer.compileAsync(this.scene, this.camera);
    this.isCompiled = true;
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
    if (this.renderer && this.isCompiled)
      this.renderer.render(this.scene, this.camera);
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

  setPolychoron() {
    console.clear();
    const startTime = performance.now();
    const geometry = CreatePolychoronGeometry(this.diagram, false);
    const endTime = performance.now();
    const buildTime = endTime - startTime;
    this.buildTime = buildTime;
    if (this.mesh) {
      this.mesh.geometry = geometry;
    } else {
      this.mesh = new Mesh(geometry, this.material);
      this.scene.add(this.mesh);
    }
  }
}
