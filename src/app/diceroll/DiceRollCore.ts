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
  planeBody = new CANNON.Body();
  planeMesh = new THREE.Mesh();
  dieMaterial: CANNON.Material;
  planeMaterial: CANNON.Material;
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

    this.planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshBasicMaterial({color: '#004400'}),
    );
    this.planeMesh.rotateX(-Math.PI/2)
    this.planeMesh.translateZ(-10);
    this.scene.add(this.planeMesh);

    this.world = new CANNON.World();
    this.world.gravity.y = -20;

    this.planeMaterial = new CANNON.Material('planeMaterial');
    let contactMaterial = new CANNON.ContactMaterial(this.planeMaterial, this.planeMaterial, {
      friction: 0,
      restitution: 0.3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    });
    this.world.addContactMaterial(contactMaterial);

    this.dieMaterial = new CANNON.Material('dieMaterial');
    contactMaterial = new CANNON.ContactMaterial(this.dieMaterial, this.dieMaterial, {
      friction: 0.003,
      restitution: 0.3,
      contactEquationStiffness: 1e4,
      contactEquationRelaxation: 3
    });
    this.world.addContactMaterial(contactMaterial);

    this.initCannon();
  }

  initCannon () {
    const plane = new CANNON.Box(new CANNON.Vec3(15, 15, .01))
    this.planeBody = new CANNON.Body({
      // mass: 0,
      type: CANNON.Body.KINEMATIC,
      material: this.dieMaterial,
    });
    this.planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.planeBody.position.y -= 10;
    this.planeBody.addShape(plane);
    this.world.addBody(this.planeBody);
  }

  addDie () {
    // Box
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const textureLoader = new THREE.TextureLoader();
    const boxMaterials = [
      new THREE.MeshBasicMaterial({
        map: textureLoader.load('resources/diceroll/images/d6/1.png'),
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load('resources/diceroll/images/d6/6.png'),
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load('resources/diceroll/images/d6/2.png'),
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load('resources/diceroll/images/d6/5.png'),
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load('resources/diceroll/images/d6/3.png'),
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load('resources/diceroll/images/d6/4.png'),
      }),
    ];

    const mesh = new THREE.Mesh(geometry, boxMaterials);
    this.scene.add(mesh);
    this.meshes.push(mesh);

    // Box
    const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
    const body = new CANNON.Body({
      mass: 1,
      material: this.dieMaterial
    });
    body.addShape(shape)
    body.angularVelocity.set(
      Math.random()*10,
      Math.random()*10,
      Math.random()*10,
    );
    body.angularDamping = 0.1;
    this.world.addBody(body);
    this.bodies.push(body);
  }

  animate(this: DRCore) {
    window.setInterval(()=>{
      this.loop();
      if (Math.random() < 1e-2) {
        this.addDie();
      }
    }, 1000/60);
  }

  loop (this: DRCore) {
    // Step the physics world
    this.world.fixedStep()

    // Copy coordinates from cannon.js to three.js
    let body: CANNON.Body;
    let mesh: THREE.Mesh;
    let p: CANNON.Vec3;
    let q: CANNON.Quaternion;
    for(let i=0; i<this.bodies.length; i++) {
      body = this.bodies[i];
      mesh = this.meshes[i];
      p = body.position;
      q = body.quaternion;
      mesh.position.copy(new THREE.Vector3(p.x, p.y, p.z));
      mesh.quaternion.copy(new THREE.Quaternion(q.x, q.y, q.z, q.w));

      
      p = this.planeBody.position;
      q = this.planeBody.quaternion;
      this.planeMesh.position.copy(new THREE.Vector3(p.x, p.y, p.z));
      this.planeMesh.quaternion.copy(new THREE.Quaternion(q.x, q.y, q.z, q.w));
    }

    // Render three.js
    this.renderer.render(this.scene, this.camera)
  }
}