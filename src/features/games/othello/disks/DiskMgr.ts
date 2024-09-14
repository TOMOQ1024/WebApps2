import { Group } from "three";
import Core from "../Core";
import { Disk } from "./Disk";

export default class DiskMgr {
  disks: Disk[][] = [];
  object = new Group();

  constructor(public parent: Core) {
    for (let y = 0; y < 8; y++) {
      this.disks.push([]);
      for (let x = 0; x < 8; x++) {
        this.disks[y].push(new Disk(this, x, y));
      }
    }
    this.parent.scene.add(this.object);
  }

  add(x: number, y: number) {
    //
  }

  update() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.disks[y][x].update();
      }
    }
  }
}
