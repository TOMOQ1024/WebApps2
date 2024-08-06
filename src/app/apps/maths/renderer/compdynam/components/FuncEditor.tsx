import { useEffect, useRef } from "react";
import CDCore from "../CompDynamCore";

export default function FuncEditor({ core }: { core: CDCore }) {
  const ref = useRef<HTMLElement>(null);
  const ref2 = useRef<HTMLElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        return false;
      }
    }

    const ta = document.getElementById("func-input")!;
    ta.addEventListener("keydown", onKeyDown, { passive: false });
    return () => {
      ta.removeEventListener("keydown", onKeyDown);
    };
  });

  function HandleZ0Input(e: InputEvent) {
    let textarea = e.target as HTMLSpanElement;
    core.z0expr = textarea.innerText;
  }

  function HandleFuncInput(e: InputEvent) {
    let textarea = e.target as HTMLSpanElement;
    core.funcexpr = textarea.innerText;
  }

  const HandlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    let text = e.clipboardData!.getData("text/plain");
    document.execCommand("insertHTML", false, text);
  };

  return (
    <div id="func-editor">
      <div>- 関数・反復回数 -</div>
      <div id="iter-editor">
        反復回数：
        <input
          id="iter-input"
          className="input"
          type="number"
          step="1"
          name="iter"
          defaultValue={core.iter}
          onChange={(e) => {
            core.setIter(Number(e.target.value));
            core.init();
          }}
        />
      </div>
      <div id="z0-display">
        z_0=
        <span
          id="z0-input"
          className="input"
          role="textbox"
          ref={ref2}
          aria-label="初期値を入力する"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => HandleZ0Input(e as unknown as InputEvent)}
          onPaste={(e) => HandlePaste(e as unknown as ClipboardEvent)}
        >
          {core.z0expr}
        </span>
      </div>
      <div id="func-display">
        f(z)=
        <span
          id="func-input"
          className="input"
          role="textbox"
          ref={ref}
          aria-label="数式を入力する"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => HandleFuncInput(e as unknown as InputEvent)}
          onClick={(e) => HandleFuncInput(e as unknown as InputEvent)}
          onPaste={(e) => HandlePaste(e as unknown as ClipboardEvent)}
        >
          {core.funcexpr}
        </span>
      </div>
    </div>
  );
}
