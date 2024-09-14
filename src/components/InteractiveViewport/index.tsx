import { HTMLAttributes } from "react";
import styles from './index.module.scss';

export default function InteractiveViewport (props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`${props.className ?? ''} ${styles.iv}`}
    />
  );
}