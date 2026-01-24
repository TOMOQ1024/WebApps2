import { useCallback, useEffect, useState } from "react";
import { EditableMathField } from "@/components/MathFields";
import type { ExpressionMode } from "../core/Graph3DCore";

export interface ControlPanelProps {
  onExpressionChange: (expression: string) => void;
  currentExpression: string;
  error?: string | null;
  mode: ExpressionMode | "error";
}

export default function ControlPanel({
  onExpressionChange,
  currentExpression,
  error,
  mode,
}: ControlPanelProps) {
  const [expression, setExpression] = useState<string>(currentExpression);

  useEffect(() => {
    setExpression(currentExpression);
  }, [currentExpression]);

  const handleExpressionChange = useCallback(
    (mathField: any) => {
      const newValue = mathField.latex();
      setExpression(newValue);
      onExpressionChange(newValue);
    },
    [onExpressionChange],
  );

  // モードラベル: exp (陽関数) / imp (陰関数) / err (エラー)
  const getModeLabel = (): string => {
    if (error) return "err";
    return mode === "explicit" ? "exp" : "imp";
  };

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-2 items-start z-10">
      {error && (
        <div className="text-[#dc3545] font-medium text-sm bg-[var(--background-color)] border-2 border-[var(--border-color)] p-2">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 text-[1.1rem] bg-[var(--background-color)] border-2 border-[var(--border-color)] p-3">
        <span className="text-sm">{getModeLabel()}:</span>
        <EditableMathField
          latex={expression}
          onChange={handleExpressionChange}
          className="min-w-[200px]"
          config={{
            restrictMismatchedBrackets: true,
            autoOperatorNames:
              "sin cos tan cot sec csc arcsin arccos arctan exp sinh cosh tanh ln max min sqrt",
          }}
        />
      </div>
    </div>
  );
}
