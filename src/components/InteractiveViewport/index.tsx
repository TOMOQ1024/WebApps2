import type { HTMLAttributes } from "react";

export default function InteractiveViewport(
  props: HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div
      {...props}
      className={`relative overflow-hidden ${props.className ?? ""}`}
    >
      <div className="absolute top-0 left-0">{props.children}</div>
    </div>
  );
}
