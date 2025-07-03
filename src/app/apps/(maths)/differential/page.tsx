"use client";
import { useState, useEffect } from "react";
import { EditableMathField, StaticMathField } from "@/components/MathFields";
import styles from "./page.module.scss";
import { differentiateLaTeX } from "@/src/Parser/differentiate/differentiateLaTeX";

const KNOWN_FUNCS = ["sin", "cos", "tan", "log", "exp", "sqrt", "ln"];

export default function DifferentialPage() {
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
      const latex = differentiateLaTeX(input, "x", KNOWN_FUNCS);
      console.log(latex);
      setOutput(latex);
    } catch (e: any) {
      setOutput("");
      setError(e.message || "エラーが発生しました");
    }
  }, [input]);

  return (
    <main className={styles.main}>
      <h2>微分計算ツール</h2>
      <div style={{ marginBottom: 16 }}>
        <label>数式入力（LaTeX形式, 例: x^2 + \sin x）</label>
        <EditableMathField
          latex={input}
          onChange={(mf: any) => setInput(mf.latex())}
          className={styles.input}
        />
      </div>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      <div style={{ marginTop: 32 }}>
        <label>微分結果（LaTeX形式）</label>
        <div className={styles.output}>
          <StaticMathField>{output}</StaticMathField>
        </div>
      </div>
    </main>
  );
}
