import Core from "./Core";

export default function render(this: Core) {

  // クリア
  this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);

  const l = Math.max(this.cvs.width/this.W, this.cvs.height/this.H);
  // 各セルの描画
  for(let y=0; y<this.H; y++){
    for(let x=0; x<this.W; x++){
      this.ctx.fillStyle = this.data[y][x] ? 'white' : 'black';
      this.ctx.fillRect((x+.05)*l, (y+.05)*l, l*.9, l*.9);
    }
  }

  // // グリッドの追加
  // this.ctx.strokeStyle = 'gray';
  // this.ctx.lineWidth = l/10;
  // this.ctx.beginPath();
  // for(let y=0; y<=this.H; y++){
  //   this.ctx.moveTo(0, y*l);
  //   this.ctx.lineTo(this.cvs.width, y*l);
  // }
  // for(let x=0; x<=this.W; x++){
  //   this.ctx.moveTo(x*l, 0);
  //   this.ctx.lineTo(x*l, this.cvs.height);
  // }
  // this.ctx.stroke();
}