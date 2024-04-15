"use client"
import { useEffect, useState } from "react";
import Core from "../Core";
import Canvas from "./Canvas";

export default function MainWrapper() {
  const [core, setCore] = useState<Core>();
  useEffect(() => {
    if (!core) {
      setCore(new Core());
    }
  }, [core]);
  
  return (
    <main id='main-wrapper'>
      <Canvas core={core}/>
    </main>
  );
}