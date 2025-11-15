import { useState } from "react";
import * as THREE from "three";

export const MatrixInput2D = ({
  label,
  value,
  onChange,
}: {
  label: string;
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

  const handleChange = (index: number, val: string) => {
    const newInputs = [...inputs];
    newInputs[index] = val;
    setInputs(newInputs);
  };

  const handleBlur = () => {
    const nums = inputs.map((s) => parseFloat(s));
    if (nums.every((n) => !isNaN(n))) {
      // 行列形式から列優先形式に変換
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
    } else {
      // 無効な場合は元に戻す
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
      handleBlur();
    }
  };

  const inputStyle = {
    width: "60px",
    padding: "2px 4px",
    border: "2px solid var(--border-color)",
    background: "var(--background-color)",
    color: "var(--text-color)",
    borderRadius: 0,
    textAlign: "center" as const,
    fontSize: "12px",
  };

  return (
    <div className="mb-2">
      <div className="text-sm block mb-1">{label}:</div>
      <div className="inline-grid grid-cols-3 gap-1">
        {inputs.map((val, i) => (
          <input
            key={i}
            type="text"
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={inputStyle}
          />
        ))}
      </div>
    </div>
  );
};
