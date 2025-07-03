import styles from "./index.module.scss";

export const Slider = ({ label, min, max, step, value, onChange }: any) => (
  <div className={styles.slider}>
    <label>
      {label}:{" "}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />{" "}
      {value}
    </label>
  </div>
);
