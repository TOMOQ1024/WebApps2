import { useState } from "react";
import { useShaderUpdater } from "./Controls/useShaderUpdater";
import ControlPanel from "./Controls/ControlPanel";
import Canvas from "./components/Canvas";
import { Graph } from "./Controls/GraphManager";
import * as THREE from "three";

export default function Main() {
  const { shader, updateShader } = useShaderUpdater();
  const [graph, setGraph] = useState<Graph>({
    origin: new THREE.Vector2(0, 0),
    radius: 2,
  });
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
        onFunctionChange={(glslCode) => updateShader({ function: glslCode })}
        onRenderModeChange={setRenderMode}
      />
    </div>
  );
}
