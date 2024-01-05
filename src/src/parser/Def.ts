import { CStack } from "./CStack";
import { BNode } from "./Node";

export type ExprType = ['null', 'defi', 'ineq', 'expr'][number];

export interface ParseResult {
  // 正しい構文かどうか
  status: boolean;
  // 解析によって得られた式の型
  type: ExprType;
  // glslで実行可能なコードに変換したもの
  cstack: CStack;
}

export const NullParseResult: ParseResult = {
  status: false,
  type: 'null',
  cstack: new CStack(new BNode(), 'null')
}