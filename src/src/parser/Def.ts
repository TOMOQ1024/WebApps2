export type ExprType = ['null', 'defi', 'ineq'][number];

export interface ParseResult {
  // 正しい構文かどうか
  status: boolean;
  // 解析によって得られた式の型
  type: ExprType;
  // glslで実行可能なコードに変換したもの
  result: string;
}

export const NullParseResult: ParseResult = {
  status: false,
  type: 'null',
  result: ''
}