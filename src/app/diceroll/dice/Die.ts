import * as THREE from 'three'
import * as CANNON from 'cannon-es';
import { DieMsg } from './DieMsg';



export interface Die {
  textureLoader: THREE.TextureLoader;
  geometry: THREE.BufferGeometry;
  material: THREE.Material[];
  mesh: THREE.Mesh;
  shape: CANNON.Shape;
  body: CANNON.Body;
  num: number;
  isStatic: boolean;

  update (): DieMsg;
}