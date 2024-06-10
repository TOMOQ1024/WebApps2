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
      const newCore = new Core();
      setCore(newCore);
    }
    const handleVisibilityChange = () => {
      console.log('!!!');
      if (!core) return;
      const t = core.ctx;
      if (!t) return;
      t.save();
      t.fillStyle = '#00000000';
      t.fillRect(0, 0, 1, 1);
      t.restore();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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