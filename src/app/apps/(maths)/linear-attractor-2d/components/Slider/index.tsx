import styles from "./index.module.scss";

export const Slider = ({ label, min, max, step, value, onChange }: any) => (
  <div className="my-2">
    <label className="flex items-center gap-2 text-sm">
      {label}:{" "}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.slider}
      />{" "}
      <span className="font-medium">{value.toFixed(3)}</span>
    </label>
  </div>
);
