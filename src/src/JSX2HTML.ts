import { renderToStaticMarkup } from "react-dom/server";
import { JSX } from "react";

function JSX2HTML(jsx: JSX.Element): string {
  return renderToStaticMarkup(jsx);
}
