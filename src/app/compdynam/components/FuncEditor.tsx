import { Parse } from "@/src/parser/Main";
import { useEffect, useRef } from "react";
import CDCore from "../CompDynamCore";

export default function FuncEditor({core}: {
  core: CDCore;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(()=>{
    function onKeyDown(e: KeyboardEvent) {
      e.stopPropagation();
      if(e.key === 'Enter'){
        e.preventDefault();
        return false;
      }
    }

    const ta = document.getElementById('func-textarea')!;
    ta.addEventListener('keydown', onKeyDown, {passive: false});
    return () => {
      ta.removeEventListener('keydown', onKeyDown);
    }
  });


  function HandleInput(e: InputEvent) {
    let textarea = e.target as HTMLSpanElement;

    // 現在のカーソルによる選択場所を記録
    let range0 = window.getSelection()?.getRangeAt(0);
    let so = range0?.startOffset as number;
    let eo = range0?.endOffset as number;
    let range = document.createRange();
    
    // テキストの解析
    let result = Parse(
      textarea.innerText,
      ['z', 'i']
      // gmgr.definedVariableNames.filter(
      //   vn=>vn!==gmgr.expressions[exprno].statement.split('=')[0]
      // )
    );

    const ctl = document.getElementById('controls')!
    if(result.status){
      ctl.className = ctl.className.replace(/(?:in)?valid/, 'valid');
      core.setExpression(textarea.innerText);
      core.func = result.cstack.tocdgl(result.cstack.root);
      core.init();
    }
    else {
      ctl.className = ctl.className.replace(/(?:in)?valid/, 'invalid');
    }
    // updateGmgr();

    // 再描画が行われるため，カーソルの選択場所を復元する
    setTimeout(()=>{
      if(textarea.firstChild){
        range.setStart(textarea.firstChild, so);
        range.setEnd(textarea.firstChild, eo);
      } else {
        range.setStart(textarea, so);
        range.setEnd(textarea, eo);
      }
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }, 10);
  }

  const HandlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    let text = e.clipboardData!.getData('text/plain');
    document.execCommand('insertHTML', false, text);
  }
  
  return (
    <div id='func-editor'>
      <div>Current Function:</div>
      <div id='func-display'>
        f(z)=<span
          id='func-textarea'
          role='textbox'
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={e=>HandleInput(e as unknown as InputEvent)}
          onPaste={e=>HandlePaste(e as unknown as ClipboardEvent)}
        >
      {core.expr}
    </span>
      </div>
    </div>
  )
}
