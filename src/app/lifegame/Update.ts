import Core from "./Core";

export default function update(this: Core) {
  let databuf: boolean[][] = [];
  let c: number;
  for(let y=0; y<this.H; y++){
    databuf.push([]);
    for(let x=0; x<this.W; x++){
      // 周囲にある生きたセルのカウント
      c = 0;
      for(let dy=-1; dy<=1; dy++){
        for(let dx=-1; dx<=1; dx++){
          c += (dx || dy) && this.data[(y+dy+this.H)%this.H][(x+dx+this.W)%this.W] ? 1 : 0;
        }
      }
      // 次状態の決定
      if(c === 3){
        databuf[y].push(true);
      }
      else if(c !== 2){
        databuf[y].push(false);
      }
      else{
        databuf[y].push(this.data[y][x]);
      }
    }
  }

  for(let y=0; y<this.H; y++){
    for(let x=0; x<this.W; x++){
      this.data[y][x] = databuf[y][x];
    }
  }
}