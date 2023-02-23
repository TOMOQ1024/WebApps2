"use client"
import { useEffect } from "react"
import Mouse from "../Mouse"

let loopStarted: boolean = false
let player: 0|1
let scene: 'title'|'game'|'result' = 'title'
let result: string
let cvs: HTMLCanvasElement
let ctx: CanvasRenderingContext2D
let cells: number[][]
let mouse: Mouse

export default function Main(){
  useEffect(()=>{
    if(!loopStarted){
      cvs = document.getElementById('cvs') as HTMLCanvasElement
      ctx = cvs.getContext('2d')!
      GameLoop()
      loopStarted = true
    }
    cvs.addEventListener('click', HandleClick)
    return () => {
      cvs.removeEventListener('click', HandleClick)
    }
  }, []);
  return (
    <main
      style={{
        textAlign: 'center'
      }}
    >
      <canvas
        id='cvs'
        width='1000'
        height='1000'
        style={{
          width: '700px',
          maxWidth: 'min(90vw,85vh)',
          maxHeight: 'min(90vw,85vh)',
          margin: '10px'
        }}
      />
    </main>
  )
}

function HandleClick(e: MouseEvent){
  const rect = cvs.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) * 3 / rect.width)
  const y = Math.floor((e.clientY - rect.top) * 3 / rect.height)
  switch(scene){
    case 'title':
      scene = 'game'
      player = 0
      cells = []
      for(let y=0; y<3; y++){
        cells.push([])
        for(let x=0; x<3; x++){
          cells[y].push(-1)
        }
      }
      break;
    case 'game':
      if(cells[y][x] < 0){
        cells[y][x] = player
        player ^= 1
        if(0 <= cells.reduce((a,b)=>[Math.min(...a, ...b)])[0]){
          // 引き分け
          result = 'draw'
          scene = 'result'
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
          const line = l.map(p=>cells[Math.floor(p/3)][p%3])
          if(0<= line[0] && line[0] === line[1] && line[1] === line[2]){
            // line[0] の勝ち
            result = `${'xo'[line[0]]} win`
            scene = 'result'
            return
          }
        })
      }
      break
    case 'result':
      scene = 'title'
      break
  }
}

function Update(){
  //
}

function Render(){
  if(!ctx)return
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, cvs.width, cvs.height)
  switch(scene){
    case 'title':
      ctx.fillStyle = 'black'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${cvs.width/8}px serif`
      ctx.fillText('Tic Tac Toe', cvs.width/2, cvs.height/2)
      break
    case 'game':
    case 'result':
      ctx.strokeStyle = 'black'
      ctx.beginPath()
      for(let i=1; i<3; i++){
        ctx.moveTo(cvs.width/3*i, 0)
        ctx.lineTo(cvs.width/3*i, cvs.height)
        ctx.moveTo(0, cvs.height/3*i)
        ctx.lineTo(cvs.width, cvs.height/3*i)
      }
      ctx.stroke()
      ctx.font = `${cvs.width/4}px serif`
      ctx.fillStyle = 'black'
      for(let y=0; y<3; y++){
        for(let x=0; x<3; x++){
          switch(cells[y][x]){
            case 0:
              ctx.fillText('x',cvs.width/3*(x+0.5),cvs.height/3*(y+0.5))
              break
            case 1:
              ctx.fillText('o',cvs.width/3*(x+0.5),cvs.height/3*(y+0.5))
              break
          }
        }
      }
      if(scene === 'result'){
        ctx.fillStyle = '#ffffffcc'
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        ctx.fillStyle = 'black'
        ctx.font = `${cvs.width/10}px serif`
        ctx.fillText(result, cvs.width/2, cvs.height/2)
      }
      break
  }
}

function GameLoop(){
  Update()
  Render()
  requestAnimationFrame(GameLoop)
}