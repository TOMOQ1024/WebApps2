import SceneMgr from '@/src/SceneMgr';
import * as PIXI from 'pixi.js';
import TitleScene from './scenes/TitleScene';

export default class Core {
  cvs: HTMLCanvasElement;
  app: PIXI.Application;
  sceneMgr = new SceneMgr();

  constructor () {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;
    this.app = new PIXI.Application({ background: '#14001e', resizeTo: document.getElementById('canvas-wrapper')||window });
    document.getElementById('canvas-wrapper')!.appendChild(this.app.view as HTMLCanvasElement);

    this.init();
  }
  
  async init () {
    this.sceneMgr.addScene('title', new TitleScene(this));
    this.sceneMgr.current = 'title';
  }
}