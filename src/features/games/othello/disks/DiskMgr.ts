import { Group } from "three";
import Core from "../Core";
import { Disk } from "./Disk";
import { IsIn } from "@/src/misc/maths/IsIn";

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
    this.disks[3][3].state = "black";
    this.disks[3][4].state = "white";
    this.disks[4][3].state = "white";
    this.disks[4][4].state = "black";
    this.parent.scene.add(this.object);
  }

  print() {
    let s = "";
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        s += { empty: "E", white: "W", black: "K", wtok: "-", ktow: "-" }[
          this.disks[y][x].state
        ];
      }
      s += "\n";
    }
    console.log(s);
  }

  ifPut(X: number, Y: number, c: "white" | "black") {
    if (!IsIn(X, Y, 0, 0, 8, 8) || this.disks[Y][X].state !== "empty")
      return false;
    const C = c === "white" ? "black" : "white";
    for (let i = 0; i < 8; i++) {
      const dx = Math.round(Math.cos((Math.PI / 4) * i));
      const dy = Math.round(Math.sin((Math.PI / 4) * i));
      let x = X;
      let y = Y;
      x += dx;
      y += dy;
      let j = 1;
      while (IsIn(x, y, 0, 0, 8, 8)) {
        switch (this.disks[y][x].state) {
          case c:
            if (1 < j) return true;
            break;
          case C:
            j++;
            x += dx;
            y += dy;
            continue;
        }
        break;
      }
    }
    return false;
  }

  put(X: number, Y: number, c: "white" | "black") {
    const C = c === "white" ? "black" : "white";
    for (let i = 0; i < 8; i++) {
      const dx = Math.round(Math.cos((Math.PI / 4) * i));
      const dy = Math.round(Math.sin((Math.PI / 4) * i));
      let x = X;
      let y = Y;
      x += dx;
      y += dy;
      let j = 1;
      while (IsIn(x, y, 0, 0, 8, 8)) {
        switch (this.disks[y][x].state) {
          case c:
            for (let k = 1; k < j; k++) {
              this.disks[Y + dy * k][X + dx * k].flip();
            }
            break;
          case C:
            j++;
            x += dx;
            y += dy;
            continue;
        }
        break;
      }
    }
  }

  update() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.disks[y][x].update();
      }
    }
  }
}
