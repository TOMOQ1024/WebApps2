import { useEffect, useState } from "react";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";

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

  // 共通のスタイルクラスを定義
  const inputStyles =
    "!bg-transparent !border-none !outline-none text-center w-[30px] h-[30px] text-inherit font-bold hover:!bg-[var(--background-color)] focus:!bg-[var(--background-color)]";
  const tdStyles =
    "border-2 border-[var(--border-color)] w-[30px] text-center font-bold";
  const diagonalTdStyles = `${tdStyles} text-[var(--text-color-secondary)]`;
  const regularTdStyles = `${tdStyles} text-[var(--text-color)]`;
  const nodeMarkTdStyles = `${tdStyles} cursor-pointer`;

  useEffect(() => {
    if (error) {
      setLocalError(error);
    } else {
      setLocalError("");
    }
  }, [error]);

  const handleInputChange = async (value: string, labelKey: string) => {
    const rev = labelKey.split("").reverse().join("");

    // 空文字列の場合は何もしない
    if (value === "") {
      return;
    }

    // 入力値の検証
    const isValidInteger = /^\d+$/.test(value);
    const isValidFraction = /^(\d+\/\d+)$/.test(value);

    if (isValidInteger) {
      // 整数の場合
      const newLabels = { ...diagram.labels };
      const newNodeMarks = { ...diagram.nodeMarks };
      newLabels[labelKey] = [+value, 1];
      newLabels[rev] = [+value, 1];
      const newDiagram = new CoxeterDynkinDiagram(newLabels, newNodeMarks);
      setLocalError(""); // エラーをクリア
      onDiagramChange(newDiagram);
    } else if (isValidFraction) {
      // 分数の場合
      const [numerator, denominator] = value.split("/").map(Number);
      if (numerator >= 1 && denominator >= 1) {
        const newLabels = { ...diagram.labels };
        const newNodeMarks = { ...diagram.nodeMarks };
        newLabels[labelKey] = [numerator, denominator];
        newLabels[rev] = [numerator, denominator];
        const newDiagram = new CoxeterDynkinDiagram(newLabels, newNodeMarks);
        setLocalError(""); // エラーをクリア
        onDiagramChange(newDiagram);
      } else {
        setLocalError(
          `${labelKey}の分数は分子・分母とも1以上でなければなりません`
        );
      }
    } else {
      // 不正な入力の場合
      setLocalError(`${labelKey}の入力が適切ではありません\n例: 1, 2, 5/2`);
    }
  };

  const renderInput = (labelKey: string) => {
    if (labelKey[0] === labelKey[1]) {
      return (
        <input
          className={inputStyles}
          type="string"
          defaultValue="1"
          readOnly
        />
      );
    }
    const value = diagram.labels[labelKey];
    const displayValue = `${value[0]}${value[1] > 1 ? `/${value[1]}` : ""}`;

    // より厳密なバリデーション
    const isValidValue =
      /^\d+$/.test(displayValue) ||
      (/^(\d+\/\d+)$/.test(displayValue) &&
        (() => {
          const [num, den] = displayValue.split("/").map(Number);
          return num >= 1 && den >= 1;
        })());

    return (
      <input
        className={`${inputStyles} ${
          !isValidValue ? "!bg-[var(--error-color)]" : ""
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
        className={inputStyles}
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
    <div className="absolute bottom-4 left-4 flex flex-col gap-4 items-start z-10">
      <div
        className={`mt-2.5 h-10 text-xs p-1.5 bg-[var(--background-color)] border-2 border-[var(--border-color)] ${
          localError
            ? "text-[var(--error-color)]"
            : buildTime > 0
            ? "text-[var(--success-color)]"
            : "text-[var(--text-color-secondary)]"
        }`}
      >
        {localError
          ? localError.split("\n").map((line, i) => (
              <p key={i} className="m-0 leading-tight">
                {line}
              </p>
            ))
          : buildTime > 0
          ? `多胞体の生成に成功しました(${buildTime.toFixed(2)}ms)`
          : "多胞体の生成中..."}
      </div>
      <div className="flex flex-col items-center text-xl bg-[var(--background-color)] border-2 border-[var(--border-color)] p-4">
        <div className="flex items-center justify-center mb-2.5">
          <table>
            <tbody>
              <tr>
                <td className={nodeMarkTdStyles}>{renderMarkupButton("a")}</td>
                <td className={nodeMarkTdStyles}>{renderMarkupButton("b")}</td>
                <td className={nodeMarkTdStyles}>{renderMarkupButton("c")}</td>
                <td className={nodeMarkTdStyles}>{renderMarkupButton("d")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-3xl -translate-y-2.5 scale-y-[4.5] text-[var(--text-color)]">
            (
          </span>
          <table className="border-collapse w-auto">
            <tbody>
              <tr>
                <td className={diagonalTdStyles}>{renderInput("aa")}</td>
                <td className={regularTdStyles}>{renderInput("ab")}</td>
                <td className={regularTdStyles}>{renderInput("ac")}</td>
                <td className={regularTdStyles}>{renderInput("ad")}</td>
              </tr>
              <tr>
                <td className={regularTdStyles}>{renderInput("ba")}</td>
                <td className={diagonalTdStyles}>{renderInput("bb")}</td>
                <td className={regularTdStyles}>{renderInput("bc")}</td>
                <td className={regularTdStyles}>{renderInput("bd")}</td>
              </tr>
              <tr>
                <td className={regularTdStyles}>{renderInput("ca")}</td>
                <td className={regularTdStyles}>{renderInput("cb")}</td>
                <td className={diagonalTdStyles}>{renderInput("cc")}</td>
                <td className={regularTdStyles}>{renderInput("cd")}</td>
              </tr>
              <tr>
                <td className={regularTdStyles}>{renderInput("da")}</td>
                <td className={regularTdStyles}>{renderInput("db")}</td>
                <td className={regularTdStyles}>{renderInput("dc")}</td>
                <td className={diagonalTdStyles}>{renderInput("dd")}</td>
              </tr>
            </tbody>
          </table>
          <span className="text-3xl -translate-y-2.5 scale-y-[4.5] text-[var(--text-color)]">
            )
          </span>
        </div>
      </div>
    </div>
  );
}
