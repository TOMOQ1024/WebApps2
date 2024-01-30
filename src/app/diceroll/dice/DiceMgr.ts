import * as THREE from 'three'
import * as CANNON from 'cannon-es';
import DRCore from "../DiceRollCore";
import { D6 } from "./D6";
import { Die } from "./Die";
import { DieMsg } from './DieMsg';

export default class DiceMgr {
  array: Die[] = [];
  diceToAdd: number[] = [];
  sum: number = 0;
  MAXIMUM_ARRAYSIZE = 100;

  constructor (public parent: DRCore) {}

  clear () {
    this.array.forEach(d=>{
      this.parent.world.removeBody(d.body);
      this.parent.scene.remove(d.mesh);
    });
    this.diceToAdd = [];
    this.array = [];
    this.sum = 0;
  }

  roll (N = 1, F = 6) {
    this.clear();
    this.add(N, F);
  }

  add (N = 1, F = 6) {
    for (let i=0; i<N; i++) {
      this.diceToAdd.push(F);
    }
  }

  updateArray () {
    if (this.array.length >= this.MAXIMUM_ARRAYSIZE) return false;
    const F = this.diceToAdd.pop();
    let die: Die;

    switch (F) {
      case undefined:
        return false;
      case 6:
        die = new D6();
        break;
      default:
        return false;
    }
    // boxBody.angularDamping = 0.1;
    this.array.push(die);
    this.parent.scene.add(die.mesh);
    this.parent.world.addBody(die.body);
    return true;
  }

  remove (i: number) {
    this.parent.world.removeBody(this.array[i].body);
    this.parent.scene.remove(this.array[i].mesh);
    this.array.splice(i, 1);
  }

  update () {
    let p: CANNON.Vec3;
    let q: CANNON.Quaternion;
    let toRemove: number[] = [];
    for (let i=0; i<this.array.length; i++) {
      p = this.array[i].body.position;
      q = this.array[i].body.quaternion;
      this.array[i].mesh.position.copy(new THREE.Vector3(p.x, p.y, p.z));
      this.array[i].mesh.quaternion.copy(new THREE.Quaternion(q.x, q.y, q.z, q.w));

      this.array[i].update();

      switch (this.array[i].update()) {
        case DieMsg.DIE:
          toRemove.unshift(i);
          break;
        case DieMsg.DYN:
          break;
        case DieMsg.STA:
          this.sum += this.array[i].num;
          toRemove.unshift(i);
          break;
      }
    }

    // サイコロの削除
    for (let j=0; j<toRemove.length; j++) {
      this.remove(toRemove[j]);
    }

    // サイコロの追加
    this.updateArray();
  }
}