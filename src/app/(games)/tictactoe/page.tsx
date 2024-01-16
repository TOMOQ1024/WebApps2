"use client"
import MainCanvas from "@/components/maincanvas"
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
      
      setGame(initGame);
    }
    else {
      const GameLoop = () => {
        Update();
        Render(game);
      }
      const interval = setInterval(GameLoop, 1000/60);

      const HandleClick = (e: MouseEvent) => {
        _HandleClick(game, e);
      }
      game.cvs.addEventListener('click', HandleClick)
      return () => {
        clearInterval(interval);
        game.cvs.removeEventListener('click', HandleClick)
      }
    }
  }, [game]);

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
