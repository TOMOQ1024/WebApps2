// 抽象構文木の型定義
export type ASTNode =
  | { type: "number"; value: number }
  | { type: "symbol"; name: string }
  | { type: "operator"; op: string; left: ASTNode; right: ASTNode }
  | { type: "function"; name: string; args: ASTNode[] };
