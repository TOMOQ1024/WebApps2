import { ReactElement, ReactNode, cloneElement } from "react";

export default function SvgFilter({
  src,
  children,
}: {
  src: string;
  children: ReactNode;
}) {
  const ch = children as ReactElement<any>;
  const filteredChildren = cloneElement(ch, {
    style: {
      ...ch.props.style,
      filter: `url(${src})`,
    },
    className: `${ch.props.className || ""}`,
  });
  return <>{filteredChildren}</>;
}
