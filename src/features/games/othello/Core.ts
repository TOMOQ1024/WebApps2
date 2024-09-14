import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Mesh,
  TextureLoader,
  AmbientLight,
  DirectionalLight,
  MeshLambertMaterial,
  PlaneGeometry,
  Vector2,
  GridHelper,
  Raycaster,
  OctahedronGeometry,
} from "three";
import DiskMgr from "./disks/DiskMgr";
import { OrbitControls } from "three/examples/jsm/Addons";
import { Disk } from "./disks/Disk";
import { IsIn } from "@/src/misc/maths/IsIn";
import CursorMgr from "./cursors/CursorMgr";

export default class Core {
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  scene: Scene;
  cvs: HTMLCanvasElement;
  planeMesh: Mesh;
  interval: NodeJS.Timer | null = null;
  textureLoader = new TextureLoader();
  diskMgr: DiskMgr;
  cursorMgr: CursorMgr;
  mousePos = new Vector2();
  interactionPos = new Vector2();
  raycaster = new Raycaster();
  keys: { [key: string]: number } = {};
  player: "white" | "black" = "black";

  constructor() {
    this.cvs = document.getElementById("cvs") as HTMLCanvasElement;

    this.scene = new Scene();
    this.diskMgr = new DiskMgr(this);
    this.cursorMgr = new CursorMgr(this);

    this.scene.add(new GridHelper(16, 8));

    // this.camera = new THREE.PerspectiveCamera(
    //   75,
    //   this.cvs.width / this.cvs.height,
    //   0.1,
    //   1000
    // );
    // // this.camera.translateZ(15);
    // this.camera.translateY(25);
    // this.camera.rotateX(-Math.PI/2);

    this.camera = new PerspectiveCamera(
      75,
      this.cvs.width / this.cvs.height,
      0.1,
      1000
    );
    this.camera.translateZ(15);
    this.camera.translateY(25);
    this.camera.rotateX(-1);

    this.renderer = new WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);

    const control = new OrbitControls(this.camera, this.renderer.domElement);

    const ambientLight = new AmbientLight();
    this.scene.add(ambientLight);
    const directionalLight = new DirectionalLight();
    directionalLight.position.set(0.3, 1, 0.3).normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    this.planeMesh = new Mesh(
      new PlaneGeometry(17, 17),
      new MeshLambertMaterial({ color: "#004400" })
    );
    this.planeMesh.rotateX(-Math.PI / 2);
    this.planeMesh.translateZ(-Disk.thickness);
    this.planeMesh.name = `Plane`;
    this.scene.add(this.planeMesh);
  }

  ifPut() {
    return this.diskMgr.ifPut(
      this.interactionPos.x,
      this.interactionPos.y,
      this.player
    );
  }

  flip() {
    const { x, y } = this.interactionPos;
    if (!IsIn(x, y, 0, 0, 8, 8)) return;
    this.diskMgr.disks[y][x].flip();

    // this.diskMgr.print();
    const w = this.diskMgr.disks
      .map((a) => a.filter((d) => /^(white|ktow)$/.test(d.state)).length)
      .reduce((a, b) => a + b);
    const k = this.diskMgr.disks
      .map((a) => a.filter((d) => /^(black|wtok)$/.test(d.state)).length)
      .reduce((a, b) => a + b);
    console.log(
      `%c${w}%c - %c${k}`,
      `
        font-size:40px;
        font-weight:bold;
        color:white
      `,
      `
        font-size:40px;
        font-weight:bold;
        color:yellow
      `,
      `
        font-size:40px;
        font-weight:bold;
        color:black
      `
    );
  }

  update() {
    this.diskMgr.update();

    // カーソル更新
    this.cursorMgr.reset();

    // キー入力
    if (this.keys[" "] === 2) this.flip();

    // キー情報の更新
    for (const key in this.keys) {
      if (this.keys[key] === 2) {
        this.keys[key] = 1;
      }
    }
  }

  beginLoop(this: Core) {
    this.interval = setInterval(() => {
      this.loop();
    }, 1000 / 60);
  }

  loop(this: Core) {
    this.update();

    // Render three.js
    this.renderer.render(this.scene, this.camera);
  }
}
