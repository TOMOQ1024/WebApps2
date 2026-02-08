import { GalleryHorizontalEnd, Home, Link, Palette, Send, Upload } from "lucide-react";
import NextLink from "next/link";

interface ControlButtonsProps {
  onResetGraph: () => void;
  onRenderModeChange: (mode: number) => void;
  currentRenderMode: number;
  onShareLink: () => void;
  onExportGalleryData: () => void;
  onPost?: () => void;
  isLoggedIn?: boolean;
  exprType: number; // 0: 不等式, 1: 数値式
}

// グレースケールモードのラベル
const GRAYSCALE_MODE_LABELS = ["clamp", "tanh"];

export default function ControlButtons({
  onResetGraph,
  onRenderModeChange,
  currentRenderMode,
  onShareLink,
  onExportGalleryData,
  onPost,
  isLoggedIn = false,
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
        type="button"
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
        type="button"
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={onResetGraph}
        title="グラフをリセット"
      >
        <Home size={16} />
      </button>
      <button
        type="button"
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={onShareLink}
        title="リンクをコピー"
      >
        <Link size={16} />
      </button>
      <button
        type="button"
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={onExportGalleryData}
        title="JSON 形式でエクスポート"
      >
        <Upload size={16} />
      </button>
      <NextLink
        href="/galleries/graph-2d"
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        title="ギャラリーを見る"
      >
        <GalleryHorizontalEnd size={16} />
      </NextLink>
      {isLoggedIn && onPost && (
        <button
          type="button"
          className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
          onClick={onPost}
          title="ギャラリーに投稿"
        >
          <Send size={16} />
        </button>
      )}
    </div>
  );
}
