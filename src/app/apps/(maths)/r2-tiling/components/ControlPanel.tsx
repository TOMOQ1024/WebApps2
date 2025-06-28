import { useState, useEffect } from "react";
import { EditableMathField, StaticMathField } from "@/components/MathFields";
import styles from "./ControlPanel.module.scss";

export interface ControlPanelProps {
  onIterationsChange: (iterations: number) => void;
  onFunctionLatexChange: (latex: string) => void;
  onInitialValueLatexChange: (latex: string) => void;
  currentFunctionLatex: string;
  currentInitialValueLatex: string;
  currentIterations: number;
  error?: string | null;
}

export default function ControlPanel({
  onIterationsChange,
  onFunctionLatexChange,
  onInitialValueLatexChange,
  currentFunctionLatex,
  currentInitialValueLatex,
  currentIterations,
  error,
}: ControlPanelProps) {
  const [iterations, setIterations] = useState(currentIterations.toString());
  const [initialValue, setInitialValue] = useState(currentInitialValueLatex);
  const [functionExpr, setFunctionExpr] = useState(currentFunctionLatex);

  // 親コンポーネントからの値が変更された時に同期
  useEffect(() => {
    setIterations(currentIterations.toString());
  }, [currentIterations]);

  useEffect(() => {
    setInitialValue(currentInitialValueLatex);
  }, [currentInitialValueLatex]);

  useEffect(() => {
    setFunctionExpr(currentFunctionLatex);
  }, [currentFunctionLatex]);

  // 反復回数のバリデーション
  const handleIterationsChange = (mathField: any) => {
    const latex = mathField.latex();
    if (latex === "") {
      return;
    }
    if (/[^0-9]/.test(latex)) {
      return;
    }
    setIterations(latex);
    onIterationsChange(parseInt(latex, 10));
  };

  const handleInitialValueChange = (mathField: any) => {
    const newValue = mathField.latex();
    setInitialValue(newValue);
    onInitialValueLatexChange(newValue);
  };

  const handleFunctionChange = (mathField: any) => {
    const newValue = mathField.latex();
    setFunctionExpr(newValue);
    onFunctionLatexChange(newValue);
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
          config={{
            restrictMismatchedBrackets: true,
            autoOperatorNames:
              "sin cos tan cot sec csc exp sinh cosh tanh coth sech csch Log Re Im conj Arg",
          }}
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
          config={{
            restrictMismatchedBrackets: true,
            autoOperatorNames:
              "sin cos tan cot sec csc exp sinh cosh tanh coth sech csch Log Re Im conj Arg",
          }}
        />
      </div>
    </div>
  );
}
