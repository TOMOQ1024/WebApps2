"use client";
import { useEffect, useState } from "react";
import { EditableMathField, StaticMathField } from "@/components/MathFields";
import { simplifyLaTeX } from "@/shared/parser/simplify/simplifyLaTeX";

export default function SimplifyPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!input) {
      setOutput("");
      setError("");
      return;
    }
    try {
      setError("");
      console.log(input);
      const latex = simplifyLaTeX(input);
      console.log(latex);
      setOutput(latex);
    } catch (e: unknown) {
      setOutput("");
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    }
  }, [input]);

  return (
    <main className="mx-auto my-8 max-w-[600px] bg-[var(--background-color)] p-6">
      <h2>数式簡単化ツール</h2>
      <div className="m-4 min-h-10 bg-[var(--background-color)] text-2xl">
        <label htmlFor="input">入力</label>
        <EditableMathField
          id="input"
          className="w-[calc(100%-20px)] border-2 border-[var(--border-color)] p-2"
          latex={input}
          onChange={(mf: any) => setInput(mf.latex())}
        />
      </div>
      {error && <div className="mt-3 text-[#dc3545]">{error}</div>}
      <div className="m-4 min-h-10 bg-[var(--background-color)] text-2xl">
        <label htmlFor="output">出力</label>
        <StaticMathField
          id="output"
          className="w-[calc(100%-20px)] border-2 border-[var(--border-color)] p-2"
        >
          {output}
        </StaticMathField>
      </div>
    </main>
  );
}
