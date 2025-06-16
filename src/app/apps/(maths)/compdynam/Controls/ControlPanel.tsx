import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { latexToGLSL } from "../Parser/latexToGLSL";
import styles from "./ControlPanel.module.scss";

const EditableMathField = dynamic(
  () =>
    import("react-mathquill").then((mod) => {
      mod.addStyles();
      return mod.EditableMathField;
    }),
  { ssr: false }
);

interface ControlPanelProps {
  onIterationsChange: (iterations: number) => void;
  onFunctionChange: (glslCode: string) => void;
  onRenderModeChange: (mode: number) => void;
}

export default function ControlPanel({
  onIterationsChange,
  onFunctionChange,
  onRenderModeChange,
}: ControlPanelProps) {
  const [iterations, setIterations] = useState(50);
  const [latex, setLatex] = useState("z^2+c");
  const [renderMode, setRenderMode] = useState(0);

  // 初期値の適用
  useEffect(() => {
    onIterationsChange(iterations);
    try {
      const glslCode = latexToGLSL(latex);
      onFunctionChange(glslCode);
    } catch (error) {
      console.error("Failed to parse initial LaTeX:", error);
    }
    onRenderModeChange(renderMode);
  }, []); // 初回マウント時のみ実行

  const handleLatexChange = (mathField: any) => {
    const newLatex = mathField.latex();
    setLatex(newLatex);
    try {
      const glslCode = latexToGLSL(newLatex);
      onFunctionChange(glslCode);
    } catch (error) {
      console.error("Failed to parse LaTeX:", error);
    }
  };

  return (
    <div className={styles.controlPanel}>
      <div className={styles.controlGroup}>
        <label className={styles.label}>反復回数</label>
        <input
          type="number"
          min="0"
          value={iterations}
          onChange={(e) => setIterations(parseInt(e.target.value))}
          className={styles.input}
        />
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>関数 f(z)</label>
        <EditableMathField
          latex={latex}
          onChange={handleLatexChange}
          className={styles.input}
        />
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>描画モード</label>
        <select
          value={renderMode}
          onChange={(e) => setRenderMode(parseInt(e.target.value))}
          className={styles.select}
        >
          <option value={0}>HSV</option>
          <option value={1}>Grayscale</option>
        </select>
      </div>
    </div>
  );
}
