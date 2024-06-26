"use client";
import MainCanvas from "@/components/maincanvas";
import { useEffect, useState } from "react"
import { Game } from "./Game";
import Render from "./Render";
import Update from "./Update";


export default function MainWrapper(){
  useEffect(()=>{
    document.title = 'Nessy';
    let game = new Game(document.getElementById('cvs') as HTMLCanvasElement);

    const GameLoop = () => {
      Update(game);
      Render(game);
      console.log('loop');
    }

    const interval = setInterval(GameLoop, 1000/60);

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
      clearInterval(interval);
      document.removeEventListener('keydown', HandleKeyDown);
      document.removeEventListener('keyup', HandleKeyUp);
    }
  }, []);

  return (
    <div
      style={{
        textAlign: 'center'
      }}
    >
      <MainCanvas/>
      <div
        style={{
          color: '#888',
          fontSize: 'small',
          lineHeight: 0,
        }}
      >操作：W,A,S,D,SPACE,SHIFT</div>
    </div>
  )
}
