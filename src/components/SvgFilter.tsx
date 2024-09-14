import { ReactElement, ReactNode, cloneElement } from "react";

export default function SvgFilter ({ src, children }: {
  src: string;
  children: ReactNode;
}) {
  const filteredChildren = cloneElement(children as ReactElement, {
    style: {
      ...(children as ReactElement).props.style,
      filter: `url(${src})`,
    },
    className: `${(children as ReactElement).props.className || ''}`
  });
  return (
    <>
      {filteredChildren}
    </>
  )
}