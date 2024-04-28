import * as PIXI from 'pixi.js';
import Game from "./Game";
import { ASSETS, CELL } from "./definitions";

export default class CellMgr {
  w: number = 9;
  h: number = 9;
  l: number = 60;
  cells: CELL[][] = [];
  tileContainer =  new PIXI.Container();

  constructor (
    public parent: Game
  ) {
    // const mineTex = PIXI.Assets.get(ASSETS.MINE);
    // const mine = PIXI.Sprite.from(mineTex);
    // mine.scale.set(3);

    // mine.anchor.set(0.5);

    // mine.x = this.app.screen.width / 2;
    // mine.y = this.app.screen.height / 2;
    this.parent.app.stage.addChild(this.tileContainer);
  }

  build () {
    const mineTex = PIXI.Assets.get(ASSETS.MINE) as PIXI.Texture;
    mineTex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    let sp: PIXI.DisplayObject & PIXI.Sprite;

    this.cells = [];
    for (let y=0 ;y<this.h; y++) {
      this.cells.push([]);
      for (let x=0; x<this.w; x++) {
        this.cells[y].push(CELL.ZERO);
        sp = PIXI.Sprite.from(mineTex);
        sp.width = this.l;
        sp.height = this.l;
        sp.x = x * this.l;
        sp.y = y * this.l;
        sp.on('click', ()=>this.onClick(x, y));
        sp.eventMode = 'static';
        this.tileContainer.addChild(sp);
      }
    }
  }

  onClick (x: number, y: number) {
    console.log(`(${x},${y}) clicked`);
  }
}
