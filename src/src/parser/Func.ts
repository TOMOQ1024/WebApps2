export enum FuncName {
  NIL = '',

  COH = 'cosh',
  SIH = 'sinh',
  COS = 'cos',
  SIN = 'sin',
  TAN = 'tan',
  FLR = 'floor',
  RND = 'round',
  CIL = 'ceil',
  ABS = 'abs',
  SQR = 'sqrt',
  CBR = 'cbrt',
  EXP = 'exp',

  MAX = 'max',
  MIN = 'min',
  MED = 'median',
  AVG = 'average',
}

export function isFuncName(input: any){
  let s = String(input);
  return 0<=Object.values(FuncName).map(t=>String(t)).indexOf(s);
}