import { FuncName } from "./Func";
import { VarName } from "./Var";

export enum TokenType {
  VAR = 'var',
  NID = 'nid',
  DFD = 'dfd',
  EQL = 'eql',
  GEQ = 'geq',
  LEQ = 'leq',
  GET = 'get',
  LET = 'let',
  ADD = 'add',
  SUB = 'sub',
  MUL = 'mul',
  DIV = 'div',
  MOD = 'mod',
  POW = 'pow',
  NUM = 'number',
  LPT = 'left parenthesis',
  RPT = 'right parenthesis',
  CMA = 'comma',
  FNC = 'function',
  UNK = 'unknown',
  EOL = 'eol',
}

export function isTokenType(input: any){
  let s = String(input);
  return 0<=Object.values(TokenType).map(t=>String(t)).indexOf(s);
}

export class Token {
  constructor(
    public type: TokenType = TokenType.UNK,
    public value: (number | FuncName | VarName | string) = 0,
    public raw: string = ''
  ){}

  static eol = new Token(TokenType.EOL);
}

export { FuncName };

