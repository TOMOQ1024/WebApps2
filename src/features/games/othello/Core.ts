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
} from "three";
import DiskMgr from "./disks/DiskMgr";

export default class Core {
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  scene: Scene;
  cvs: HTMLCanvasElement;
  planeMesh = new Mesh();
  interval: NodeJS.Timer | null = null;
  textureLoader = new TextureLoader();
  diskMgr: DiskMgr;

  constructor() {
    this.cvs = document.getElementById("cvs") as HTMLCanvasElement;

    this.scene = new Scene();
    this.diskMgr = new DiskMgr(this);

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

    const ambientLight = new AmbientLight();
    this.scene.add(ambientLight);
    const directionalLight = new DirectionalLight();
    directionalLight.position.set(0.3, 1, 0.3).normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    this.planeMesh = new Mesh(
      new PlaneGeometry(30, 30),
      new MeshLambertMaterial({ color: "#004400" })
    );
    this.planeMesh.rotateX(-Math.PI / 2);
    this.planeMesh.translateZ(-10);
    this.scene.add(this.planeMesh);
  }

  beginLoop(this: Core) {
    this.interval = setInterval(() => {
      this.loop();
    }, 1000 / 60);
  }

  loop(this: Core) {
    this.diskMgr.update();

    // Render three.js
    this.renderer.render(this.scene, this.camera);
  }
}
