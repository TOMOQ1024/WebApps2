import * as THREE from 'three'
import DiskMgr from './DiskMgr';

export class Disk {
  constructor (
    public parent: DiskMgr,
    public x: number,
    public y: number,
  ) {
    const disk = new THREE.Mesh(
      new THREE.CylinderGeometry(.2, .2, 1, 16),
      new THREE.MeshLambertMaterial()
    );
    disk.translateX(x);
    disk.translateZ(y);
    parent.parent.scene.add(disk);
  }

  update (): void {
    //
  }
}