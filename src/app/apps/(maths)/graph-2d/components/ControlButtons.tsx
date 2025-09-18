import { Palette, Home, Link } from "lucide-react";

interface ControlButtonsProps {
  onResetGraph: () => void;
  onRenderModeChange: (mode: number) => void;
  currentRenderMode: number;
  onShareLink: () => void;
}

export default function ControlButtons({
  onResetGraph,
  onRenderModeChange,
  currentRenderMode,
  onShareLink,
}: ControlButtonsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={() => onRenderModeChange((currentRenderMode + 1) % 2)}
        title="描画モード切り替え"
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
