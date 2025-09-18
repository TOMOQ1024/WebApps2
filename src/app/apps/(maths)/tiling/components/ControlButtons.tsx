import { Palette, Home, Link } from "lucide-react";

interface ControlButtonsProps {
  onResetGraph: () => void;
  onShareLink: () => void;
}

export default function ControlButtons({
  onResetGraph,
  onShareLink,
}: ControlButtonsProps) {
  const buttonIconClassName =
    "w-10 h-10 border-default cursor-pointer flex items-center justify-center hover:scale-105 active:invert";
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button
        className={buttonIconClassName}
        onClick={() => {}}
        title="描画モード切り替え"
      >
        <Palette size={16} />
      </button>
      <button
        className={buttonIconClassName}
        onClick={onResetGraph}
        title="グラフをリセット"
      >
        <Home size={16} />
      </button>
      <button
        className={buttonIconClassName}
        onClick={onShareLink}
        title="リンクをコピー"
      >
        <Link size={16} />
      </button>
    </div>
  );
}
