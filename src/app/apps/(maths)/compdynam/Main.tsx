import { useState } from "react";
import ControlPanel from "./Components/ControlPanel";
import Canvas from "./Components/Canvas";
import GraphMgr from "@/src/GraphMgr";
import { fragmentShader } from "./Shaders/FragmentShader";

export default function Main() {
  const [shader, setShader] = useState(fragmentShader);
  const [graph, setGraph] = useState<GraphMgr>(new GraphMgr());
  const [iterations, setIterations] = useState(50);
  const [renderMode, setRenderMode] = useState(0);

  return (
    <div>
      <Canvas
        shader={shader}
        onGraphChange={setGraph}
        iterations={iterations}
        renderMode={renderMode}
      />
      <ControlPanel
        onIterationsChange={setIterations}
        onFunctionChange={(glslCode) => {
          setShader(() => {
            let newShader = fragmentShader;

            if (glslCode !== undefined) {
              newShader = newShader.replace(
                /z\/\* input func here \*\/;/,
                `${glslCode};`
              );
            }

            // console.log(newShader);
            return newShader;
          });
        }}
        onRenderModeChange={setRenderMode}
      />
    </div>
  );
}
