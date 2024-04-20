import { Vector2 } from "three";

export default class ProgramPointer {
  current = new Vector2(0, 0);
  next = new Vector2(-1, -1);
  dp = 0;
  cc = 0;
  block: number[] = [];
  stuckCount = 0;
}