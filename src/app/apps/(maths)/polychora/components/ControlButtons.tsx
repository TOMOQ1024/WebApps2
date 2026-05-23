import { Download, Home, RectangleGoggles } from "lucide-react";

export interface ControlButtonsProps {
  onDownloadGLB: () => void;
  onReset: () => void;
  onToggleVR: () => void;
}

export default function ControlButtons({
  onDownloadGLB,
  onReset,
  onToggleVR,
}: ControlButtonsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={onDownloadGLB}
        title="GLBファイルとしてダウンロード"
      >
        <Download size={16} />
      </button>
      <button
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={onReset}
        title="描画設定をリセット"
      >
        <Home size={16} />
      </button>
      <button
        className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] cursor-pointer flex items-center justify-center hover:scale-95 active:invert"
        onClick={onToggleVR}
        title="VRモードに切り替え"
      >
        <RectangleGoggles size={16} />
      </button>
    </div>
  );
}
