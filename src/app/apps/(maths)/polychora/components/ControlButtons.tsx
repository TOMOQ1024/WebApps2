import styles from "./ControlButtons.module.scss";

export interface ControlButtonsProps {
  onDownloadGLB: () => void;
  onReset: () => void;
}

export default function ControlButtons({
  onDownloadGLB,
  onReset,
}: ControlButtonsProps) {
  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={onDownloadGLB}
        title="GLBファイルとしてダウンロード"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
      <button
        className={styles.button}
        onClick={onReset}
        title="デフォルト設定にリセット"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>
    </div>
  );
}
