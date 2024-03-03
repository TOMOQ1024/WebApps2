import Scene from "./Scene";

export default class SceneMgr {
  scenes: {[key: string]: Scene} = {};
  currentName: string = '';

  get currentScene () {
    if (!this.scenes[this.currentName]) {
      throw new Error(`scene '${this.currentName}' not found`);
    }
    return this.scenes[this.currentName]
  }

  constructor () { }

  addScene (name: string, scene: Scene) {
    this.scenes[name] = scene;
  }

  setScene (name: string) {
    if (!this.scenes[name]) {
      console.error(`scene '${name}' not found`);
      return;
    }
    this.currentName = name;
  }

  update () {
    this.currentScene.update();
  }
}