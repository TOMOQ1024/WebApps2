"use client";
import { useState, useEffect } from "react";
import { EditableMathField, StaticMathField } from "@/components/MathFields";
import styles from "./page.module.scss";
import { simplifyLaTeX } from "@/src/Parser/simplify/simplifyLaTeX";

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
    } catch (e: any) {
      setOutput("");
      setError(e.message || "エラーが発生しました");
    }
  }, [input]);

  return (
    <main className={styles.main}>
      <h2>数式簡単化ツール</h2>
      <div className={styles.inputWrapper}>
        <label>入力</label>
        <EditableMathField
          className={styles.input}
          latex={input}
          onChange={(mf: any) => setInput(mf.latex())}
        />
      </div>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      <div className={styles.outputWrapper}>
        <label>出力</label>
        <StaticMathField className={styles.output}>{output}</StaticMathField>
      </div>
    </main>
  );
}
