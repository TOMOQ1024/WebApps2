import AssetLoader from "./AssetLoader";
import MatterMgr from "./MatterMgr";
import Player from "./Player";
import SceneMgr from "./scene/SceneMgr";
import TitleScene from "./scene/TitleScene";
import ThreeMgr from "./ThreeMgr";

export default class Core {
  assetLoader = new AssetLoader(this);
  sceneMgr = new SceneMgr();
  matterMgr = new MatterMgr();
  threeMgr = new ThreeMgr(this);
  interval: NodeJS.Timeout|null = null;
  player = new Player(this);
  keys: {[Key:string]: number} = {};
  mouseMovement = {x: 0, y: 0};

  constructor () { }
  
  async init () {
    this.player.ctrlAllowed = true;
    const titleScene = new TitleScene(this);
    await this.assetLoader.load();
    this.threeMgr.addFC();
    await titleScene.init();
    this.sceneMgr.addScene('title', titleScene);
    this.sceneMgr.setScene('title');
    this.beginLoop();
  }

  beginLoop() {
    this.interval = setInterval(()=>{
      this.loop();
    }, 1000/60);
  }

  endLoop() {
    if (!this.interval) return;
    clearInterval(this.interval);
  }

  loop () {
    this.player.update(1000/60);// 仮の引数
    this.sceneMgr.update();
    this.threeMgr.update(1000/60);
    this.threeMgr.render();

    this.mouseMovement.x = 0;
    this.mouseMovement.y = 0;
  }
}