import * as THREE from 'three'
import * as CANNON from 'cannon-es';
import { Die } from "./Die";
import { CollisionFilterGroup } from './CollisionFilterGroup';
import { dieMaterial } from './DieMaterial';
import { DieMsg } from './DieMsg';

export class D6 implements Die {
  textureLoader = new THREE.TextureLoader();
  geometry = new THREE.BoxGeometry(2, 2, 2);
  material = [
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/1.png'),
      transparent: true,
    }),
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/6.png'),
      transparent: true,
    }),
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/2.png'),
      transparent: true,
    }),
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/5.png'),
      transparent: true,
    }),
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/3.png'),
      transparent: true,
    }),
    new THREE.MeshLambertMaterial({
      map: this.textureLoader.load('resources/diceroll/images/d6/4.png'),
      transparent: true,
    }),
  ];
  mesh = new THREE.Mesh(this.geometry, this.material);
  shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
  body = new CANNON.Body({
    mass: 1,
    material: dieMaterial,
    collisionFilterGroup: CollisionFilterGroup.DICE_DYNAMIC,
    collisionFilterMask: CollisionFilterGroup.WALL | CollisionFilterGroup.DICE_DYNAMIC
  });
  num = 0;
  isStatic = false;
  isReady = true;
  

  constructor () {
    this.body.addShape(this.shape);

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
        new THREE.Vector3(0, 0, +1),
        new THREE.Vector3(0, 0, -1),
      ].map(v=>v.applyQuaternion(Q));
      let I = 0;
      for (let i=1; i<6; i++) {
        if (F[I].y<F[i].y) {
          I = i;
        }
      }
      
      this.num = [1,6,2,5,3,4][I];
  
      if (
        this.body.velocity.length() < 5e-1 &&
        this.body.angularVelocity.length() < 1e-2
      ) {
        this.isStatic = true;
        this.body.collisionFilterGroup = CollisionFilterGroup.DICE_STATIC;
        this.material.map(m=>m.depthTest = false);
      }
    }
    else {
      this.mesh.material.map(m=>m.opacity *= .9);

      if (this.mesh.material[0].opacity <= 1e-3) {
        return DieMsg.STA;
      }
    }


    return DieMsg.DYN;
  }
}