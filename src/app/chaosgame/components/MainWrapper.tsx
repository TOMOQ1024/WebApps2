"use client"
import { useEffect, useState } from "react"
import CCore from "../ChaosCore";
import CanvasWrapper from "./CanvasWrapper";

export default function MainWrapper(){
  const [core, setCore] = useState(new CCore());
  useEffect(() => {
    core.init();
    core.beginLoop();
    return () => {
      core.endLoop();
    }
  }, [core]);

  return (
    <main id='main-wrapper'>
      <CanvasWrapper/>
    </main>
  )
}
