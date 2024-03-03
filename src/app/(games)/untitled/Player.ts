import * as THREE from 'three';
import Core from './Core';

export default class Player {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  qua: THREE.Quaternion;
  ang: THREE.Vector2;
  dag: THREE.Vector2;
  ctrlAllowed = false;
  spd = 1e-3;
  ash = 7e-4;
  asv = 7e-4;

  constructor (
    public parent: Core
  ) {
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.qua = new THREE.Quaternion(0, 0, 0, 1);
    this.ang = new THREE.Vector2(0, 0);
    this.dag = new THREE.Vector2(0, 0);

    this.asv = this.ash / parent.threeMgr.camera.aspect;
  }

  update (dt: number) {
    if (this.ctrlAllowed) {
      // カメラの移動
      if(this.parent.keys.a) this.moveL(dt);
      if(this.parent.keys.d) this.moveR(dt);
      if(this.parent.keys.w) this.moveF(dt);
      if(this.parent.keys.s) this.moveB(dt);
      if(this.parent.keys[' ']) this.moveU(dt);
      if(this.parent.keys.shift) this.moveD(dt);
      // カメラの向き
      if(this.parent.keys.arrowleft) this.rotateL(dt);
      if(this.parent.keys.arrowright) this.rotateR(dt);
      if(this.parent.keys.arrowup) this.rotateU(dt);
      if(this.parent.keys.arrowdown) this.rotateD(dt);

      const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.ang.x);
      this.qua.set(0, 0, 0, 1)
        .multiply(qx)
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(Math.cos(this.ang.x), 0, Math.sin(this.ang.x)).applyQuaternion(qx), this.ang.y));
    }
  }

  moveF (dt: number) {
    this.vel.copy((new THREE.Vector3(0, 0, -1))
      .applyQuaternion(this.qua))
      .projectOnPlane(new THREE.Vector3(0, 1, 0))
      .normalize();
    this.pos.add(this.vel.multiplyScalar(this.spd * dt));
  }

  moveB (dt: number) {
    this.vel.copy((new THREE.Vector3(0, 0, +1))
      .applyQuaternion(this.qua))
      .projectOnPlane(new THREE.Vector3(0, 1, 0))
      .normalize();
    this.pos.add(this.vel.multiplyScalar(this.spd * dt));
  }

  moveL (dt: number) {
    this.vel.copy((new THREE.Vector3(-1, 0, 0))
      .applyQuaternion(this.qua))
      .projectOnPlane(new THREE.Vector3(0, 1, 0))
      .normalize();
    this.pos.add(this.vel.multiplyScalar(this.spd * dt));
  }

  moveR (dt: number) {
    this.vel.copy((new THREE.Vector3(+1, 0, 0))
      .applyQuaternion(this.qua))
      .projectOnPlane(new THREE.Vector3(0, 1, 0))
      .normalize();
    this.pos.add(this.vel.multiplyScalar(this.spd * dt));
  }

  moveD (dt: number) {
    this.vel.copy(new THREE.Vector3(0, -1, 0));
    this.pos.add(this.vel.multiplyScalar(this.spd * dt));
  }

  moveU (dt: number) {
    this.vel.copy(new THREE.Vector3(0, +1, 0));
    this.pos.add(this.vel.multiplyScalar(this.spd * dt));
  }

  rotateL (dt: number) {
    this.ang.x += this.ash * dt;
  }

  rotateR (dt: number) {
    this.ang.x -= this.ash * dt;
  }

  rotateD (dt: number) {
    this.ang.y -= this.asv * dt;
  }

  rotateU (dt: number) {
    this.ang.y += this.asv * dt;
  }
}