import { useState } from "react";
import { latexToGLSL } from "@/src/Parser/latexToGLSL";
import { EditableMathField, StaticMathField } from "@/components/MathFields";
import styles from "./ControlPanel.module.scss";

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
    const latex = mathField.latex();
    if (latex === "") {
      setError("反復回数を入力してください。");
      return;
    }
    if (/[^0-9]/.test(latex)) {
      setError("反復回数は非負整数で入力してください。");
      return;
    }
    setError(null);
    setIterations(latex);
    onIterationsChange(parseInt(latex, 10));
  };

  const handleInitialValueChange = (mathField: any) => {
    const newValue = mathField.latex();
    setInitialValue(newValue);
    try {
      const initialValueCode = latexToGLSL(
        newValue,
        ["sin", "cos", "tan", "exp", "sinh", "cosh", "tanh"],
        ["c", "t"]
      );
      onInitialValueChange(initialValueCode);
      setError(null);
    } catch (error) {
      setError(`${error}`);
    }
  };

  const handleFunctionChange = (mathField: any) => {
    const newValue = mathField.latex();
    setFunctionExpr(newValue);
    try {
      const glslCode = latexToGLSL(
        newValue,
        ["sin", "cos", "tan", "exp", "sinh", "cosh", "tanh"],
        ["z", "c", "t"]
      );
      onFunctionChange(glslCode);
      setError(null);
    } catch (error) {
      setError(`${error}`);
    }
  };

  return (
    <div className={styles.controlPanel}>
      {error && <div className={styles.error}>{error}</div>}
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
          className={styles.initialValue}
        />
        <StaticMathField className={styles.staticText}>
          ) \qquad \mid \qquad f(z)=
        </StaticMathField>
        <EditableMathField
          latex={functionExpr}
          onChange={handleFunctionChange}
          className={styles.functionExpr}
        />
      </div>
    </div>
  );
}
