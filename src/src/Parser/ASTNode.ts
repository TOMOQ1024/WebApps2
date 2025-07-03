// 抽象構文木の型定義
export type ASTNode =
  | { type: "number"; value: number; hasBraces?: boolean }
  | { type: "symbol"; name: string }
  | {
      type: "operator";
      op: string;
      left: ASTNode;
      right: ASTNode;
      hasBraces?: boolean;
    }
  | { type: "function"; name: string; args: ASTNode[] };
