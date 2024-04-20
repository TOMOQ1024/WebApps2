"use client"
import { useEffect, useState } from "react";
import Core from "../Core";
import Canvas from "./Canvas";
import Controls from "./Controls";

export default function MainWrapper() {
  const [core, setCore] = useState<Core>();
  useEffect(() => {
    if (!core) {
      setCore(new Core());
    }
  }, [core]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  }
  
  return (
    <main id='main-wrapper' onContextMenu={handleContextMenu}>
      <Canvas core={core}/>
      <Controls core={core}/>
    </main>
  );
}