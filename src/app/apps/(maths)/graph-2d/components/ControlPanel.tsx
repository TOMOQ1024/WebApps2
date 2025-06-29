import { useState, useEffect } from "react";
import { EditableMathField, StaticMathField } from "@/components/MathFields";
import styles from "./ControlPanel.module.scss";

export interface ControlPanelProps {
  onFunctionLatexChange: (latex: string) => void;
  currentFunctionLatex: string;
  error?: string | null;
}

export default function ControlPanel({
  onFunctionLatexChange,
  currentFunctionLatex,
  error,
}: ControlPanelProps) {
  const [functionExpr, setFunctionExpr] = useState(currentFunctionLatex);

  useEffect(() => {
    setFunctionExpr(currentFunctionLatex);
  }, [currentFunctionLatex]);

  const handleFunctionChange = (mathField: any) => {
    const newValue = mathField.latex();
    setFunctionExpr(newValue);
    onFunctionLatexChange(newValue);
  };

  return (
    <div className={styles.controlPanel}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.mathContainer}>
        <StaticMathField className={styles.staticText}>
          f\left(x,y\right)=
        </StaticMathField>
        <EditableMathField
          latex={functionExpr}
          onChange={handleFunctionChange}
          className={styles.functionExpr}
          config={{
            restrictMismatchedBrackets: true,
            autoOperatorNames:
              "sin cos tan cot sec csc exp sinh cosh tanh coth sech csch ln",
          }}
        />
      </div>
    </div>
  );
}
