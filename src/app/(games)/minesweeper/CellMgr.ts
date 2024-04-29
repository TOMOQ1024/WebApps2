import { CELLSTATE, CELLTYPE } from "./Definitions";
import Game from "./Game";
import { Container, DisplayObject, Sprite, Texture } from 'pixi.js';

export default class CellMgr {
  w: number = 9;
  h: number = 9;
  l: number = 64;
  cells: {
    state: CELLSTATE;
    type: CELLTYPE;
  }[][] = [];
  tileContainer =  new Container();

  constructor (
    public parent: Game
  ) {
    // const mineTex = Assets.get(ASSETS.MINE);
    // const mine = Sprite.from(mineTex);
    // mine.scale.set(3);

    // mine.anchor.set(0.5);

    // mine.x = this.app.screen.width / 2;
    // mine.y = this.app.screen.height / 2;
    this.parent.app.stage.addChild(this.tileContainer);
  }

  build (textures: Texture[]) {
    let sp: DisplayObject & Sprite;

    this.cells = [];
    for (let y=0 ;y<this.h; y++) {
      this.cells.push([]);
      for (let x=0; x<this.w; x++) {
        // this.cells[y].push({
        //   state: CELLSTATE.OPENED,
        //   type: CELLTYPE.ZERO,
        // });
        this.cells[y].push({
          state: Math.floor(Math.random()*3),
          type: Math.floor(Math.random()*11),
        });
      }
    }

    for (let y=0 ;y<this.h; y++) {
      for (let x=0; x<this.w; x++) {
        switch (this.cells[y][x].state) {
          case CELLSTATE.CLOSED:
          case CELLSTATE.FLAG:
            sp = Sprite.from(textures[1]);
            sp.position = { x: x*this.l, y: y*this.l };
            sp.width = this.l;
            sp.height = this.l;
            sp.eventMode = 'static';
            sp.on('click', ()=>this.onClick(x, y));
            this.tileContainer.addChild(sp);
            if (this.cells[y][x].state === CELLSTATE.FLAG) {
              sp = Sprite.from(textures[3]);
              sp.position = { x: x*this.l, y: y*this.l };
              sp.width = this.l;
              sp.height = this.l;
              this.tileContainer.addChild(sp);
            }
            break;
          case CELLSTATE.OPENED:
            sp = Sprite.from(textures[4]);
            sp.position = { x: x*this.l, y: y*this.l };
            sp.width = this.l;
            sp.height = this.l;
            this.tileContainer.addChild(sp);
            sp = Sprite.from(textures[
              this.cells[y][x].type+2
            ]);
            sp.position = { x: x*this.l, y: y*this.l };
            sp.width = this.l;
            sp.height = this.l;
            this.tileContainer.addChild(sp);
            break;
        }
        
      }
    }
  }

  onClick (x: number, y: number) {
    console.log(`(${x},${y}) clicked`);
  }
}
