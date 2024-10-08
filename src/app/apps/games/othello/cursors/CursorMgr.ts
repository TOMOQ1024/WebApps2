import { Group, Mesh, MeshLambertMaterial, OctahedronGeometry } from "three";
import Core from "../Core";
import { Disk } from "../disks/Disk";

export default class CursorMgr {
  cursor: Mesh[][] = [];
  object = new Group();

  constructor(public parent: Core) {
    for (let y = 0; y < 8; y++) {
      this.cursor.push([]);
      for (let x = 0; x < 8; x++) {
        this.cursor[y].push(
          new Mesh(
            new OctahedronGeometry(Disk.thickness),
            new MeshLambertMaterial({ color: "#ee0" })
          )
        );
        this.cursor[y][x].position.x = x * 2 - 7;
        this.cursor[y][x].position.z = y * 2 - 7;
        this.cursor[y][x].name = `Cursor-${x}-${y}`;
        this.cursor[y][x].visible = false;
        this.object.add(this.cursor[y][x]);
      }
    }
    this.parent.scene.add(this.object);
  }

  reset() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.cursor[y][x].visible = this.parent.diskMgr.ifPut(
          x,
          y,
          this.parent.player
        );
      }
    }
  }
}
