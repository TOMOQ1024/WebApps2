import Game from "./Game"

export function _HandleClick(game: Game, e: MouseEvent){
  const rect = (e.target as unknown as HTMLElement).getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) * 3 / rect.width)
  const y = Math.floor((e.clientY - rect.top) * 3 / rect.height)
  switch(game.scene){
    case 'title':
      game.scene = 'game'
      game.player = 0
      game.cells = []
      for(let y=0; y<3; y++){
        game.cells.push([])
        for(let x=0; x<3; x++){
          game.cells[y].push(-1)
        }
      }
      break;
    case 'game':
      if(game.cells[y][x] < 0){
        game.cells[y][x] = game.player
        game.player ^= 1
        if(0 <= game.cells.reduce((a: any,b: any)=>[Math.min(...a, ...b)])[0]){
          // 引き分け
          game.result = 'draw'
          game.scene = 'result'
          return
        }
        const checkList = [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
          [0, 4, 8],
          [2, 4, 6],
        ]
        checkList.forEach(l=>{
          const line = l.map(p=>game.cells[Math.floor(p/3)][p%3])
          if(0<= line[0] && line[0] === line[1] && line[1] === line[2]){
            // line[0] の勝ち
            game.result = `${'xo'[line[0]]} win`
            game.scene = 'result'
            return
          }
        })
      }
      break
    case 'result':
      game.scene = 'title'
      break
  }
}