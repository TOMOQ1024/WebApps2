import * as THREE from 'three';
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
        const W = parseInt(d[0], 16);
        for (let i=0; i<4; i++) {
          if (W & (1<<i)) {
            geometry = new THREE.BoxGeometry(0, 2, 1);
            material = new THREE.MeshLambertMaterial({
              map: core.assetLoader.assets.wall,
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.rotateY(Math.PI/2*i);
            mesh.position.set(
              x + Math.cos(Math.PI/2*i)/2,
              0,
              y + Math.sin(Math.PI/2*i)/2
            )
            meshes.push(mesh);
          }
        }
        for (let i=1 ;i<d.length; i++) {
          if (/^W/.test(d[i])) {
            geometry = new THREE.BoxGeometry(1, 2, .1);
            material = new THREE.MeshLambertMaterial();
            mesh = new THREE.Mesh(geometry, material);
            meshes.push(mesh);
          }
          else {
            console.error(`Unexpected`);
          }
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
