import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Core {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  cvs: HTMLCanvasElement;
  planeMesh = new THREE.Mesh();
  interval: NodeJS.Timeout | null = null;
  textureLoader = new THREE.TextureLoader();
  controls: OrbitControls;
  gltf: GLTF | null = null;
  clock = new THREE.Clock();

  constructor() {
    this.cvs = document.getElementById("cvs") as HTMLCanvasElement;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.cvs.width / this.cvs.height,
      0.1,
      1000
    );
    this.camera.translateY(1);
    this.camera.translateZ(-3);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);

    const ambientLight = new THREE.AmbientLight();
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(0.3, 1, 0.3).normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    this.planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshLambertMaterial({ color: "#004400" })
    );
    this.planeMesh.rotateX(-Math.PI / 2);
    this.scene.add(this.planeMesh);
    this.controls = new OrbitControls(this.camera, this.cvs);

    const loader = new GLTFLoader();
    (async (cvs: HTMLCanvasElement, scene: THREE.Scene) => {
      this.gltf = await loader.loadAsync(
        "/private/models/Rusk_Quest_v1.00.glb"
      );
      // this.gltf = (await loader.loadAsync('/private/models/Ogame.vrm'));
      if (this.gltf) scene.add(this.gltf.scene);
      console.log(this.gltf);
    })(this.cvs, this.scene);
  }

  beginLoop(this: Core) {
    this.clock.start();
    this.interval = setInterval(() => {
      this.loop();
    }, 1000 / 60);
  }

  loop(this: Core) {
    this.update();
    this.renderer.render(this.scene, this.camera);
  }

  update() {
    this.controls.update();
    const deltaTime = this.clock.getDelta();
  }

  endLoop(this: Core) {
    if (!this.interval) return;
    clearInterval(this.interval);
  }
}
