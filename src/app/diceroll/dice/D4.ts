import * as THREE from 'three'
import * as CANNON from 'cannon-es';
import * as THREE_ADDONS from "three/examples/jsm/Addons";
import { Die } from "./Die";
import { CollisionFilterGroup } from './CollisionFilterGroup';
import { dieMaterial } from './DieMaterial';
import { DieMsg } from './DieMsg';

export class D4 implements Die {
  // textureLoader = new THREE.TextureLoader();
  // geometry = new THREE.BoxGeometry(2, 2, 2);
  // material = [
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/1.png'),
  //     transparent: true,
  //     depthTest: false,
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/6.png'),
  //     transparent: true,
  //     depthTest: false,
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/2.png'),
  //     transparent: true,
  //     depthTest: false,
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/5.png'),
  //     transparent: true,
  //     depthTest: false,
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/3.png'),
  //     transparent: true,
  //     depthTest: false,
  //   }),
  //   new THREE.MeshLambertMaterial({
  //     map: this.textureLoader.load('resources/diceroll/images/d6/4.png'),
  //     transparent: true,
  //     depthTest: false,
  //   }),
  // ];
  // mesh = new THREE.Mesh(this.geometry, this.material);
  mesh = new THREE.Mesh();
  body = new CANNON.Body({
    mass: 1,
    material: dieMaterial,
    collisionFilterGroup: CollisionFilterGroup.DICE_DYNAMIC,
    collisionFilterMask: CollisionFilterGroup.WALL | CollisionFilterGroup.DICE_DYNAMIC
  });
  num = 0;
  isStatic = false;
  isReady = false;
  

  constructor () {
    this.init();
  }
  
  async init () {
    const loader = new THREE_ADDONS.GLTFLoader();
  
    const gltf = await loader.loadAsync('resources/diceroll/models/d4.glb');
    const objs = gltf.scene.children;
    for (let i=0; i<objs.length; i++) {
      const m = objs[i];
      if (m.name === 'Cube') {
        this.mesh = m as THREE.Mesh;
        const t = this.mesh.material as THREE.Material;
        t.transparent = true;
        // t.depthTest = false;
      }
    }
    // const result = threeToCannon(this.mesh, {type: ShapeType.MESH});
    // if (!result) {
    //   console.error('Failed to convert mesh to shape');
    //   return;
    // }
    // console.log(result);
    // const {shape, offset, orientation} = result;
    // this.shape = shape;
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(.1, .1, 2)));
  
    this.body.position.y += 10;
    this.body.quaternion.setFromEuler(
      Math.random()*10,
      Math.random()*10,
      Math.random()*10,
    );
    this.body.angularVelocity.set(
      Math.random()*10,
      Math.random()*10,
      Math.random()*10,
    );
    this.isReady = true;
  }

  update (): DieMsg {
    if (this.body.position.y < 0) {
      return DieMsg.DIE;
    }

    if (!this.isStatic) {
      const q = this.body.quaternion;
      const Q = new THREE.Quaternion(q.x, q.y, q.z, q.w);
      const F = [
        new THREE.Vector3(+1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, +1, 0),
        new THREE.Vector3(0, -1, 0),
      ].map(v=>v.applyQuaternion(Q));
      let I = 0;
      for (let i=1; i<4; i++) {
        if (F[I].y<F[i].y) {
          I = i;
        }
      }
      
      this.num = [4,1,2,3][I];
  
      if (
        this.body.velocity.length() < 5e-1 &&
        this.body.angularVelocity.length() < 1e-2
      ) {
        this.isStatic = true;
        this.body.collisionFilterGroup = CollisionFilterGroup.DICE_STATIC;
        const m = this.mesh.material as THREE.Material;
        m.depthTest = false;
      }
    }
    else {
      const m = this.mesh.material as THREE.Material;
      m.opacity *= .9;

      if (m.opacity <= 1e-3) {
        return DieMsg.STA;
      }
    }


    return DieMsg.DYN;
  }
}