import { Palette, Home, Link } from "lucide-react";

interface ControlButtonsProps {
  onResetGraph: () => void;
  onRenderModeChange: (mode: number) => void;
  currentRenderMode: number;
  onShareLink: () => void;
  exprType: number; // 0: 不等式, 1: 数値式
}

// グレースケールモードのラベル
const GRAYSCALE_MODE_LABELS = ["clamp", "tanh"];

export default function ControlButtons({
  onResetGraph,
  onRenderModeChange,
  currentRenderMode,
  onShareLink,
  exprType,
}: ControlButtonsProps) {
  // 数値式の場合のみグレースケールモード切り替えを有効化
  const isNumericExpr = exprType === 1;

  const handleRenderModeClick = () => {
    if (isNumericExpr) {
      // 数値式: 1 (clamp) と 2 (tanh) を切り替え
      const nextMode = currentRenderMode === 1 ? 2 : 1;
      onRenderModeChange(nextMode);
    }
  };

  const getModeTitle = () => {
    if (!isNumericExpr) {
      return "グレースケールモード（数値式のみ）";
    }
    const modeIndex = currentRenderMode === 2 ? 1 : 0;
    return `グレースケールモード: ${GRAYSCALE_MODE_LABELS[modeIndex]}`;
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button
        className={`w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] flex items-center justify-center hover:scale-95 active:invert ${
          isNumericExpr ? "cursor-pointer" : "cursor-not-allowed opacity-50"
        }`}
        onClick={handleRenderModeClick}
        title={getModeTitle()}
        disabled={!isNumericExpr}
      >
        <Palette size={16} />
      </button>
      <button
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={onResetGraph}
        title="グラフをリセット"
      >
        <Home size={16} />
      </button>
      <button
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={onShareLink}
        title="リンクをコピー"
      >
        <Link size={16} />
      </button>
    </div>
  );
}
