import { Application, Assets, Rectangle, SCALE_MODES, Texture } from 'pixi.js';
import CellMgr from './CellMgr';

export default class Game {
  app: Application;
  cellMgr: CellMgr;

  constructor () {
    const wr = document.querySelector('#main-wrapper') as HTMLElement;
    this.app = new Application({
      resizeTo: wr,
    });
    wr.appendChild(this.app.view as HTMLCanvasElement);

    this.cellMgr = new CellMgr(this);

    (async (cm: CellMgr) => {
      const tilesetTex = (await Assets.load('/resources/minesweeper/tileset.png') as Texture).baseTexture;
      const atlas = (await Assets.load('/resources/minesweeper/tileset.json')).data.frames;
      tilesetTex.scaleMode = SCALE_MODES.NEAREST;
      const textures = [];
      for (let i=0; i<atlas.length; i++) {
        textures.push(
          new Texture(
            tilesetTex,
            new Rectangle(
              atlas[i].frame.x,
              atlas[i].frame.y,
              atlas[i].frame.w,
              atlas[i].frame.h
            )
          )
        );
      }
      // new pixi_tilemap.CompositeRectTileLayer(0, [sheet])
      cm.bindTextures(textures);
      cm.clear();
      cm.onResize();
    })(this.cellMgr);

    let t = 0;
    this.app.ticker.add((delta) =>
    {
      t += delta * 5e-2;
    });
  }
}
