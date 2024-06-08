"use client"
import { useEffect, useState } from "react";
import Core from "../src/Core";
import Canvas from "./Canvas";
import Controls from "./Controls";
import Logs from "./Logs";
import styles from "../page.module.scss";

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
    <main className={styles.main_wrapper} onContextMenu={handleContextMenu}>
      <Canvas core={core}/>
      <Controls core={core}/>
      <Logs core={core}/>
    </main>
  );
}