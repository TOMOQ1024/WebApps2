import { useEffect, useState } from "react";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";
import styles from "./ControlPanel.module.scss";

export interface ControlPanelProps {
  diagram: CoxeterDynkinDiagram;
  onDiagramChange: (diagram: CoxeterDynkinDiagram) => void;
  error: string | null;
  buildTime: number;
  onBuild: () => Promise<void>;
}

export default function ControlPanel({
  diagram,
  onDiagramChange,
  error,
  buildTime,
  onBuild,
}: ControlPanelProps) {
  const [localError, setLocalError] = useState<string>("");

  useEffect(() => {
    if (error) {
      setLocalError(error);
    } else {
      setLocalError("");
    }
  }, [error]);

  const handleInputChange = async (value: string, labelKey: string) => {
    const prev = diagram.labels[labelKey];
    const rev = labelKey.split("").reverse().join("");

    const input = document.querySelector(`input.${rev}`) as HTMLInputElement;
    if (input) {
      input.value = value;
    }

    if (/^\d+$/.test(value)) {
      // 整数の場合
      const newLabels = { ...diagram.labels };
      const newNodeMarks = { ...diagram.nodeMarks };
      newLabels[labelKey] = [+value, 1];
      newLabels[rev] = [+value, 1];
      const newDiagram = new CoxeterDynkinDiagram(newLabels, newNodeMarks);
      onDiagramChange(newDiagram);
    } else if (/^(\d+\/\d+)$/.test(value)) {
      // 分数の場合
      const newLabels = { ...diagram.labels };
      const newNodeMarks = { ...diagram.nodeMarks };
      newLabels[labelKey] = value.split("/").map(Number) as [number, number];
      newLabels[rev] = value.split("/").map(Number) as [number, number];
      const newDiagram = new CoxeterDynkinDiagram(newLabels, newNodeMarks);
      onDiagramChange(newDiagram);
    } else {
      setLocalError(`${labelKey}の入力が適切ではありません\n例: 1, 2, 5/2`);
    }
  };

  const renderInput = (labelKey: string) => {
    if (labelKey[0] === labelKey[1]) {
      return (
        <input
          className={`${styles.input} ${labelKey}`}
          type="string"
          defaultValue="1"
          readOnly
        />
      );
    }
    const value = diagram.labels[labelKey];
    const displayValue = `${value[0]}${value[1] > 1 ? `/${value[1]}` : ""}`;

    return (
      <input
        className={`${styles.input} ${
          !/^(\d+|\d+\/\d+)$/.test(displayValue) ? styles.invalid : ""
        } ${labelKey}`}
        type="string"
        defaultValue={displayValue}
        onChange={(e) => handleInputChange(e.target.value, labelKey)}
      />
    );
  };

  const renderMarkupButton = (nodeKey: string) => {
    return (
      <input
        className={styles.input}
        type="button"
        value={diagram.nodeMarks[nodeKey]}
        onClick={async (e) => {
          const newLabels = { ...diagram.labels };
          const newNodeMarks = { ...diagram.nodeMarks };
          newNodeMarks[nodeKey] = (
            {
              x: "o",
              o: "x",
            } as { [key: string]: string }
          )[newNodeMarks[nodeKey]];
          (e.target as HTMLInputElement).value = newNodeMarks[nodeKey];
          const newDiagram = new CoxeterDynkinDiagram(newLabels, newNodeMarks);
          onDiagramChange(newDiagram);
        }}
      />
    );
  };

  return (
    <div className={styles.controlPanel}>
      <div className={`${styles.error} ${localError ? styles.active : ""}`}>
        {localError
          ? localError.split("\n").map((line, i) => <p key={i}>{line}</p>)
          : buildTime > 0
          ? `多胞体の生成に成功しました(${buildTime.toFixed(2)}ms)`
          : "多胞体の生成中..."}
      </div>
      <div className={styles.wrapper}>
        <div className={styles.nodeMarks}>
          <table>
            <tbody>
              <tr>
                <td className={styles.nodeMark}>{renderMarkupButton("a")}</td>
                <td className={styles.nodeMark}>{renderMarkupButton("b")}</td>
                <td className={styles.nodeMark}>{renderMarkupButton("c")}</td>
                <td className={styles.nodeMark}>{renderMarkupButton("d")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.matrixContainer}>
          <span className={styles.bracket}>(</span>
          <table className={styles.matrix}>
            <tbody>
              <tr>
                <td className={styles.upperTriangular}>{renderInput("aa")}</td>
                <td className={styles.upperTriangular}>{renderInput("ab")}</td>
                <td className={styles.upperTriangular}>{renderInput("ac")}</td>
                <td className={styles.upperTriangular}>{renderInput("ad")}</td>
              </tr>
              <tr>
                <td className={styles.lowerTriangular}>{renderInput("ba")}</td>
                <td className={styles.upperTriangular}>{renderInput("bb")}</td>
                <td className={styles.upperTriangular}>{renderInput("bc")}</td>
                <td className={styles.upperTriangular}>{renderInput("bd")}</td>
              </tr>
              <tr>
                <td className={styles.lowerTriangular}>{renderInput("ca")}</td>
                <td className={styles.lowerTriangular}>{renderInput("cb")}</td>
                <td className={styles.upperTriangular}>{renderInput("cc")}</td>
                <td className={styles.upperTriangular}>{renderInput("cd")}</td>
              </tr>
              <tr>
                <td className={styles.lowerTriangular}>{renderInput("da")}</td>
                <td className={styles.lowerTriangular}>{renderInput("db")}</td>
                <td className={styles.lowerTriangular}>{renderInput("dc")}</td>
                <td className={styles.upperTriangular}>{renderInput("dd")}</td>
              </tr>
            </tbody>
          </table>
          <span className={styles.bracket}>)</span>
        </div>
      </div>
    </div>
  );
}
