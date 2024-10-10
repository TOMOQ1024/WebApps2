import { Vector2 } from "three";
import { GyrovectorSpace } from "./GyrovectorSpace";

export class Gyrovector2 {
  // readonly isGyrovector2: true;
  get curvature() {
    return this.space.curvature;
  }

  get radius() {
    return this.space.radius;
  }

  constructor(public space: GyrovectorSpace, public x = 0, public y = 0) {
    // Gyrovector2.prototype.isGyrovector2 = true;
  }

  toVector2() {
    return new Vector2(this.x, this.y);
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;

    return this;
  }

  setScalar(scalar: number) {
    this.x = scalar;
    this.y = scalar;

    return this;
  }

  setX(x: number) {
    this.x = x;

    return this;
  }

  setY(y: number) {
    this.y = y;

    return this;
  }

  setComponent(index: number, value: number) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      default:
        throw new Error("index is out of range: " + index);
    }

    return this;
  }

  getComponent(index: number) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + index);
    }
  }

  clone() {
    return new Gyrovector2(this.space, this.x, this.y);
  }

  copy(v: Gyrovector2) {
    if (this.curvature !== v.curvature) throw new Error("曲率が一致しません");
    this.x = v.x;
    this.y = v.y;

    return this;
  }

  /**
   * Möbius Addition
   */
  add(v: Gyrovector2) {
    if (this.curvature !== v.curvature) throw new Error("曲率が一致しません");
    const r = this.curvature;
    const t = 2 * r * this.dot(v);
    const ll2 = this.lengthSq();
    const rl2 = v.lengthSq();
    const d = 1 - t + r * r * ll2 * rl2;
    const nx = ((1 - t - r * rl2) * this.x + (1 + r * ll2) * v.x) / d;
    const ny = ((1 - t - r * rl2) * this.y + (1 + r * ll2) * v.y) / d;
    this.x = nx;
    this.y = ny;
    return this;
  }

  // addVectors

  // addScaledVector

  sub(v: Gyrovector2) {
    return this.add(v.multiplyScalar(-1));
  }

  // subVectors

  // subScaledVector

  multiplyScalar(scalar: number) {
    if (!scalar || !this.lengthSq()) {
      this.x = this.y = 0;
      return this;
    }

    const l = this.length();
    const nx = (this.tan(scalar * this.arctan(this.length())) * this.x) / l;
    const ny = (this.tan(scalar * this.arctan(this.length())) * this.y) / l;
    this.x = nx;
    this.y = ny;
    return this;
  }

  divideScalar(scalar: number) {
    return this.multiplyScalar(1 / scalar);
  }

  // applyMatrix3

  // min

  // max

  // clamp

  // clampLength

  // floor

  // ceil

  // round

  // roundToZero

  negate() {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }

  dot(v: Gyrovector2) {
    if (this.curvature !== v.curvature) throw new Error("曲率が一致しません");
    return this.x * v.x + this.y * v.y;
  }

  // cross

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // manhattanLength

  normalize() {
    return this.divideScalar(this.length() || 1);
  }

  angle() {
    // computes the angle in radians with respect to the positive x-axis

    const angle = Math.atan2(-this.y, -this.x) + Math.PI;

    return angle;
  }

  // andleTo

  distanceTo(v: Gyrovector2) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v: Gyrovector2) {
    return 2 * this.arctan(this.clone().negate().add(v).length());
  }

  // manhattanDistanceTo

  setLength(length: number) {
    return this.normalize().multiplyScalar(length);
  }

  lerp(v: Gyrovector2, alpha: number) {
    return this.add(v.clone().sub(this).multiplyScalar(alpha));
  }

  lerpVectors(v1: Gyrovector2, v2: Gyrovector2, alpha: number) {
    return this.copy(v1.clone().add(v2.clone().sub(v1).multiplyScalar(alpha)));
  }

  equals(v: Gyrovector2) {
    return v.curvature === this.curvature && v.x === this.x && v.y === this.y;
  }

  fromArray(array: number[], offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];

    return this;
  }

  toArray(array: number[] = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;

    return array;
  }

  // fromBufferAttribute

  // rotateAround

  random() {
    this.x = Math.random();
    this.y = Math.random();

    return this;
  }

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
  }

  tan(x: number) {
    const r = this.radius;
    switch (Math.sign(this.curvature)) {
      case -1:
        return r * Math.tanh(x / r);
      case 0:
        return x;
      case +1:
        return r * Math.tan(x / r);
    }
    throw new Error("Unexpected Error");
  }

  arctan(x: number) {
    const r = this.radius;
    switch (Math.sign(this.curvature)) {
      case -1:
        return r * Math.atanh(x / r);
      case 0:
        return x;
      case +1:
        return r * Math.atan(x / r);
    }
    throw new Error("Unexpected Error");
  }
}
