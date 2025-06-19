import { useEffect, useState, useCallback } from "react";
import Canvas from "./Canvas";
import ControlButtons from "./ControlButtons";
import ControlPanel, { MatrixValue, ToggleValue } from "./ControlPanel";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";

export default function Main() {
  const [renderMode, setRenderMode] = useState(0);

  // 4x4行列とo/xトグルの状態
  const [matrix, setMatrix] = useState<MatrixValue>([
    ["1", "2", "2", "2"],
    ["2", "1", "2", "2"],
    ["2", "2", "1", "2"],
    ["2", "2", "2", "1"],
  ]);
  const [toggles, setToggles] = useState<ToggleValue>(["x", "x", "x", "x"]);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [diagram, setDiagram] = useState<CoxeterDynkinDiagram>(
    CoxeterDynkinDiagram.fromStringMatrix(matrix, toggles)
  );

  // 入力値からCoxeterDynkinDiagramを生成
  useEffect(() => {
    // バリデーション
    let error: string | null = null;
    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        const val = matrix[i][j];
        if (i === j && val !== "1") {
          error = `対角成分(${i + 1},${j + 1})は1でなければなりません。`;
        }
        if (val === "" || (!/^\d+$/.test(val) && !/^\d+\/\d+$/.test(val))) {
          error = `(${i + 1},${j + 1})に不正な値があります。`;
        }
        // 1以上の整数または分数チェック
        if (/^\d+$/.test(val) && parseInt(val) < 1) {
          error = `(${i + 1},${j + 1})は1以上の整数でなければなりません。`;
        }
        if (/^(\d+)\/(\d+)$/.test(val)) {
          const match = val.match(/^(\d+)\/(\d+)$/);
          if (!match || parseInt(match[1]) < 1 || parseInt(match[2]) < 1) {
            error = `(${i + 1},${
              j + 1
            })の分数は分子・分母とも1以上でなければなりません。`;
          }
        }
      }
    }
    setMatrixError(error);
    if (error) {
      return;
    }
    setDiagram(CoxeterDynkinDiagram.fromStringMatrix(matrix, toggles));
    console.log(CoxeterDynkinDiagram.fromStringMatrix(matrix, toggles));
  }, [matrix, toggles]);

  return (
    <main className="relative">
      <Canvas diagram={diagram} renderMode={renderMode} />
      <ControlPanel
        matrix={matrix}
        toggles={toggles}
        onMatrixChange={setMatrix}
        onTogglesChange={setToggles}
        error={matrixError}
      />
      <ControlButtons
        onRenderModeChange={setRenderMode}
        currentRenderMode={renderMode}
      />
    </main>
  );
}
