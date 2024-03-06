import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/Addons';
import Core from './Core';

export default class Map {
  data: {
    id: string;
    meshes: THREE.Object3D[];
  }[][];

  constructor (
    public core: Core,
    public width: number,
    public height: number,
    data: string[][]
  ) {
    this.data = [];
    for (let y=0; y<height; y++) {
      this.data.push([]);
      
      for (let x=0; x<width; x++) {
        let d = data[y][x];
        // 3Dオブジェクトの生成
        let geometry: THREE.BufferGeometry;
        let material: THREE.Material;
        let mesh: THREE.Mesh;
        let meshes: THREE.Mesh[] = [];
        let W = parseInt(d[0], 16);
        for (let i=0; i<4; i++) {
          if (W & (1<<i)) {
            geometry = new THREE.PlaneGeometry(1, 2);
            material = new THREE.MeshLambertMaterial({
              map: core.assetLoader.assets.wall,
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.rotateY(-Math.PI/2*(i+1));
            mesh.position.set(
              x + Math.cos(Math.PI/2*i)/2,
              0,
              y + Math.sin(Math.PI/2*i)/2
            );
            meshes.push(mesh);
          }
        }
        for (let j=1 ;j<d.length;) {
          d = data[y][x].slice(j);
          if (/^M[0-9A-F]/.test(d)) {
            W = parseInt(d[1], 16);
            for (let i=0; i<4; i++) {
              if (W & (1<<i)) {
                geometry = new THREE.PlaneGeometry(1, 2);
                mesh = new Reflector(geometry, {
                  clipBias: 0.003,
                  color: new THREE.Color(0xcccccc),
                  textureWidth: window.innerWidth * window.devicePixelRatio,
                  textureHeight: window.innerHeight * window.devicePixelRatio,
                });
                mesh.rotateY(-Math.PI/2*(i+1));
                mesh.position.set(
                  x + Math.cos(Math.PI/2*i)/2,
                  0,
                  y + Math.sin(Math.PI/2*i)/2
                );
                meshes.push(mesh);
              }
            }
            j += 2;
            continue;
          }
          if (/^I/.test(d)) {
            geometry = new THREE.IcosahedronGeometry(.2, 0);
            material = new THREE.MeshLambertMaterial();
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
              x,
              -.5,
              y
            );
            meshes.push(mesh);
            j += 1;
            continue;
          }
          console.error(`Unexpected`);
          j += 1;
          continue;
        }
        
        this.data[y].push({
          id: data[y][x],
          meshes: meshes,
        });
      }
    }
  }

  addToScene () {
    for (let y=0; y<this.height; y++) {
      for (let x=0; x<this.width; x++) {
        this.data[y][x].meshes.forEach(m => {
          this.core.threeMgr.scene.add(m);
        })
      }
    }
  }
}
