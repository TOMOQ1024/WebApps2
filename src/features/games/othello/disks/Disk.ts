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
  private _state: DISK_STATE = "empty";
  get state() {
    return this._state;
  }
  set state(s) {
    this._state = s;
    switch (s) {
      case "white":
        this.object.quaternion.set(0, 0, 0, -1);
        break;
      case "black":
        this.object.quaternion.set(1 / Math.sqrt(2), 0, 1 / Math.sqrt(2), 0);
        break;
    }
    this.object.visible = this.state !== "empty";
  }

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
    this.object.visible = false;
    parent.object.add(this.object);
  }

  flip() {
    switch (this.state) {
      case "empty":
        this.parent.put(this.x, this.y, this.parent.parent.player);
        this.state = this.parent.parent.player;
        this.parent.parent.player =
          this.parent.parent.player === "white" ? "black" : "white";
        break;
      case "white":
        console.log(`flip (${this.x},${this.y})`);
        this.state = "wtok";
        break;
      case "black":
        console.log(`flip (${this.x},${this.y})`);
        this.state = "ktow";
        break;
    }
  }

  update(): void {
    switch (this.state) {
      case "empty":
      case "white":
      case "black":
        break;
      case "wtok":
        this.object.rotateX(Math.PI / 10);
        this.object.rotateZ(Math.PI / 10);
        if (
          new Vector3(1, 0, 0).applyQuaternion(this.object.quaternion).y < 0
        ) {
          this.state = "black";
          this.object.quaternion.set(1 / Math.sqrt(2), 0, 1 / Math.sqrt(2), 0);
        }
        break;
      case "ktow":
        this.object.rotateX(Math.PI / 10);
        this.object.rotateZ(Math.PI / 10);
        if (
          new Vector3(1, 0, 0).applyQuaternion(this.object.quaternion).y > 0
        ) {
          this.state = "white";
          this.object.quaternion.set(0, 0, 0, -1);
        }
        break;
    }
  }
}
