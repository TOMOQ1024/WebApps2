import styles from "./ControlButtons.module.scss";

export interface ControlButtonsProps {
  onResetControl: () => void;
  onReset: () => void;
  onInitializeToOrigin: () => void;
  onToggleControlsVisible?: () => void; // 追加
}

export default function ControlButtons({
  onResetControl,
  onReset,
  onInitializeToOrigin,
  onToggleControlsVisible,
}: ControlButtonsProps) {
  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={onResetControl}
        title="カメラをリセット"
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
      <button
        className={styles.button}
        onClick={onReset}
        title="設定をリセット"
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
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M21 21v-5h-5" />
        </svg>
      </button>
      <button
        className={styles.button}
        onClick={onInitializeToOrigin}
        title="点群を原点に初期化"
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
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </button>
      {onToggleControlsVisible && (
        <button
          className={styles.button}
          onClick={onToggleControlsVisible}
          title="コントロール類を表示/非表示"
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </button>
      )}
    </div>
  );
}
