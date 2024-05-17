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
    
    const handleResize = () => {
      console.log('eee');
      if (!game) return;
      game.cellMgr.onResize();
    }

    document.addEventListener('contextmenu', handleContextMenu, {passive: false});
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
    }
  }, [game]);
  return (
    <div id='main-wrapper'></div>
  )
}
