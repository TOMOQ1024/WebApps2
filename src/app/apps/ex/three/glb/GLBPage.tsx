"use client";

import { useEffect, useState } from "react";
import Core from "./Core";
import "./app.scss";

export default function GLBPage() {
  const [core, setCore] = useState<Core | null>(null);

  useEffect(() => {
    let newCore: Core;
    if (!core) {
      newCore = new Core();
      setCore(newCore);

      newCore.beginLoop();
    }
    if (core) {
      return () => {
        newCore.endLoop();
      };
    }
  }, [core]);

  return (
    <main className="main-wrapper">
      <canvas id="cvs" width={800} height={800} />
    </main>
  );
}
