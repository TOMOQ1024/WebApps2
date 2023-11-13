"use client"
import { Parse } from "@/src/parser/Main"
import { useState } from "react";

export default function Main(){
  const [expression, setExpression] = useState("");

  function HandleInput(e: InputEvent){
    let textarea = e.target as HTMLSpanElement;

    // 現在のカーソルによる選択場所を記録
    let range0 = window.getSelection()?.getRangeAt(0);
    let so = range0?.startOffset as number;
    let eo = range0?.endOffset as number;
    let range = document.createRange();
    
    // テキストの解析
    let result = Parse(textarea.innerText, []);
    console.log(result);
    
    if(result.status){
      setExpression(textarea.innerText);
    }

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

  return (
    <main
      style={{
        textAlign: 'center'
      }}
    >
      <span
      className="textarea"
      role="textbox"
      contentEditable
      suppressContentEditableWarning
      onInput={e=>HandleInput(e as unknown as InputEvent)}
      style={{
        background: "#444",
        border: "20px solid white",
        display: "inline-block",
      }}
    >
      {expression}
    </span>
    </main>
  )
}
