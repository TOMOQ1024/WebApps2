import * as THREE from 'three'
import * as CANNON from 'cannon-es';
import { Die } from "./Die";
import { dieMaterial } from './DieMaterial';
import { DieMsg } from './DieMsg';

export class D12 implements Die {
  textureLoader = new THREE.TextureLoader();
  geometry = new THREE.DodecahedronGeometry(1);
  material = [
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/1.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/6.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/2.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/5.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/3.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/4.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/1.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/6.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/2.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/5.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/3.png')}),
    new THREE.MeshLambertMaterial({map: this.textureLoader.load('resources/diceroll/images/d6/4.png')}),
  ];
  mesh = new THREE.Mesh(this.geometry, this.material);
  shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
  body = new CANNON.Body({
    mass: 1,
    material: dieMaterial
  });
  num = 0;
  isStatic = false;
  isReady = false;
  

  constructor () {
    this.body.addShape(this.shape);

    this.body.angularVelocity.set(
      Math.random()*10,
      Math.random()*10,
      Math.random()*10,
    );

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
  }

  update (): DieMsg {
    if (this.body.position.y < 0) {
      return DieMsg.DIE;
    }
    return DieMsg.DYN;
  }
}