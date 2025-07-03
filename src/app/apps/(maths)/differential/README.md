# Differential

入力した LaTeX 形式の数式を微分する.

## 実装

- 画面には MathQuill を用いた入力・出力のみを表示する
- 数式の解析には`@/src/src/Parser/parseLatex.ts`を用いる
- 解析後の AST を微分する処理を新たに実装する
- 微分後の AST 表示のため，`ASTToLatex`を実装する
