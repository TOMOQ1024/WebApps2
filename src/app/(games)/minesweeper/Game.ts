import { Application, Assets, Rectangle, SCALE_MODES, Texture } from 'pixi.js';
import CellMgr from './CellMgr';

export default class Game {
  app = new Application();
  cellMgr = new CellMgr(this);

  constructor () {
    const wr = document.querySelector('#main-wrapper') as HTMLElement;
    
    (async () => {
      await this.app.init({
        resizeTo: wr,
      });
      console.log(this.app);
      wr.appendChild(this.app.canvas);
  
      const tilesetTex = await Assets.load('/resources/minesweeper/tileset.png') as Texture;
      const atlas = (await Assets.load('/resources/minesweeper/tileset.json')).data.frames;
      tilesetTex.source.scaleMode = 'nearest';
      const textures = [];
      for (let i=0; i<atlas.length; i++) {
        textures.push(
          new Texture(
            {
              frame: new Rectangle(
                atlas[i].frame.x,
                atlas[i].frame.y,
                atlas[i].frame.w,
                atlas[i].frame.h
              ),
              source: tilesetTex.source
            }
          )
        );
      }
      // new pixi_tilemap.CompositeRectTileLayer(0, [sheet])
      this.cellMgr.bindTextures(textures);
      this.cellMgr.clear();
      this.cellMgr.onResize();

      let t = 0;
      this.app.ticker.add((tck) =>
      {
        t += tck.deltaMS;
      });
    })();

  }
}
