"use client";
import { useEffect, useState } from "react"
import { Game } from "./Game";
import Render from "./Render";
import Update from "./Update";


export default function Main(){
  useEffect(()=>{
    document.title = 'Nessy';
    let game = new Game(document.getElementById('cvs') as HTMLCanvasElement);

    const GameLoop = () => {
      Update(game);
      Render(game);
      requestAnimationFrame(GameLoop);
    }
    GameLoop();

    const HandleKeyDown = (e: KeyboardEvent) => {
      if(!game.keys[e.key.toLowerCase()]){
        game.keys[e.key.toLowerCase()] = 2;
      }
    }

    const HandleKeyUp = (e: KeyboardEvent) => {
      if(game.keys[e.key.toLowerCase()] === 2){
        setTimeout(() => {
          game.keys[e.key.toLowerCase()] = 0;
        }, 20);
      }
      else {
        game.keys[e.key.toLowerCase()] = 0;
      }
    }

    document.addEventListener('keydown', HandleKeyDown);
    document.addEventListener('keyup', HandleKeyUp);
    return () => {
      document.removeEventListener('keydown', HandleKeyDown);
      document.removeEventListener('keyup', HandleKeyUp);
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
        width='1024'
        height='1024'
        style={{
          width: '700px',
          // imageRendering: 'pixelated',
          maxWidth: 'min(90vw,85vh)',
          maxHeight: 'min(90vw,85vh)',
          margin: '10px'
        }}
      />
      <div
        style={{
          color: '#888',
          fontSize: 'small',
          lineHeight: 0,
        }}
      >操作：W,A,S,D,SPACE,SHIFT</div>
    </main>
  )
}
