export enum FuncName {
  NIL = '',

  REP = 'Re',
  IMP = 'Im',
  COJ = 'conj',
  COH = 'cosh',
  SIH = 'sinh',
  TAH = 'tanh',
  COS = 'cos',
  SIN = 'sin',
  TAN = 'tan',
  FLR = 'floor',
  RND = 'round',
  CIL = 'ceil',
  FRC = 'fract',
  ABS = 'abs',
  ARG = 'arg',
  SQR = 'sqrt',
  CBR = 'cbrt',
  EXP = 'exp',

  MAX = 'max',
  MIN = 'min',
  MED = 'median',
  AVG = 'avg',
}

export function isFuncName(input: any){
  let s = String(input);
  return 0<=Object.values(FuncName).map(t=>String(t)).indexOf(s);
}