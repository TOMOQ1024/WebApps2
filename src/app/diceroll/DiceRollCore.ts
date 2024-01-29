import * as THREE from 'three'
import * as CANNON from 'cannon-es';
import { Vec3 } from 'cannon-es';

export default class DRCore {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  world: CANNON.World;
  cvs: HTMLCanvasElement;
  dieMeshes: THREE.Mesh[] = [];
  dieBodies: CANNON.Body[] = [];
  planeBody = new CANNON.Body();
  planeMesh = new THREE.Mesh();
  dieMaterial: CANNON.Material;
  interval: NodeJS.Timer|null = null;
  textureLoader = new THREE.TextureLoader();
  boxGeometry = new THREE.BoxGeometry(2, 2, 2);
  boxMaterials = [
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/1.png'),
    }),
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/6.png'),
    }),
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/2.png'),
    }),
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/5.png'),
    }),
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/3.png'),
    }),
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/4.png'),
    }),
  ];
  // d12Geometry = new THREE.DodecahedronGeometry(1);
  // d12Materials = [
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/1.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/6.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/2.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/5.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/3.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/4.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/3.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/4.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/3.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/4.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/3.png'),
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/4.png'),
  //   }),
  // ];

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

    const ambientLight = new THREE.AmbientLight();
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(
      .3,
      1.,
      .3
    ).normalize();
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

    this.dieMaterial = new CANNON.Material('dieMaterial');
    const contactMaterial = new CANNON.ContactMaterial(this.dieMaterial, this.dieMaterial, {
      friction: 0.001,
      restitution: 0.3,
      contactEquationStiffness: 1e4,
      contactEquationRelaxation: 3
    });
    this.world.addContactMaterial(contactMaterial);

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

  clearDie () {
    this.dieBodies.forEach(b=>{
      this.world.removeBody(b);
    });
    this.dieMeshes.forEach(m=>{
      this.scene.remove(m);
    });
    this.dieBodies = [];
    this.dieMeshes = [];
  }

  addDie () {
    if(this.dieBodies.length)return;
    let die: CANNON.Shape;
    let mesh: THREE.Mesh;
    const dieBody = new CANNON.Body({
      mass: 1,
      material: this.dieMaterial
    });

    let N = 6;

    switch (N) {
      case 6:
        {
          // Mesh
          mesh = new THREE.Mesh(this.boxGeometry, this.boxMaterials);
          this.scene.add(mesh);
          this.dieMeshes.push(mesh);
      
          // Body
          die = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
          dieBody.addShape(die);

          break;
        }
      // case 12:
      //   {
      //     // Mesh
      //     mesh = new THREE.Mesh(this.d12Geometry, this.d12Materials);
      //     this.scene.add(mesh);
      //     this.dieMeshes.push(mesh);

      //     const bufGeometry = new THREE.BufferGeometry();
      //     bufGeometry.setAttribute('position', this.d12Geometry.getAttribute('position'));
      
      //     // Body
      //     let arr = this.d12Geometry.attributes.position.array;
      //     const v: CANNON.Vec3[] = [];
      //     const f: number[][] = [];
      //     const n: Vec3[] = [];
      //     for (let i=0; i<arr.length; i+=3) {
      //       v.push(new CANNON.Vec3(arr[i], arr[i+1], arr[i+2]));
      //       f.push([i,i+1,i+2]);
      //       n.push(new CANNON.Vec3(arr[i], arr[i+1], arr[i+2]));
      //     }
      //     // arr = this.d12Geometry.index!.array;
      //     // for (let i=0; i<arr.length; i+=3) {
      //     // }
      //     // arr = bufGeometry.attributes.normal.array;
      //     for (let i=0; i<arr.length; i+=3) {
      //     }
      //     die = new CANNON.ConvexPolyhedron({
      //       vertices: v,
      //       faces: f,
      //       normals: n,
      //     });
      //     dieBody.addShape(die);
      //     break;
      //   }
      default:
        return false;
    }
    dieBody.angularVelocity.set(
      Math.random()*10,
      Math.random()*10,
      Math.random()*10,
    );
    // boxBody.angularDamping = 0.1;
    this.world.addBody(dieBody);
    this.dieBodies.push(dieBody);
    return true;
  }

  beginLoop(this: DRCore) {
    this.interval = setInterval(()=>{
      this.loop();
      if (Math.random() < 1e-0) {
        this.addDie();
      }
    }, 1000/60);
  }

  loop (this: DRCore) {
    // Step the physics world
    this.world.fixedStep();

    // Copy coordinates from cannon.js to three.js
    let p: CANNON.Vec3;
    let q: CANNON.Quaternion;
    for(let i=0; i<this.dieBodies.length; i++) {
      p = this.planeBody.position;
      q = this.planeBody.quaternion;
      this.planeMesh.position.copy(new THREE.Vector3(p.x, p.y, p.z));
      this.planeMesh.quaternion.copy(new THREE.Quaternion(q.x, q.y, q.z, q.w));

      p = this.dieBodies[i].position;
      q = this.dieBodies[i].quaternion;
      const Q = new THREE.Quaternion(q.x, q.y, q.z, q.w);
      this.dieMeshes[i].position.copy(new THREE.Vector3(p.x, p.y, p.z));
      this.dieMeshes[i].quaternion.copy(Q);

      const F = [
        new THREE.Vector3(+1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, +1, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, +1),
        new THREE.Vector3(0, 0, -1),
      ].map(v=>v.applyQuaternion(Q));
      let I = 0;
      for (let i=1; i<6; i++) {
        if (F[I].y<F[i].y) {
          I = i;
        }
      }
      
      console.log([1,6,2,5,3,4][I]);
    }

    // Render three.js
    this.renderer.render(this.scene, this.camera)
  }
}