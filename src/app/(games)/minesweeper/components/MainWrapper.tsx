'use client';
import { useEffect, useState } from "react";
import Game from "../Game";

export default function PixiTemplate() {
  const [game, setGame] = useState<Game|null>(null);
  useEffect(()=>{
    if (!game) {
      const newGame = new Game();
      setGame(newGame);
    }
  }, [game]);
  return (
    <div id='main-wrapper'></div>
  )
}
