import Vec2 from "@/src/Vec2";
import Vec3 from "@/src/Vec3";
import RMCore from "./RayMarchingCore";

export default class Camera {
  position = new Vec3(0, 10, 0);
  // direction = new Vec3(0, -1, -3);
  angle = new Vec2(0, -.4);
  view = new Vec2(Math.PI/3, Math.PI/3);
  parent: RMCore;
  movSpeed = 0.2;
  rotSpeed = 0.03;

  constructor(parent: RMCore){
    this.parent = parent;
  }

  get forward(){
    return new Vec3(
      Math.cos(this.angle.y) * Math.cos(this.angle.x),
      Math.sin(this.angle.y),
      Math.cos(this.angle.y) * Math.sin(this.angle.x),
    );
  }

  get backward(){
    return new Vec3(
      -Math.cos(this.angle.y) * Math.cos(this.angle.x),
      -Math.sin(this.angle.y),
      -Math.cos(this.angle.y) * Math.sin(this.angle.x),
    );
  }

  get leftward(){
    return new Vec3(
      Math.sin(this.angle.x),
      0,
      -Math.cos(this.angle.x),
    );
  }

  get rightward(){
    return new Vec3(
      -Math.sin(this.angle.x),
      0,
      Math.cos(this.angle.x),
    );
  }

  get upward(){
    return new Vec3(
      -Math.sin(this.angle.y) * Math.cos(this.angle.x),
      Math.cos(this.angle.y),
      -Math.sin(this.angle.y) * Math.sin(this.angle.x),
    );
  }

  get downward(){
    return new Vec3(
      Math.sin(this.angle.y) * Math.cos(this.angle.x),
      -Math.cos(this.angle.y),
      Math.sin(this.angle.y) * Math.sin(this.angle.x),
    );
  }

  move(direction: 'leftward'|'rightward'|'forward'|'backward'|'upward'|'downward'|'hforward'|'hbackward'|'vup'|'vdown', speed: number){
    switch(direction){
      case 'hforward': this.position.addBy(Vec3.scale(this.forward.x_z.normalized(), this.movSpeed*speed)); break;
      case 'hbackward': this.position.addBy(Vec3.scale(this.backward.x_z.normalized(), this.movSpeed*speed)); break;
      case 'vup': this.position.addBy(Vec3.scale(new Vec3(0, 1, 0), this.movSpeed*speed)); break;
      case 'vdown': this.position.addBy(Vec3.scale(new Vec3(0, -1, 0), this.movSpeed*speed)); break;
      default: this.position.addBy(Vec3.scale(this[direction], this.movSpeed*speed));
    }
    // console.log({
    //   left: 'L',
    //   right: 'R',
    //   forward: 'F',
    //   backward: 'B',
    //   up: 'U',
    //   down: 'D',
    //   hforward: 'F',
    //   hbackward: 'B',
    //   vup: 'U',
    //   vdown: 'D',
    // }[direction]);
    
    this.parent.glmgr.updateCameraUniform();
  }

  rotate(direction: 'left'|'right'|'up'|'down', speed: number){
    const s = this.rotSpeed * speed;
    switch(direction){
      case 'left': this.angle.x -= s; break;
      case 'right': this.angle.x += s; break;
      case 'up': this.angle.y = Math.min(Math.max(this.angle.y + s, -Math.PI/2), Math.PI/2); break;
      case 'down': this.angle.y = Math.min(Math.max(this.angle.y - s, -Math.PI/2), Math.PI/2); break;
    }
    this.parent.glmgr.updateCameraUniform();
  }
}