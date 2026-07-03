# Simplify

入力した LaTeX 形式の数式を簡約する.

## 実装

- 画面には MathQuill を用いた入力・出力のみを表示する
- 数式の解析には `@/shared/parser/parseLatex.ts` を用いる
- 簡約処理は `@/shared/parser/simplify/simplifyLaTeX.ts`
