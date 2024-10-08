import { HTMLAttributes } from "react";
import styles from "./index.module.scss";

export default function InteractiveViewport(
  props: HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      {...props}
      className={`${props.className ?? ""} ${styles.iv}`}
      style={{
        ...(props.style ?? {}),
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0 }}>
        {props.children}
      </div>
    </div>
  );
}
