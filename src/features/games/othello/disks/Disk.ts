import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Object3DEventMap,
  Vector3,
} from "three";
import DiskMgr from "./DiskMgr";
import { DISK_STATE } from "./DiskState";

export class Disk {
  static radius = 0.9;
  static thickness = 0.2;
  object: Group<Object3DEventMap>;
  state = DISK_STATE.WHITE;

  constructor(public parent: DiskMgr, public x: number, public y: number) {
    const wPart = new Mesh(
      new CylinderGeometry(Disk.radius, Disk.radius, Disk.thickness, 16),
      new MeshLambertMaterial({ color: "#fff" })
    );
    wPart.translateY(Disk.thickness / 2);
    wPart.name = `Disk-w-${x}-${y}`;
    const kPart = new Mesh(
      new CylinderGeometry(Disk.radius, Disk.radius, Disk.thickness, 16),
      new MeshLambertMaterial({ color: "#111" })
    );
    kPart.translateY(-Disk.thickness / 2);
    kPart.name = `Disk-k-${x}-${y}`;
    this.object = new Group();
    this.object.add(wPart, kPart);
    this.object.translateX(x * 2 - 7);
    this.object.translateZ(y * 2 - 7);
    parent.object.add(this.object);
  }

  flip() {
    switch (this.state) {
      case DISK_STATE.EMPTY:
        throw new Error(`Invalid operation`);
      case DISK_STATE.WHITE:
        console.log(`flip (${this.x},${this.y})`);
        this.state = DISK_STATE.WTOK;
        break;
      case DISK_STATE.BLACK:
        console.log(`flip (${this.x},${this.y})`);
        this.state = DISK_STATE.KTOW;
        break;
    }
  }

  update(): void {
    switch (this.state) {
      case DISK_STATE.EMPTY:
      case DISK_STATE.WHITE:
      case DISK_STATE.BLACK:
        break;
      case DISK_STATE.WTOK:
        this.object.rotateX(Math.PI / 10);
        this.object.rotateZ(Math.PI / 10);
        if (
          new Vector3(1, 0, 0).applyQuaternion(this.object.quaternion).y < 0
        ) {
          this.state = DISK_STATE.BLACK;
          this.object.quaternion.set(1 / Math.sqrt(2), 0, 1 / Math.sqrt(2), 0);
        }
        break;
      case DISK_STATE.KTOW:
        this.object.rotateX(Math.PI / 10);
        this.object.rotateZ(Math.PI / 10);
        if (
          new Vector3(1, 0, 0).applyQuaternion(this.object.quaternion).y > 0
        ) {
          this.state = DISK_STATE.WHITE;
          this.object.quaternion.set(0, 0, 0, -1);
        }
        break;
    }
  }
}
