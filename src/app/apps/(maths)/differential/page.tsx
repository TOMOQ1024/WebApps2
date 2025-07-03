"use client";
import { useState } from "react";
import { EditableMathField, StaticMathField } from "@/components/MathFields";
import { parseLatex } from "@/src/Parser/parseLatex";
import { differentiate } from "./differentiate";
import { ASTToLatex } from "./ASTToLatex";
import styles from "./page.module.scss";

const KNOWN_FUNCS = [
  "sin",
  "cos",
  "tan",
  "log",
  "exp",
  "sqrt",
  "ln",
  // 必要に応じて追加
];

export default function DifferentialPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleDifferentiate = () => {
    setError("");
    try {
      const ast = parseLatex(input, KNOWN_FUNCS);
      console.log(ASTToLatex(ast, true));
      const diffAst = differentiate(ast, "x"); // 変数はx固定
      const latex = ASTToLatex(diffAst, true);
      console.log(latex);
      setOutput(latex);
    } catch (e: any) {
      setError(e.message || "エラーが発生しました");
    }
  };

  return (
    <main className={styles.main}>
      <h2>微分計算ツール</h2>
      <div style={{ marginBottom: 16 }}>
        <label>数式入力（LaTeX形式, 例: x^2 + \sin x）</label>
        <EditableMathField
          latex={input}
          onChange={(mf: any) => setInput(mf.latex())}
          style={{
            minHeight: 40,
            fontSize: 24,
            background: "#f9f9f9",
            padding: 8,
            borderRadius: 4,
          }}
        />
      </div>
      <button
        onClick={handleDifferentiate}
        style={{ padding: "8px 24px", fontSize: 18 }}
      >
        微分
      </button>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      <div style={{ marginTop: 32 }}>
        <label>微分結果（LaTeX形式）</label>
        <div
          style={{
            minHeight: 40,
            fontSize: 24,
            background: "#f0f0f0",
            padding: 8,
            borderRadius: 4,
          }}
        >
          <StaticMathField>{output}</StaticMathField>
        </div>
      </div>
    </main>
  );
}
