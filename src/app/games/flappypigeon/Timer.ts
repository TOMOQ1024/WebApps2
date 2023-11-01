import { Game } from "./Game";
import { NessyMgr } from "./Nessy";
import { Clamp } from "./Utils";

export default class Timer {
  private _duration: number = 0;

  getDuration(){
    return this._duration;
  }

  setDuration(duration: number){
    this._duration = duration;
    this._startTime = this._parent.now;
    this._endTime = this._parent.now + duration;
  }

  private _startTime: number = 0;

  getStartTime(){
    return this._startTime;
  }

  setStartTime(startTime: number){
    this._startTime = startTime;
    this._endTime = startTime + this._duration;
  }

  private _endTime: number = 0;

  getEndTime(){
    return this._endTime;
  }

  setEndTime(endTime: number){
    this._endTime = endTime;
    this._startTime = this._parent.now;
    this._duration = endTime - this._parent.now;
  }

  private _paused = false;
  private _stashed = 0;

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
    if(this.isPausing()){
      return this._duration - this._stashed;
    }
    else{
      return this._endTime - this._parent.now;
    }
  }

  getConsumedTime() {
    if(this.isPausing()){
      return this._stashed;
    }
    else{
      return this._parent.now - this._startTime;
    }
  }

  pause() {
    if(this.isPausing())return;
    this._stashed = this.getConsumedTime();
    this._paused = true;
  }

  end() {
    this._endTime = this._parent.now;
  }

  unpause() {
    if(!this.isPausing())return;
    this._endTime = this._parent.now + this._duration - this._stashed;
    this._paused = false;
    this._startTime = this._parent.now - this._stashed;
  }

  isPausing() {
    return this._paused;
  }

  isEnded() {
    return !this.isPausing() && this._endTime < this._parent.now;
  }

  isRunning() {
    return !this.isPausing() && this._endTime >= this._parent.now;
  }
}