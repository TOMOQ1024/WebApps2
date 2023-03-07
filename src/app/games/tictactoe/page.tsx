"use client"
import { useEffect, useState } from "react"
import Game from "./Game"
import { _HandleClick } from "./HandleClick"
import Render from "./Render"
import Update from "./Update"

export default function Main(){
  const [game, setGame] = useState<Game|null>(null)

  useEffect(()=>{
    if(!game){
      let initGame = new Game(
        document.getElementById('cvs') as HTMLCanvasElement,
        3, 3
      )

      const GameLoop = () => {
        Update()
        Render(initGame)
        requestAnimationFrame(GameLoop)
      }
      GameLoop()

      setGame(initGame);

      const HandleClick = (e: MouseEvent) => {
        _HandleClick(initGame, e);
      }

      initGame.cvs.addEventListener('click', HandleClick)
      return () => {
        initGame.cvs.removeEventListener('click', HandleClick)
      }
    }
  }, []);

  useEffect(()=>{

  })

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
