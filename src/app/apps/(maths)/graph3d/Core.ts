import { RenderingMode } from "./Definitions";
import { Dispatch, SetStateAction } from "react";
import { Parse } from "@/src/parser-old/Main";
import GraphMgr from "@/src/GraphMgr";
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  GridHelper,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons";

export default class Core {
  pointers: {
    pointerId: number;
    clientX: number;
    clientY: number;
  }[] = [];
  _error = "";
  _setError: Dispatch<SetStateAction<string>> = () => {};
  get error() {
    return this._error;
  }
  set error(e) {
    this._setError((this._error = e));
  }
  graph = new GraphMgr();
  func: string = "0.>sin(y-sin(x))";
  _funcexpr: string = "0>sin(y-sinx)";
  _setFuncexpr: Dispatch<SetStateAction<string>> = () => {};
  get funcexpr() {
    return this._funcexpr;
  }
  set funcexpr(s: string) {
    const result = Parse(s, ["x", "y", "t"], "ineq");
    let f = "";
    if (result.status) {
      try {
        f = result.root!.togl();
      } catch (e) {
        this.error = `${e}`;
        console.error(e);
        return;
      }
      this.error = "";
      this.func = f;
      this._funcexpr = s; // this line will be deleted
      this._setFuncexpr(s);
    } else {
      this.error = "parse failed";
    }
  }
  renderingMode: RenderingMode = RenderingMode.HSV;
  nessyMode = false;
  rawShaderData = {
    vert: "",
    frag: "",
  };
  cvs = document.createElement("canvas");
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  interval: NodeJS.Timeout | null = null;
  controls: OrbitControls;

  constructor() {
    const wr = document.querySelector("#main-wrapper") as HTMLElement;
    wr.appendChild(this.cvs);
    this.cvs.style.width = "100%";
    this.scene = new Scene();

    this.camera = new PerspectiveCamera(
      75,
      this.cvs.width / this.cvs.height,
      0.1,
      1000
    );
    this.camera.translateZ(9);
    this.camera.translateY(6);
    // this.camera.rotateX(-1);

    this.renderer = new WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);

    this.scene.add(
      new Mesh(new BoxGeometry(), new MeshLambertMaterial({ color: "#88ff88" }))
    );
    this.scene.add(new GridHelper());

    const ambientLight = new AmbientLight("#ffffff", 0.3);
    this.scene.add(ambientLight);
    const directionalLight = new DirectionalLight();
    directionalLight.position.set(0.3, 1, 0.3).normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    this.controls = new OrbitControls(this.camera, this.cvs);

    this.beginLoop();
  }

  setRF(x: number) {
    // this.app.renderer.resolution = x;
  }

  setRM(m: RenderingMode) {
    this.renderingMode = m;
  }

  setEvents() {}

  beginLoop() {
    this.interval = setInterval(() => {
      this.loop();
    }, 1000 / 60);
  }

  endLoop() {
    clearInterval(this.interval!);
  }

  loop() {
    // Render three.js
    this.renderer.render(this.scene, this.camera);
  }
}
