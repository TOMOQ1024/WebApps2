import { useState, useEffect } from "react";
import { EditableMathField, StaticMathField } from "@/components/MathFields";

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
    <div className="absolute bottom-4 left-4 flex flex-col gap-4 items-start z-10">
      {error && (
        <div className="text-[#dc3545] font-medium text-sm mt-2 bg-[var(--background-color)] border-2 border-[var(--border-color)] p-2">
          {error}
        </div>
      )}
      <div className="flex items-center text-[1.2rem] bg-[var(--background-color)] border-2 border-[var(--border-color)] p-4">
        <StaticMathField className="">f\left(x,y\right)=</StaticMathField>
        <EditableMathField
          latex={functionExpr}
          onChange={handleFunctionChange}
          className=""
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
