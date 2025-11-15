import { useEffect, useState } from "react";

export const RealNumberInput = ({
  className = "",
  value,
  onChange,
}: {
  className?: string;
  value: number;
  onChange: (v: number) => void;
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  // 親コンポーネントからの値の変更を反映
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (val: string) => {
    setInputValue(val);
    const num = parseFloat(val);
    if (!Number.isNaN(num)) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    const num = parseFloat(inputValue);
    if (Number.isNaN(num)) {
      setInputValue(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className={className}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-20 px-1 py-0.5 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
        style={{ borderRadius: 0 }}
      />
    </div>
  );
};
