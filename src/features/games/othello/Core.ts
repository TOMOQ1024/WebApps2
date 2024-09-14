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
} from "three";
import DiskMgr from "./disks/DiskMgr";
import { OrbitControls } from "three/examples/jsm/Addons";
import { Disk } from "./disks/Disk";

export default class Core {
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  scene: Scene;
  cvs: HTMLCanvasElement;
  planeMesh = new Mesh();
  interval: NodeJS.Timer | null = null;
  textureLoader = new TextureLoader();
  diskMgr: DiskMgr;
  mousePos = new Vector2();
  raycaster = new Raycaster();
  keys: { [key: string]: number } = {};
  player: "white" | "black" = "black";

  constructor() {
    this.cvs = document.getElementById("cvs") as HTMLCanvasElement;

    this.scene = new Scene();
    this.diskMgr = new DiskMgr(this);

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
    this.scene.add(this.planeMesh);
  }

  flip() {
    const io = this.raycaster.intersectObjects(
      this.diskMgr.object.children,
      true
    );
    for (let i = 0; i < io.length; i++) {
      const name = io[i].object.name;
      if (/^Disk-[wk]-\d+-\d+$/.test(name)) {
        const [, , x, y] = name.split("-").map((a) => +a);
        this.diskMgr.disks[y][x].flip();
        return;
      }
    }
  }

  update() {
    this.diskMgr.update();

    if (this.keys[" "] === 2) this.flip();

    // update key state
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
