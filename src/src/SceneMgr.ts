import Scene from "./Scene";

export default class SceneMgr {
  private _current: string = 'INITIAL CURRENT';
  private _next: string = '';
  get current () {
    return this._current;
  }
  set current (s: string) {
    this._next = s;
    if (this._current === 'INITIAL CURRENT') {
      this._current = this._next;
      this.initScene();
    }
  }
  scenes: {[name: string]: Scene} = {};

  addScene (n: string, s: Scene) {
    this.scenes[n] = s;
  }

  initScene (): boolean {
    return this.scenes[this._current].init();
  }

  update (): boolean {
    const s = this.scenes[this._current];
    if (!s) return false;

    const r = s.update();
    if (!r && this._current !== this._next) {
      this._current = this._next;
      this.initScene();
      return this.update();
    }

    return r;
  }

  render (): boolean {
    const s = this.scenes[this._current];
    if (!s) return false;

    const r = s.render();
    if (!r && this._current !== this._next) {
      this._current = this._next;
      this.initScene();
      return this.render();
    }

    return r;
  }
}