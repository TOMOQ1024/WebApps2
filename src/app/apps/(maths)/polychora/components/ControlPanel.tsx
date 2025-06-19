import React from "react";
import styles from "./ControlPanel.module.scss";

// 入力値型: 4x4の文字列行列
export type MatrixValue = string[][]; // 4x4
export type ToggleValue = ("o" | "x")[]; // 4つ

interface ControlPanelProps {
  matrix: MatrixValue;
  toggles: ToggleValue;
  onMatrixChange: (matrix: MatrixValue) => void;
  onTogglesChange: (toggles: ToggleValue) => void;
  error?: string | null;
}

// 入力バリデーション: 1以上の整数 or a/b (a,b>=1)
function isValidCellValue(val: string): boolean {
  if (/^\d+$/.test(val)) {
    return parseInt(val, 10) >= 1;
  }
  if (/^(\d+)\/(\d+)$/.test(val)) {
    const match = val.match(/^(\d+)\/(\d+)$/);
    if (!match) return false;
    const num = parseInt(match[1], 10);
    const denom = parseInt(match[2], 10);
    return num >= 1 && denom >= 1;
  }
  return false;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  matrix,
  toggles,
  onMatrixChange,
  onTogglesChange,
  error,
}) => {
  // セル変更
  const handleCellChange = (i: number, j: number, value: string) => {
    const newMatrix = matrix.map((row, r) =>
      row.map((cell, c) => (r === i && c === j ? value : cell))
    );
    onMatrixChange(newMatrix);
  };

  // トグル変更
  const handleToggle = (idx: number) => {
    const newToggles = toggles.map((v, i) =>
      i === idx ? (v === "o" ? "x" : "o") : v
    );
    onTogglesChange(newToggles);
  };

  return (
    <div className={styles.controlPanel}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.mathContainer}>
        <div className={styles.togglesRow}>
          {toggles.map((v, i) => (
            <button
              key={i}
              className={styles.toggle}
              onClick={() => handleToggle(i)}
              type="button"
            >
              {v}
            </button>
          ))}
        </div>
        <table className={styles.matrixTable}>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(i, j, e.target.value)}
                      className={`${styles.cell} ${
                        cell === "" || isValidCellValue(cell)
                          ? ""
                          : styles.cellError
                      }`}
                      inputMode="text"
                      pattern="^\\d+$|^\\d+/\\d+$"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControlPanel;
