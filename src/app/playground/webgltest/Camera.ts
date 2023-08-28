import GLMgr from "./Core";
import Vec3 from "./Vector";

export default class Camera {
  position = new Vec3(0, 3, 9);
  // direction = new Vec3(0, -1, -3);
  angleH = Math.PI/2*3;
  angleV = Math.atan2(-1, 3);
  parent: GLMgr;
  movSpeed = 0.2;
  rotSpeed = 0.03;

  constructor(parent: GLMgr){
    this.parent = parent;
  }

  get forward(){
    return new Vec3(
      Math.cos(this.angleV) * Math.cos(this.angleH),
      Math.sin(this.angleV),
      Math.cos(this.angleV) * Math.sin(this.angleH),
    );
  }

  get backward(){
    return new Vec3(
      -Math.cos(this.angleV) * Math.cos(this.angleH),
      -Math.sin(this.angleV),
      -Math.cos(this.angleV) * Math.sin(this.angleH),
    );
  }

  get left(){
    return new Vec3(
      Math.sin(this.angleH),
      0,
      -Math.cos(this.angleH),
    );
  }

  get right(){
    return new Vec3(
      -Math.sin(this.angleH),
      0,
      Math.cos(this.angleH),
    );
  }

  get up(){
    return new Vec3(
      -Math.sin(this.angleV) * Math.cos(this.angleH),
      Math.cos(this.angleV),
      -Math.sin(this.angleV) * Math.sin(this.angleH),
    );
  }

  get down(){
    return new Vec3(
      Math.sin(this.angleV) * Math.cos(this.angleH),
      -Math.cos(this.angleV),
      Math.sin(this.angleV) * Math.sin(this.angleH),
    );
  }

  move(direction: 'left'|'right'|'forward'|'backward'|'up'|'down'|'hforward'|'hbackward'|'vup'|'vdown', speed: number){
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
    
    this.parent.matUpdated = true;
  }

  rotate(direction: 'left'|'right'|'up'|'down', speed: number){
    const s = this.rotSpeed * speed;
    switch(direction){
      case 'left': this.angleH -= s; break;
      case 'right': this.angleH += s; break;
      case 'up': this.angleV = Math.min(Math.max(this.angleV + s, -Math.PI/2), Math.PI/2); break;
      case 'down': this.angleV = Math.min(Math.max(this.angleV - s, -Math.PI/2), Math.PI/2); break;
    }
    this.parent.matUpdated = true;
  }
}