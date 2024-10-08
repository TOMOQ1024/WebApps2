import Core from "../Core";
import Map from "../Map";
import Scene from "./Scene";

export default class TitleScene implements Scene {
  map: Map|null = null;

  constructor (
    public core: Core
  ) {
  }

  async init () {
    this.map = await this.core.assetLoader.loadMap(1);
    this.map.addToScene();
  }

  update () {
  }
}