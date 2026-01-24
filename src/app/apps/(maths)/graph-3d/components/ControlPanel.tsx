import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditableMathField } from "@/components/MathFields";
import { parseFunctionDef } from "@/src/Parser/graph2d/expressionParser";
import type { ExpressionMode } from "../core/Graph3DCore";

interface ExpressionItem {
  id: number;
  value: string;
}

export interface ControlPanelProps {
  onExpressionsChange: (expressions: string[]) => void;
  currentExpressions: string[];
  error?: string | null;
  mode: ExpressionMode | "error";
}

/**
 * 式のタイプを判定
 * - def: 関数定義
 * - exp: 陽関数 (z=f(x,y))
 * - imp: 陰関数 (f(x,y,z)=0 または x^2+y^2=1 など)
 * - err: エラー
 */
function getExpressionType(expr: string): "def" | "exp" | "imp" | "err" {
  const trimmed = expr.trim();
  if (!trimmed) return "err";

  // 関数定義
  if (parseFunctionDef(trimmed)) {
    return "def";
  }

  // z= で始まる
  const explicitMatch = trimmed.match(/^z\s*(=|<|>|\\le|\\ge|\\leq|\\geq)/);
  if (explicitMatch) {
    // 右辺に z を含むか
    const afterOp = trimmed.slice(explicitMatch[0].length);
    if (/(?<![a-zA-Z])z(?![a-zA-Z])/.test(afterOp)) {
      return "imp"; // 陰関数形式 z = f(x,y,z)
    }
    return "exp";
  }

  // 等号・不等号を含む式 → 陰関数（z を含まなくても x^2+y^2=1 のような式は陰関数）
  const hasRelation =
    /(?<!\\left|\\right)(=|<|>|\\le(?![a-zA-Z])|\\ge(?![a-zA-Z])|\\leq|\\geq)/.test(
      trimmed,
    );
  if (hasRelation) {
    return "imp";
  }

  return "err";
}

export default function ControlPanel({
  onExpressionsChange,
  currentExpressions,
  error,
}: ControlPanelProps) {
  const nextIdRef = useRef(0);
  const isInternalUpdateRef = useRef(false);
  const updateVersionRef = useRef(0);
  const [items, setItems] = useState<ExpressionItem[]>(() =>
    currentExpressions.map((value) => ({
      id: nextIdRef.current++,
      value,
    })),
  );

  // 親からの currentExpressions が変更された場合のみ同期（URL パラメータ対応）
  // 内部からの更新の場合はスキップ
  // biome-ignore lint/correctness/useExhaustiveDependencies: items は意図的に依存配列から除外（無限ループ防止）
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    const itemsStr = JSON.stringify(items.map((item) => item.value));
    const currentStr = JSON.stringify(currentExpressions);

    if (itemsStr !== currentStr) {
      setItems(
        currentExpressions.map((value) => ({
          id: nextIdRef.current++,
          value,
        })),
      );
    }
  }, [currentExpressions]); // items を依存配列から除外

  const notifyParent = useCallback(
    (newItems: ExpressionItem[], version: number) => {
      // 古いバージョンの更新は無視
      if (version !== updateVersionRef.current) {
        return;
      }
      isInternalUpdateRef.current = true;
      onExpressionsChange(newItems.map((item) => item.value));
    },
    [onExpressionsChange],
  );

  const handleExpressionChange = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: MathQuill types not available
    (id: number, mathField: any) => {
      const newValue = mathField.latex();
      // 新しいバージョン番号を発行
      const version = ++updateVersionRef.current;
      setItems((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, value: newValue } : item,
        );
        // 次のティックで親に通知（バージョンを渡す）
        setTimeout(() => notifyParent(updated, version), 0);
        return updated;
      });
    },
    [notifyParent],
  );

  const addExpression = useCallback(() => {
    const version = ++updateVersionRef.current;
    setItems((prev) => {
      const newItem: ExpressionItem = { id: nextIdRef.current++, value: "" };
      const updated = [newItem, ...prev];
      setTimeout(() => notifyParent(updated, version), 0);
      return updated;
    });
  }, [notifyParent]);

  const removeExpression = useCallback(
    (id: number) => {
      const version = ++updateVersionRef.current;
      setItems((prev) => {
        if (prev.length <= 1) return prev;
        const updated = prev.filter((item) => item.id !== id);
        setTimeout(() => notifyParent(updated, version), 0);
        return updated;
      });
    },
    [notifyParent],
  );

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

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 text-[1.1rem] bg-[var(--background-color)] border-2 border-[var(--border-color)] p-3"
        >
          <span className="text-sm w-8">
            {getExpressionType(item.value)}:
          </span>
          <EditableMathField
            latex={item.value}
            // biome-ignore lint/suspicious/noExplicitAny: MathQuill types not available
            onChange={(mf: any) => handleExpressionChange(item.id, mf)}
            className="min-w-[200px]"
            config={{
              restrictMismatchedBrackets: true,
              autoOperatorNames:
                "sin cos tan cot sec csc arcsin arccos arctan arccot arcsec arccsc exp sinh cosh tanh coth sech csch arsinh arcosh artanh arcoth arsech arcsch ln max min sqrt",
            }}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeExpression(item.id)}
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
