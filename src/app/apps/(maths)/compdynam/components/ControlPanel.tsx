import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { latexToGLSL } from "@/src/Parser/latexToGLSL";
import styles from "./ControlPanel.module.scss";

const EditableMathField = dynamic(
  () =>
    import("react-mathquill").then((mod) => {
      mod.addStyles();
      return mod.EditableMathField;
    }),
  { ssr: false }
);
const StaticMathField = dynamic(
  () =>
    import("react-mathquill").then((mod) => {
      mod.addStyles();
      return mod.StaticMathField;
    }),
  { ssr: false }
);

interface ControlPanelProps {
  onIterationsChange: (iterations: number) => void;
  onFunctionChange: (glslCode: string) => void;
  onInitialValueChange: (glslCode: string) => void;
}

export default function ControlPanel({
  onIterationsChange,
  onFunctionChange,
  onInitialValueChange,
}: ControlPanelProps) {
  const [iterations, setIterations] = useState("50");
  const [initialValue, setInitialValue] = useState("0");
  const [functionExpr, setFunctionExpr] = useState("z^2+c");
  const [error, setError] = useState<string | null>(null);

  // 反復回数のバリデーション
  const handleIterationsChange = (mathField: any) => {
    let value = mathField.latex().replace(/[^0-9]/g, "");
    if (value === "") value = "0";
    setIterations(value);
    const intVal = parseInt(value, 10);
    if (isNaN(intVal) || intVal < 0) {
      setError("反復回数は非負整数で入力してください。");
      return;
    }
    setError(null);
    onIterationsChange(intVal);
  };

  const handleInitialValueChange = (mathField: any) => {
    const newValue = mathField.latex();
    setInitialValue(newValue);
    try {
      const initialValueCode = latexToGLSL(newValue);
      onInitialValueChange(initialValueCode);
      setError(null);
    } catch (error) {
      setError("初期値の解析に失敗しました。正しい形式で入力してください。");
    }
  };

  const handleFunctionChange = (mathField: any) => {
    const newValue = mathField.latex();
    setFunctionExpr(newValue);
    try {
      const glslCode = latexToGLSL(newValue);
      onFunctionChange(glslCode);
      setError(null);
    } catch (error) {
      setError(`${error}`);
    }
  };

  return (
    <div className={styles.controlPanel}>
      <div className={styles.controlGroup}>
        <label className={styles.label}>数式</label>
        <div className={styles.mathContainer}>
          <StaticMathField className={styles.staticText}>f</StaticMathField>
          <EditableMathField
            latex={iterations}
            onChange={handleIterationsChange}
            className={styles.iterations}
            config={{ restrictMismatchedBrackets: true }}
          />
          <StaticMathField className={styles.staticText}>(</StaticMathField>
          <EditableMathField
            latex={initialValue}
            onChange={handleInitialValueChange}
            className={styles.input}
          />
          <StaticMathField className={styles.staticText}>
            ) \qquad \mid \qquad f(z)=
          </StaticMathField>
          <EditableMathField
            latex={functionExpr}
            onChange={handleFunctionChange}
            className={styles.input}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
