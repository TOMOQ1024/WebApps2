import { useState, useEffect } from "react";
import { EditableMathField } from "@/components/MathFields";
import * as THREE from "three";

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export const MatrixInput = ({
  label,
  value,
  onChange,
  onError,
}: {
  label: string;
  value: THREE.Matrix4;
  onChange: (m: THREE.Matrix4) => void;
  onError?: (error: string) => void;
}) => {
  const [elements, setElements] = useState<string[]>(
    value.toArray().map(String)
  );
  const [errors, setErrors] = useState<string[]>(Array(16).fill(""));
  const [isEditing, setIsEditing] = useState<boolean[]>(Array(16).fill(false));

  // 転置表示用: [row][col] → [col][row]
  const getIndex = (row: number, col: number) => col * 4 + row;

  // props.valueが変わった時、編集中でないセルだけ上書き
  useEffect(() => {
    const valueArr = value.toArray().map(String);
    setElements((prev) => prev.map((v, i) => (isEditing[i] ? v : valueArr[i])));
  }, [value]);

  const handleChange = (idx: number, str: string) => {
    const arr = [...elements];
    arr[idx] = str;
    setElements(arr);
    // バリデーション
    const errArr = [...errors];
    const num = parseFloat(str);
    if (str.trim() === "" || isNaN(num)) {
      errArr[idx] = "実数を入力";
    } else {
      errArr[idx] = "";
    }
    setErrors(errArr);
    // エラーが全て解消されたらonError("")
    if (onError) {
      if (errArr.some((e) => e !== "")) {
        onError("行列に無効な値があります");
      } else {
        onError("");
      }
    }
    // 16個すべて有効な場合は即時onChange
    if (errArr.every((e) => e === "")) {
      const nums = arr.map(Number);
      onChange(new THREE.Matrix4().fromArray(nums));
    }
  };

  const handleFocus = (idx: number) => {
    setIsEditing((prev) => {
      const arr = [...prev];
      arr[idx] = true;
      return arr;
    });
  };
  const handleBlur = (idx: number) => {
    setIsEditing((prev) => {
      const arr = [...prev];
      arr[idx] = false;
      return arr;
    });
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <label>{label}</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 4,
        }}
      >
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const idx = getIndex(row, col);
            return (
              <div key={idx}>
                <EditableMathField
                  latex={elements[idx]}
                  onChange={(mf: any) =>
                    handleChange(
                      idx,
                      mf.latex().replace(/\\,/g, "").replace(/\\ /g, "")
                    )
                  }
                  onFocus={() => handleFocus(idx)}
                  onBlur={() => handleBlur(idx)}
                  style={{
                    minWidth: 40,
                    border: errors[idx] ? "1px solid red" : undefined,
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
