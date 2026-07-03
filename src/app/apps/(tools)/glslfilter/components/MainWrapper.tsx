"use client";

import Split from "react-split";
import GLSLEditor from "./GLSLEditor";
import { useEffect, useState } from "react";
import Core from "../Core";
import InteractiveViewport from "@/components/InteractiveViewport";
import { useSearchParams } from "next/navigation";
import { getFragmentShader } from "../shaders";
import styles from "../styles.module.scss";

export default function MainWrapper() {
  const [core, setCore] = useState<Core | null>(null);
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!core) {
      setCore(new Core());
    }

    if (core && searchParams) {
      const name = searchParams.get("content");
      if (name == null) {
        setIsReady(true);
        return;
      }

      const frag = getFragmentShader(name);
      if (frag == null) {
        console.error(`Unknown shader: ${name}`);
        setIsReady(true);
        return;
      }

      core.frag = frag;
      setIsReady(true);
    }
  }, [core, searchParams]);

  return (
    <main className={styles.main}>
      <Split
        className={styles.split}
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
          const wr = document.querySelector(
            styles.canvasWrapper,
          ) as HTMLElement;
        }}
      >
        <GLSLEditor core={isReady ? core : null} />
        <InteractiveViewport>
          <div className={styles.canvasWrapper}></div>
        </InteractiveViewport>
      </Split>
    </main>
  );
}
