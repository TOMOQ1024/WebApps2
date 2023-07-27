"use client"
import MainCanvas from "@/app/components/maincanvas"
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
      <MainCanvas/>
    </main>
  )
}
