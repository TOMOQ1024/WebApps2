import { Grid3X3, Home, Link } from "lucide-react";

interface ControlButtonsProps {
  onResetCamera: () => void;
  onWireframeToggle: () => void;
  isWireframe: boolean;
  onShareLink: () => void;
}

export default function ControlButtons({
  onResetCamera,
  onWireframeToggle,
  isWireframe,
  onShareLink,
}: ControlButtonsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button
        type="button"
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={onWireframeToggle}
        title="ワイヤーフレーム切り替え"
      >
        <Grid3X3 size={16} />
      </button>
      <button
        type="button"
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={onResetCamera}
        title="カメラをリセット"
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
    </div>
  );
}
