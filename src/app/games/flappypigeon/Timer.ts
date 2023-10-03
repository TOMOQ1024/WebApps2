import { Game } from "./Game";
import { Clamp } from "./Utils";

export default class Timer {
  private _duration: number = 0;

  getDuration(){
    return this._duration;
  }

  setDuration(duration: number){
    this._duration = duration;
    this._endTime = this._parent.now + duration;
  }

  private _endTime: number = 0;

  getEndTime(){
    return this._endTime;
  }

  setEndTime(endTime: number){
    this._endTime = endTime;
    this._duration = endTime - this._parent.now;
  }

  /** @param duration ms */
  constructor(private _parent: Game) { }

  /** @returns 0~1 */
  getProgress() {
    return Clamp(0, 1 - (this._endTime - this._parent.now) / this._duration, 1);
  }

  /** @returns 0~1 */
  getRemainingProgress() {
    return Clamp(0, (this._endTime - this._parent.now) / this._duration, 1);
  }

  getRemainingTime() {
    return this._endTime - this._parent.now;
  }

  isEnded() {
    return this._endTime < this._parent.now;
  }
}