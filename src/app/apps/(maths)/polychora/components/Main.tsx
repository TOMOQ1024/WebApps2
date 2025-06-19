import { useEffect, useState, useCallback } from "react";
import ControlPanel from "./ControlPanel";
import Canvas from "./Canvas";
import ControlButtons from "./ControlButtons";
import GraphMgr from "@/src/GraphMgr";
import { fragmentShader } from "../Shaders/FragmentShader";

export default function Main() {
  const [shader, setShader] = useState(fragmentShader);
  const [graph, setGraph] = useState<GraphMgr>(new GraphMgr());
  const [iterations, setIterations] = useState(50);
  const [renderMode, setRenderMode] = useState(0);
  const [currentFunctionCode, setCurrentFunctionCode] = useState<string>(
    "cpow(z, vec2(2.0, 0.0)) + c"
  );
  const [currentInitialValueCode, setCurrentInitialValueCode] =
    useState<string>("vec2(0.0, 0.0)");

  const updateShader = useCallback(
    (
      functionCode: string | undefined,
      initialValueCode: string | undefined
    ) => {
      setShader(() => {
        let newShader = fragmentShader;

        // 関数コードの更新
        const finalFunctionCode =
          functionCode !== undefined ? functionCode : currentFunctionCode;
        if (finalFunctionCode) {
          newShader = newShader.replace(
            /z\/\* input func here \*\/;/,
            `${finalFunctionCode};`
          );
        }

        // 初期値コードの更新
        const finalInitialValueCode =
          initialValueCode !== undefined
            ? initialValueCode
            : currentInitialValueCode;
        if (finalInitialValueCode) {
          newShader = newShader.replace(
            /c\/\* input initial value here \*\/;/,
            `${finalInitialValueCode};`
          );
        }

        return newShader;
      });

      // 状態を更新
      if (functionCode !== undefined) {
        setCurrentFunctionCode(functionCode);
      }
      if (initialValueCode !== undefined) {
        setCurrentInitialValueCode(initialValueCode);
      }
    },
    [currentFunctionCode, currentInitialValueCode]
  );

  // コンポーネントのマウント時に一度だけ初期値を設定
  useEffect(() => {
    updateShader("cpow(z, vec2(2.0, 0.0)) + c", "vec2(0.0, 0.0)");
  }, []); // 空の依存配列で、マウント時に一度だけ実行

  const handleResetGraph = () => {
    setGraph(new GraphMgr());
  };

  return (
    <main className="relative">
      <Canvas
        shader={shader}
        graph={graph}
        onGraphChange={setGraph}
        iterations={iterations}
        renderMode={renderMode}
      />
      <ControlPanel
        onIterationsChange={setIterations}
        onFunctionChange={(functionCode) => {
          updateShader(functionCode, undefined);
        }}
        onInitialValueChange={(initialValueCode) => {
          updateShader(undefined, initialValueCode);
        }}
      />
      <ControlButtons
        onResetGraph={handleResetGraph}
        onRenderModeChange={setRenderMode}
        currentRenderMode={renderMode}
      />
    </main>
  );
}
