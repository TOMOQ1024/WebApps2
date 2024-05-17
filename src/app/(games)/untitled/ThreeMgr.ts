import * as THREE from 'three';
import Core from './Core';

export default class ThreeMgr {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  cvs: HTMLCanvasElement;
  textureLoader = new THREE.TextureLoader();

  constructor (public core: Core) {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.cvs.width / this.cvs.height,
      0.1,
      1000
    );
  
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);

    const ambientLight = new THREE.AmbientLight('white', 1);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight('#eef', .3);
    directionalLight.position.set(.3, 1., .7).normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  addFC () {
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(51, 51),
      new THREE.MeshLambertMaterial({
        map: this.core.assetLoader.assets.floor
      }),
    );
    floorMesh.rotateX(-Math.PI/2);
    floorMesh.translateZ(-1);
    this.scene.add(floorMesh);

    const ceilMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(51, 51),
      new THREE.MeshLambertMaterial({
        map: this.core.assetLoader.assets.ceil
      }),
    );
    ceilMesh.rotateX(+Math.PI/2);
    ceilMesh.translateZ(-1);
    this.scene.add(ceilMesh);
  }

  update (dt: number) {
    this.camera.position.copy(this.core.player.pos);
    this.camera.quaternion.copy(this.core.player.qua);
  }

  render () {
    this.renderer.render(this.scene, this.camera);
  }
}