import * as THREE from 'three'
import Core from "../Core";
import { Disk } from './Disk';

export default class DiskMgr {
  array: number[][] = [];
  disks: Disk[][] = [];

  constructor (public parent: Core) {
    for (let y=0; y<8; y++) {
      this.array.push([]);
      this.disks.push([]);
      for (let x=0; x<8; x++) {
        this.array[y].push(-1);
        this.disks[y].push(new Disk(this, x, y));
      }
    }
  }

  add (x: number, y: number) {
    //
  }

  update () {
    //
  }
}