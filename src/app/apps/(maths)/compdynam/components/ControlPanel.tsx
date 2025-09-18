import { useState, useEffect } from "react";
import { EditableMathField, StaticMathField } from "@/components/MathFields";

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
    <div className="absolute bottom-4 left-4 flex flex-col gap-4 items-start z-10">
      {error && (
        <div className="text-[#dc3545] font-medium text-sm mt-2 bg-[var(--background-color)] border-2 border-[var(--border-color)] p-2">
          {error}
        </div>
      )}
      <div className="flex items-center text-[1.2rem] bg-[var(--background-color)] border-2 border-[var(--border-color)] p-4">
        <StaticMathField className="">f</StaticMathField>
        <EditableMathField
          latex={iterations}
          onChange={handleIterationsChange}
          className="-translate-y-2 scale-[0.7] font-medium select-none"
          config={{
            restrictMismatchedBrackets: true,
            autoOperatorNames:
              "sin cos tan cot sec csc exp sinh cosh tanh coth sech csch Log Re Im conj Arg",
          }}
        />
        <StaticMathField className="">(</StaticMathField>
        <EditableMathField
          latex={initialValue}
          onChange={handleInitialValueChange}
          className=""
        />
        <StaticMathField className="">
          ) \qquad \mid \qquad f(z)=
        </StaticMathField>
        <EditableMathField
          latex={functionExpr}
          onChange={handleFunctionChange}
          className=""
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
