import { useState } from "react";
import { EditableMathField } from "@/components/MathFields";

export const RealNumberInput = ({
  label,
  value,
  onChange,
  onError,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  onError?: (error: string) => void;
}) => {
  const [latex, setLatex] = useState(value.toString());
  const [error, setError] = useState("");

  const handleChange = (mf: any) => {
    const str = mf.latex().replace(/\\,/g, "").replace(/\\ /g, "");
    setLatex(str);
    const num = parseFloat(str);
    if (isNaN(num) || num < 0 || num > 1) {
      const errorMsg = "0〜1の実数を入力してください";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }
    setError("");
    onError?.("");
    onChange(num);
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <label>{label}: </label>
      <EditableMathField
        latex={latex}
        onChange={handleChange}
        style={{ minWidth: 60, border: error ? "1px solid red" : undefined }}
      />
    </div>
  );
};
