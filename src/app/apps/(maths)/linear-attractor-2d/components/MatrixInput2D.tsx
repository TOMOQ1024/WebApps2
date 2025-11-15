import { useEffect, useState } from "react";
import * as THREE from "three";

export const MatrixInput2D = ({
  value,
  onChange,
}: {
  value: THREE.Matrix3;
  onChange: (m: THREE.Matrix3) => void;
}) => {
  const elements = value.elements;
  // Matrix3の要素は列優先なので、行列として表示するには変換が必要
  // elements[0,3,6] は第1列, [1,4,7]は第2列, [2,5,8]は第3列
  const [inputs, setInputs] = useState([
    elements[0].toString(), // a11
    elements[3].toString(), // a12
    elements[6].toString(), // a13
    elements[1].toString(), // a21
    elements[4].toString(), // a22
    elements[7].toString(), // a23
  ]);

  // 親コンポーネントからの値の変更を反映
  useEffect(() => {
    const elements = value.elements;
    setInputs([
      elements[0].toString(),
      elements[3].toString(),
      elements[6].toString(),
      elements[1].toString(),
      elements[4].toString(),
      elements[7].toString(),
    ]);
  }, [value]);

  const handleChange = (index: number, val: string) => {
    const newInputs = [...inputs];
    newInputs[index] = val;
    setInputs(newInputs);

    // 入力中にリアルタイムで反映
    const nums = newInputs.map((s) => parseFloat(s));
    if (nums.every((n) => !Number.isNaN(n))) {
      const newMatrix = new THREE.Matrix3();
      newMatrix.set(
        nums[0],
        nums[1],
        nums[2],
        nums[3],
        nums[4],
        nums[5],
        0,
        0,
        1,
      );
      onChange(newMatrix);
    }
  };

  const handleBlur = () => {
    const nums = inputs.map((s) => parseFloat(s));
    if (!nums.every((n) => !Number.isNaN(n))) {
      // 無効な場合は元に戻す
      const elements = value.elements;
      setInputs([
        elements[0].toString(),
        elements[3].toString(),
        elements[6].toString(),
        elements[1].toString(),
        elements[4].toString(),
        elements[7].toString(),
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const getInputStyle = (i: number) => ({
    width: "60px",
    padding: "2px 4px",
    borderTop: "2px solid var(--border-color)",
    borderBottom: i >= 3 ? "2px solid var(--border-color)" : "none",
    borderLeft: i % 3 === 0 ? "2px solid var(--border-color)" : "none",
    borderRight: "2px solid var(--border-color)",
    background: "var(--background-color)",
    color: "var(--text-color)",
    borderRadius: 0,
    textAlign: "center" as const,
    fontSize: "12px",
    outline: "none",
  });

  return (
    <div>
      <div className="inline-grid grid-cols-3" style={{ gap: 0 }}>
        {(["a11", "a12", "a13", "a21", "a22", "a23"] as const).map((key, i) => (
          <input
            key={key}
            type="text"
            value={inputs[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={getInputStyle(i)}
          />
        ))}
      </div>
    </div>
  );
};
