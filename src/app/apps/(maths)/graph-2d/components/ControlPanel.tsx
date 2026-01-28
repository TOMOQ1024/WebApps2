import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EditableMathField } from "@/components/MathFields";
import {
  isFunctionDefinition,
  isInequality,
} from "@/src/Parser/graph2d/expressionParser";

export interface ControlPanelProps {
  onExpressionsChange: (expressions: string[]) => void;
  currentExpressions: string[];
  error?: string | null;
}

export default function ControlPanel({
  onExpressionsChange,
  currentExpressions,
  error,
}: ControlPanelProps) {
  const [expressions, setExpressions] = useState<string[]>(currentExpressions);

  useEffect(() => {
    setExpressions(currentExpressions);
  }, [currentExpressions]);

  const handleExpressionChange = useCallback(
    (index: number, mathField: any) => {
      const newValue = mathField.latex();
      const updated = [...expressions];
      updated[index] = newValue;
      setExpressions(updated);
      onExpressionsChange(updated);
    },
    [expressions, onExpressionsChange],
  );

  const addExpression = useCallback(() => {
    const updated = ["", ...expressions];
    setExpressions(updated);
    onExpressionsChange(updated);
  }, [expressions, onExpressionsChange]);

  const removeExpression = useCallback(
    (index: number) => {
      if (expressions.length <= 1) return;
      const updated = expressions.filter((_, i) => i !== index);
      setExpressions(updated);
      onExpressionsChange(updated);
    },
    [expressions, onExpressionsChange],
  );

  // 式のタイプを判定してラベルを返す
  const getExpressionLabel = (expr: string): string => {
    if (isFunctionDefinition(expr)) {
      return "def";
    } else if (isInequality(expr)) {
      return "inq";
    } else {
      return "err";
    }
  };

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-2 items-start z-10 max-h-[60vh] overflow-y-auto">
      <button
        type="button"
        onClick={addExpression}
        className="text-sm bg-[var(--background-color)] border-2 border-[var(--border-color)] px-3 py-1"
        title="式を追加"
      >
        <Plus size={16} />
      </button>

      {error && (
        <div className="text-[#dc3545] font-medium text-sm bg-[var(--background-color)] border-2 border-[var(--border-color)] p-2">
          {error}
        </div>
      )}

      {expressions.map((expr, index) => (
        <div
          key={index}
          className="flex items-center gap-2 text-[1.1rem] bg-[var(--background-color)] border-2 border-[var(--border-color)] p-3"
        >
          <span className="text-sm">{getExpressionLabel(expr)}:</span>
          <EditableMathField
            latex={expr}
            onChange={(mf: any) => handleExpressionChange(index, mf)}
            className="min-w-[200px]"
            config={{
              restrictMismatchedBrackets: true,
              autoCommands: "lfloor rfloor lceil rceil",
              autoOperatorNames:
                "sin cos tan cot sec csc arcsin arccos arctan arccot arcsec arccsc exp sinh cosh tanh coth sech csch arsinh arcosh artanh arcoth arsech arcsch ln max min floor ceil round fract",
            }}
          />
          {expressions.length > 1 && (
            <button
              type="button"
              onClick={() => removeExpression(index)}
              className="text-red-500 hover:text-red-700 px-2"
              title="式を削除"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
