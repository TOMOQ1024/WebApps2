import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditableMathField } from "@/components/MathFields";
import {
  isFunctionDefinition,
  isConstantDefinition,
  isNumericExpression,
  parseChainedInequality,
} from "@/shared/parser/graph2d/expressionParser";

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
  const scrollContainerRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    setExpressions(currentExpressions);
  }, [currentExpressions]);

  // カーソル位置にスクロール
  const scrollToCursor = useCallback((container: HTMLDivElement | null) => {
    if (!container) return;
    const cursor = container.querySelector(".mq-cursor");
    if (cursor) {
      const containerRect = container.getBoundingClientRect();
      const cursorRect = cursor.getBoundingClientRect();
      const cursorRelativeLeft =
        cursorRect.left - containerRect.left + container.scrollLeft;
      const cursorRelativeRight = cursorRelativeLeft + cursorRect.width;

      // カーソルが見えるようにスクロール（余白を持たせる）
      const padding = 20;
      if (
        cursorRelativeRight >
        container.scrollLeft + container.clientWidth - padding
      ) {
        container.scrollLeft =
          cursorRelativeRight - container.clientWidth + padding;
      } else if (cursorRelativeLeft < container.scrollLeft + padding) {
        container.scrollLeft = cursorRelativeLeft - padding;
      }
    }
  }, []);

  const handleExpressionChange = useCallback(
    (index: number, mathField: any) => {
      const newValue = mathField.latex();
      const updated = [...expressions];
      updated[index] = newValue;
      setExpressions(updated);
      onExpressionsChange(updated);

      // 次のフレームでスクロール（DOM更新後）
      requestAnimationFrame(() => {
        scrollToCursor(scrollContainerRefs.current.get(index) ?? null);
      });
    },
    [expressions, onExpressionsChange, scrollToCursor],
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
    if (!expr.trim()) {
      return "---";
    }
    if (isFunctionDefinition(expr)) {
      return "def";
    }
    if (isConstantDefinition(expr)) {
      return "con";
    }
    if (parseChainedInequality(expr) !== null) {
      return "inq";
    }
    if (isNumericExpression(expr)) {
      return "num";
    }
    return "err";
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
        <div key={index} className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-[1.1rem] bg-[var(--background-color)] border-2 border-[var(--border-color)] p-3">
            <span className="text-sm flex-shrink-0">
              {getExpressionLabel(expr)}:
            </span>
            <div
              ref={(el) => {
                if (el) scrollContainerRefs.current.set(index, el);
              }}
              className="overflow-x-auto max-w-[60vw]"
            >
              <EditableMathField
                latex={expr}
                onChange={(mf: any) => handleExpressionChange(index, mf)}
                className="min-w-[200px]"
                config={{
                  restrictMismatchedBrackets: true,
                  autoCommands: "lfloor rfloor lceil rceil",
                  autoOperatorNames:
                    "sin cos tan cot sec csc arcsin arccos arctan arccot arcsec arccsc exp sinh cosh tanh coth sech csch arsinh arcosh artanh arcoth arsech arcsch ln max min floor ceil round fract sign sgn mod",
                }}
              />
            </div>
          </div>
          {expressions.length > 1 && (
            <button
              type="button"
              onClick={() => removeExpression(index)}
              className="w-10 h-10 flex-shrink-0 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
              title="式を削除"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
