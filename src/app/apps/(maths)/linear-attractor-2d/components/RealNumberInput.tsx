import { useState } from "react";

export const RealNumberInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleBlur = () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      onChange(num);
    } else {
      setInputValue(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <div className="mb-2">
      <label className="flex items-center gap-2 text-sm">
        {label}:{" "}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-20 px-1 py-0.5 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
          style={{ borderRadius: 0 }}
        />
      </label>
    </div>
  );
};

