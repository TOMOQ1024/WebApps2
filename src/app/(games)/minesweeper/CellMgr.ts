import sleep from "@/src/Sleep";
import { CELLSTATE, CELLTYPE } from "./Definitions";
import Game from "./Game";
import { AlphaFilter, Container, DisplayObject, Filter, Sprite, Texture, filters } from 'pixi.js';

export default class CellMgr {
  l: number = 64;
  w: number = 9;
  h: number = 9;
  mines = 9;
  cells: {
    state: CELLSTATE;
    type: CELLTYPE;
    sprites: (DisplayObject & Sprite)[];
  }[][] = [];
  tileContainer =  new Container();
  textures: Texture[] = [];
  get remainCount () {
    return this.cells.flat().filter(c=>c.state!==CELLSTATE.OPENED).length;
  }
  isHalted = false;

  constructor (
    public parent: Game
  ) {
    this.parent.app.stage.addChild(this.tileContainer);
    this.w = parseInt(prompt(`横のサイズ(標準：${this.w})`) || `${this.w}`) || this.w;
    this.h = parseInt(prompt(`縦のサイズ(標準：${this.h})`) || `${this.h}`) || this.h;
    this.mines = parseInt(prompt(`地雷の数(標準：${this.mines})`) || `${this.mines}`) || this.mines;
  }

  bindTextures (textures: Texture[]) {
    this.textures = textures;
  }

  clear () {
    // セルの初期化
    this.cells = [];
    for (let y=0 ;y<this.h; y++) {
      this.cells.push([]);
      for (let x=0; x<this.w; x++) {
        this.cells[y].push({
          state: CELLSTATE.CLOSED,
          type: CELLTYPE.ZERO,
          sprites: [],
        });
      }
    }

    this.initTileContainer(true);
  }

  build (x: number, y: number) {
    if (this.w * this.h <= this.mines) {
      console.log('full of mine');
      return;
    }
    const minePos = [];
    const freePos = [];
    for (let i=0; i<this.w*this.h; i++) {
      if (i === x+y*this.w) continue;
      freePos.push(i);
    }
    while (minePos.length < this.mines) {
      if (!freePos.length) {
        console.error('!?!?!?!?');
        return;
      }
      const i = freePos.splice(Math.floor(Math.random()*freePos.length), 1)[0];
      minePos.push(i);
    }

    const inc = (x: number, y: number) => {
      if (!this.cells[y] || !this.cells[y][x]) return;
      if (this.cells[y][x].type === CELLTYPE.MINE) return;
      this.cells[y][x].type += 1;
    }

    for (let j=0; j<minePos.length; j++) {
      let x = minePos[j]%this.w;
      let y = Math.floor(minePos[j]/this.w);
      this.cells[y][x].type = CELLTYPE.MINE;
      for (let i=-4; i<5; i++) {
        if (!i) continue;
        inc(
          x + i-Math.round(i/3)*3,
          y + Math.round(i/3)
        );
      }
    }

    this.initTileContainer();
    this.open(x, y);
  }

  // タイルスプライトの作成
  initTileContainer (onClear = false) {
    this.tileContainer.removeChildren();
    for (let y=0 ;y<this.h; y++) {
      for (let x=0; x<this.w; x++) {
        this.updateTile(x, y, onClear);
      }
    }
  }

  createSprite (x: number, y: number, i: number) {
    let sp: DisplayObject & Sprite;
    sp = Sprite.from(this.textures[i]);
    sp.position = { x: x*this.l, y: y*this.l };
    sp.width = this.l;
    sp.height = this.l;
    this.tileContainer.addChild(sp);
    this.cells[y][x].sprites.push(sp);
    return sp;
  }

  updateTile (x: number, y: number, onClear = false) {
    let sp: DisplayObject & Sprite;
    this.tileContainer.removeChild(...this.cells[y][x].sprites);
    this.cells[y][x].sprites = [];
    switch (this.cells[y][x].state) {
      case CELLSTATE.CLOSED:
      case CELLSTATE.FLAG:
        sp = this.createSprite(x, y, 1);
        sp.eventMode = 'static';
        sp.cursor = 'pointer';
        if (onClear) {
          sp.on('click', ()=>this.build(x, y));
        }
        else {
          sp.on('click', () => {
            if (this.cells[y][x].state === CELLSTATE.FLAG) {
              this.toggleFlag(x, y);
            }
            else {
              this.open(x, y);
            }
          });
          sp.on('rightclick', (e)=>{
            e.preventDefault();
            this.toggleFlag(x, y);
          });
        }
        if (this.cells[y][x].state === CELLSTATE.FLAG) {
          sp = this.createSprite(x, y, 3);
          sp.on('click', ()=>this.toggleFlag(x, y));
        }
        break;
      case CELLSTATE.OPENED:
        sp = this.createSprite(x, y, 4);
        sp = this.createSprite(x, y, this.cells[y][x].type+2);
        if (this.cells[y][x].type !== CELLTYPE.ZERO) {
          sp.eventMode = 'static';
          sp.cursor = 'pointer';
          sp.on('click', ()=>this.openWithNum(x, y));
        }
        break;
    }
  }

  async open (x: number, y: number) {
    if (!this.cells[y] || !this.cells[y][x]) return;
    if (this.cells[y][x].state === CELLSTATE.OPENED && this.cells[y][x].type === CELLTYPE.ZERO) return;
    if (this.cells[y][x].type === CELLTYPE.MINE || this.cells[y][x].state === CELLSTATE.FLAG) {
      console.error('It\'s mine!');
      // 赤くしたりしたい!!!
      // this.cells[y][x].sprites[this.cells[y][x].sprites.length-1];
      this.isHalted = true;
      return;
    }
    this.cells[y][x].state = CELLSTATE.OPENED;
    this.updateTile(x, y);
    if (this.cells[y][x].type === CELLTYPE.ZERO) {
      for (let i=-4; i<5; i++) {
        if (!i) continue;
        await sleep(10);
        if (this.isHalted) return;
        this.open(
          x + i-Math.round(i/3)*3,
          y + Math.round(i/3)
        );
      }
    }
    
    // クリア判定
    if (this.remainCount === this.mines) {
      console.log('cleared');
      this.isHalted = true;
    }
  }

  async openWithNum (x: number, y: number) {
    let flagCount = 0;
    for (let i=-4; i<5; i++) {
      if (!i) continue;
      let X = x + i-Math.round(i/3)*3;
      let Y = y + Math.round(i/3);
      if (!this.cells[Y] || !this.cells[Y][X]) continue;
      if (this.cells[Y][X].state === CELLSTATE.FLAG) {
        flagCount++;
      }
    }
    if (flagCount !== this.cells[y][x].type-2) return;
    for (let i=-4; i<5; i++) {
      let X = x + i-Math.round(i/3)*3;
      let Y = y + Math.round(i/3);
      if (!i || (this.cells[Y] && this.cells[Y][X] && this.cells[Y][X].state === CELLSTATE.FLAG)) continue;
      await sleep(10);
      this.open(X, Y);
    }
  }

  toggleFlag (x: number, y: number) {
    if (this.cells[y][x].state === CELLSTATE.FLAG) {
      this.cells[y][x].state = CELLSTATE.CLOSED;
    }
    else {
      this.cells[y][x].state = CELLSTATE.FLAG;
    }
    this.updateTile(x, y);
  }
}
