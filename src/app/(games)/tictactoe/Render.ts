import Game from "./Game"

export default function Render(game: Game){
  if(!game.ctx)return
  game.ctx.fillStyle = 'white'
  game.ctx.fillRect(0, 0, game.cvs.width, game.cvs.height)
  switch(game.scene){
    case 'title':
      game.ctx.fillStyle = 'black'
      game.ctx.textAlign = 'center'
      game.ctx.textBaseline = 'middle'
      game.ctx.font = `${game.cvs.width/8}px serif`
      game.ctx.fillText('Tic Tac Toe', game.cvs.width/2, game.cvs.height/2)
      break
    case 'game':
    case 'result':
      game.ctx.strokeStyle = 'black'
      game.ctx.beginPath()
      for(let i=1; i<3; i++){
        game.ctx.moveTo(game.cvs.width/3*i, 0)
        game.ctx.lineTo(game.cvs.width/3*i, game.cvs.height)
        game.ctx.moveTo(0, game.cvs.height/3*i)
        game.ctx.lineTo(game.cvs.width, game.cvs.height/3*i)
      }
      game.ctx.stroke()
      game.ctx.font = `${game.cvs.width/4}px serif`
      game.ctx.fillStyle = 'black'
      for(let y=0; y<3; y++){
        for(let x=0; x<3; x++){
          switch(game.cells[y][x]){
            case 0:
              game.ctx.fillText('x',game.cvs.width/3*(x+0.5),game.cvs.height/3*(y+0.5))
              break
            case 1:
              game.ctx.fillText('o',game.cvs.width/3*(x+0.5),game.cvs.height/3*(y+0.5))
              break
          }
        }
      }
      if(game.scene === 'result'){
        game.ctx.fillStyle = '#ffffffcc'
        game.ctx.fillRect(0, 0, game.cvs.width, game.cvs.height)
        game.ctx.fillStyle = 'black'
        game.ctx.font = `${game.cvs.width/10}px serif`
        game.ctx.fillText(game.result, game.cvs.width/2, game.cvs.height/2)
      }
      break
  }
}