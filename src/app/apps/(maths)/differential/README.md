# Differential

入力した LaTeX 形式の数式を微分する.

## 実装

- 画面には MathQuill を用いた入力・出力のみを表示する
- 数式の解析には `@/shared/parser/parseLatex.ts` を用いる
- 微分処理は `@/shared/parser/differentiate/differentiateLaTeX.ts`
