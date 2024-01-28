import * as THREE from 'three'
import * as CANNON from 'cannon-es';

export default class DRCore {
  meshes: THREE.Mesh[] = [];
  bodies: CANNON.Body[] = [];
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  world: CANNON.World;
  cvs: HTMLCanvasElement;
  N = 40;

  constructor () {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;

    this.scene = new THREE.Scene();
  
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.cvs.width / this.cvs.height,
      0.1,
      1000
    );
    this.camera.translateZ(15);
    this.camera.translateY(15);
    this.camera.rotateX(-1);
  
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);

    // Box
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })

    const mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)
    this.meshes.push(mesh);

    this.world = new CANNON.World();
    this.initCannon();
  }

  initCannon () {
    // Box
    const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
    const body = new CANNON.Body({
      mass: 1,
    })
    body.addShape(shape)
    body.angularVelocity.set(0, 10, 0)
    body.angularDamping = 0.5
    this.world.addBody(body)
    this.bodies.push(body);
  }

  animate() {
    setInterval(this.loop, 1000/60);
  }

  loop () {
    // Step the physics world
    this.world.fixedStep()

    // Copy coordinates from cannon.js to three.js
    let body: CANNON.Body;
    let mesh: THREE.Mesh;
    for(let i=0; i<this.bodies.length; i++) {
      body = this.bodies[i];
      mesh = this.meshes[i];
      mesh.position.copy(new THREE.Vector3(body.position.x, body.position.y, body.position.z));
      mesh.quaternion.copy(new THREE.Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w));
    }

    // Render three.js
    this.renderer.render(this.scene, this.camera)
  }
}