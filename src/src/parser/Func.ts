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
  MIX = 'mix',
  MED = 'median',
  AVG = 'avg',
}

const Funcs = {
  nil: {
    argc: 0,
    cdgl: '',
  },
  rep: {
    str: 'Re',
    argc: 1,
    cdgl: 'cre',
  },
  imp: {
    str: 'Im',
    argc: 1,
    cdgl: 'cim',
  },
  coj: {
    str: 'conj',
    argc: 1,
    cdgl: 'cconj',
  },
  abs: {
    str: 'abs',
    argc: 1,
    cdgl: 'cabs',
  },
  arg: {
    str: 'arg',
    argc: 1,
    cdgl: 'carg',
  },
  // 指数関数
  exp: {
    str: 'exp',
    argc: 1,
    cdgl: 'cexp',
  },
  // 双曲線関数
  coh: {
    str: 'cosh',
    argc: 1,
    cdgl: 'ccosh',
  },
  sih: {
    str: 'sinh',
    argc: 1,
    cdgl: 'csinh',
  },
  tah: {
    str: 'tanh',
    argc: 1,
    cdgl: 'ctanh',
  },
  // 三角関数
  cos: {
    str: 'cos',
    argc: 1,
    cdgl: 'ccos',
  },
  sin: {
    str: 'sin',
    argc: 1,
    cdgl: 'csin',
  },
  tan: {
    str: 'tan',
    argc: 1,
    cdgl: 'ctan',
  },
  // 冪乗
  sqr: {
    str: 'sqrt',
    argc: 1,
    cdgl: 'csqrt',
  },
  cbr: {
    str: 'cbrt',
    argc: 1,
    cdgl: 'ccbrt',
  },
  // 整数，小数
  flr: {
    str: 'floor',
    argc: 1,
    cdgl: 'cfloor',
  },
  rnd: {
    str: 'round',
    argc: 1,
    cdgl: 'cround',
  },
  cil: {
    str: 'ceil',
    argc: 1,
    cdgl: 'cceil',
  },
  frc: {
    str: 'fract',
    argc: 1,
    cdgl: 'fract',
  },
  // 多変数関数
  mix: {
    str: 'cmix',
    argc: 3,
    cdgl: 'cmix',
  },
  max: {
    str: 'max',
    argc: Infinity,
    cdgl: 'max',
  },
  min: {
    str: 'min',
    argc: Infinity,
    cdgl: 'min',
  },
  med: {
    str: 'median',
    argc: Infinity,
    // cdgl: 'median',
  },
  men: {
    str: 'mean',
    argc: Infinity,
    // cdgl: 'mean',
  },
};

export function isFuncName(input: any){
  let s = String(input);
  return 0<=Object.values(FuncName).map(t=>String(t)).indexOf(s);
}