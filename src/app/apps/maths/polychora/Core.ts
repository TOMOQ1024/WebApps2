import axios from "axios";
import {
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
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
    this.camera.left = width / -200;
    this.camera.right = width / 200;
    this.camera.top = height / 200;
    this.camera.bottom = height / -200;
    this.camera.near = 0;
    this.camera.far = 100;
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
  }

  export() {
    return this.cvs.toDataURL();
  }

  createPolychora() {
    //
  }
}
