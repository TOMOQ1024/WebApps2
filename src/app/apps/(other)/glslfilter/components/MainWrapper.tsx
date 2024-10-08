"use client";

import Split from "react-split";
import GLSLEditor from "./GLSLEditor";
import { useEffect, useState } from "react";
import Core from "../Core";
import InteractiveViewport from "@/components/InteractiveViewport";

export default function MainWrapper() {
  const [core, setCore] = useState<Core | null>(null);

  useEffect(() => {
    if (!core) {
      setCore(new Core());
    }
  }, [core]);

  return (
    <main>
      <Split
        className="split"
        sizes={[50, 50]}
        minSize={100}
        expandToMin={false}
        gutterSize={10}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
        onDrag={() => {
          const wr = document.querySelector(".canvas-wrapper") as HTMLElement;
        }}
      >
        <GLSLEditor core={core} />
        <InteractiveViewport>
          <div className="canvas-wrapper"></div>
        </InteractiveViewport>
      </Split>
    </main>
  );
}
