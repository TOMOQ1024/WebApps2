import * as PIXI from 'pixi.js';
import CellMgr from './CellMgr';
import { ASSETS } from './definitions';

export default class Game {
  app: PIXI.Application;
  cellMgr: CellMgr;

  constructor () {
    const wr = document.querySelector('#main-wrapper') as HTMLElement;
    this.app = new PIXI.Application({
      resizeTo: wr
    });
    wr.appendChild(this.app.view as HTMLCanvasElement);

    this.cellMgr = new CellMgr(this);

    (async (cm: CellMgr) => {
      PIXI.Assets.add({alias: 'mine', src: '/resources/minesweeper/nyanpuppu.png'});
      const mineTex = await PIXI.Assets.load(ASSETS.MINE) as PIXI.Texture;
      PIXI.Sprite.from(mineTex);
      console.log(mineTex);
      cm.build();
    })(this.cellMgr);

    let t = 0;
    this.app.ticker.add((delta) =>
    {
      t += delta * 5e-2;
    });
  }
}
