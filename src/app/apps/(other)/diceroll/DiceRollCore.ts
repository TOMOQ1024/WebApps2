import * as THREE from 'three'
import * as CANNON from 'cannon-es';
import { CollisionFilterGroup } from './dice/CollisionFilterGroup';
import DiceMgr from './dice/DiceMgr';
import { dieContactMaterial, dieMaterial } from './dice/DieMaterial';

export default class DRCore {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  world: CANNON.World;
  cvs: HTMLCanvasElement;
  planeBody = new CANNON.Body();
  planeMesh = new THREE.Mesh();
  interval: NodeJS.Timeout|null = null;
  textureLoader = new THREE.TextureLoader();
  diceMgr = new DiceMgr(this);

  constructor () {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;

    this.scene = new THREE.Scene();
  
    // this.camera = new THREE.PerspectiveCamera(
    //   75,
    //   this.cvs.width / this.cvs.height,
    //   0.1,
    //   1000
    // );
    // // this.camera.translateZ(15);
    // this.camera.translateY(25);
    // this.camera.rotateX(-Math.PI/2);
  
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.cvs.width / this.cvs.height,
      0.1,
      1000
    );
    this.camera.translateZ(15);
    this.camera.translateY(25);
    this.camera.rotateX(-1);
  
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);

    const ambientLight = new THREE.AmbientLight();
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(.3, 1., .3).normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    this.planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshLambertMaterial({color: '#004400'}),
    );
    this.planeMesh.rotateX(-Math.PI/2);
    this.planeMesh.translateZ(-10);
    this.scene.add(this.planeMesh);

    this.world = new CANNON.World();
    this.world.gravity.y = -100;

    this.world.addContactMaterial(dieContactMaterial);

    const plane = new CANNON.Box(new CANNON.Vec3(15, 15, 1));
    this.planeBody = new CANNON.Body({
      // mass: 0,
      type: CANNON.Body.KINEMATIC,
      material: dieMaterial,
      collisionFilterGroup: CollisionFilterGroup.WALL,
      collisionFilterMask: CollisionFilterGroup.DICE_DYNAMIC | CollisionFilterGroup.DICE_STATIC
    });
    this.planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.planeBody.addShape(plane);
    this.world.addBody(this.planeBody);

    const wall = new CANNON.Box(new CANNON.Vec3(15, 150, 1));
    for (let i=0; i<4; i++) {
      const wallBody = new CANNON.Body({
        // mass: 0,
        type: CANNON.Body.KINEMATIC,
        material: dieMaterial,
        collisionFilterGroup: CollisionFilterGroup.WALL,
        collisionFilterMask: CollisionFilterGroup.DICE_DYNAMIC | CollisionFilterGroup.DICE_STATIC
      });
      wallBody.addShape(wall);
      const a = Math.PI/2*i;
      wallBody.quaternion.setFromEuler(0, a, 0);
      wallBody.position.x += 15*Math.sin(a);
      wallBody.position.y += 150;
      wallBody.position.z += 15*Math.cos(a);
      this.world.addBody(wallBody);
    }
  }

  beginLoop(this: DRCore) {
    this.interval = setInterval(()=>{
      this.loop();
    }, 1000/60);
  }

  loop (this: DRCore) {
    // Step the physics world
    this.world.fixedStep();

    // Copy coordinates from cannon.js to three.js
    const p = this.planeBody.position;
    const q = this.planeBody.quaternion;
    this.planeMesh.position.copy(new THREE.Vector3(p.x, p.y, p.z));
    this.planeMesh.quaternion.copy(new THREE.Quaternion(q.x, q.y, q.z, q.w));

    this.diceMgr.update();
    console.log(this.diceMgr.sum);

    // Render three.js
    this.renderer.render(this.scene, this.camera);
  }
}