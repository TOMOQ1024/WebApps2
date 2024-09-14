import { CylinderGeometry, Mesh, MeshLambertMaterial } from "three";
import DiskMgr from "./DiskMgr";

export class Disk {
  constructor(public parent: DiskMgr, public x: number, public y: number) {
    const disk = new Mesh(
      new CylinderGeometry(0.2, 0.2, 1, 16),
      new MeshLambertMaterial()
    );
    disk.translateX(x);
    disk.translateZ(y);
    parent.parent.scene.add(disk);
  }

  update(): void {
    //
  }
}
