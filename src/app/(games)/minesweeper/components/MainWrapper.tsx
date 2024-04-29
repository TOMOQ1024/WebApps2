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

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    }

    document.addEventListener('contextmenu', handleContextMenu, {passive: false});
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    }
  }, [game]);
  return (
    <div id='main-wrapper'></div>
  )
}
