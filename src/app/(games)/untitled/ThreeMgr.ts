import * as THREE from 'three';
import Core from './Core';

export default class ThreeMgr {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  cvs: HTMLCanvasElement;
  floorMesh: THREE.Mesh;
  ceilMesh: THREE.Mesh;
  textureLoader = new THREE.TextureLoader();

  constructor (public parent: Core) {
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

    const ambientLight = new THREE.AmbientLight();
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(.3, 1., .3).normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    this.floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshLambertMaterial({color: '#004400'}),
    );
    this.floorMesh.rotateX(-Math.PI/2);
    this.floorMesh.translateZ(-1);
    this.scene.add(this.floorMesh);

    this.ceilMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshLambertMaterial({color: '#440000'}),
    );
    this.ceilMesh.rotateX(+Math.PI/2);
    this.ceilMesh.translateZ(-1);
    this.scene.add(this.ceilMesh);
  }

  update (dt: number) {
    this.camera.position.copy(this.parent.player.pos);
    this.camera.quaternion.copy(this.parent.player.qua);
  }

  render () {
    this.renderer.render(this.scene, this.camera);
  }
}