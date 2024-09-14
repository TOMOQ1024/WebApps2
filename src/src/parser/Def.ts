import { BNode } from "./Node";

export type ExprType = ['null', 'defi', 'ineq', 'expr'][number];

export interface ParseResult {
  // 正しい構文かどうか
  status: boolean;
  // 解析によって得られた式の型
  type: ExprType;
  // glslで実行可能なコードに変換したもの
  root: BNode | null;
}

export const NullParseResult: ParseResult = {
  status: false,
  type: 'null',
  root: new BNode(),
  // cstack: new CStack(new BNode(), 'null')
}