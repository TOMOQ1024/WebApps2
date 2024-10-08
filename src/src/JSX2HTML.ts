import { renderToStaticMarkup } from "react-dom/server";

function JSX2HTML(jsx: JSX.Element): string {
  return renderToStaticMarkup(jsx);
}
