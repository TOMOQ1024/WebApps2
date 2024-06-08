import { median, mean } from "../Math";
import { BNode } from "./Node";

export const Funcs: {
  [fn: string]: {
    str: string,
    argc: number,
    cdgl?: string,
    calc?: (node: BNode, args: {[key:string]:number}) => number[],
    togl?: (node: BNode) => string,
    tocdgl?: (node: BNode, fn?: string) => string,
  }
} = {
  cma: {
    str: '0',
    argc: 0,
    cdgl: '',
    calc: (n, args) => [...n.calcL(args),...n.calcR(args)],
    togl: n => `${n.toglL()},${n.toglR()}`,
    tocdgl: (n,fn) => fn
    ? `${fn}(${n.tocdglL()},${n.tocdglR()})`
    : `${n.tocdglL()},${n.tocdglR()}`,
  },
  rep: {
    str: 'Re',
    argc: 1,
    tocdgl: n => `cre(${n.tocdglL()})`,
  },
  imp: {
    str: 'Im',
    argc: 1,
    tocdgl: n => `cim(${n.tocdglL()})`,
  },
  coj: {
    str: 'conj',
    argc: 1,
    tocdgl: n => `cconj(${n.tocdglL()})`,
  },
  abs: {
    str: 'abs',
    argc: 1,
    calc: (n, args) => [Math.abs(n.calcL(args)[0])],
    togl: n => `abs(${n.toglL()})`,
    tocdgl: n => `cabs(${n.tocdglL()})`,
  },
  arg: {
    str: 'arg',
    argc: 1,
    tocdgl: n => `carg(${n.tocdglL()})`,
  },
  // 指数関数
  exp: {
    str: 'exp',
    argc: 1,
    calc: (n, args) => [Math.exp(n.calcL(args)[0])],
    togl: n => `exp(${n.toglL()})`,
    tocdgl: n => `cexp(${n.tocdglL()})`,
  },
  // 双曲線関数
  coh: {
    str: 'cosh',
    argc: 1,
    calc: (n, args) => [Math.cosh(n.calcL(args)[0])],
    togl: n => `cosh(${n.toglL()})`,
    tocdgl: n => `ccosh(${n.tocdglL()})`,
  },
  sih: {
    str: 'sinh',
    argc: 1,
    calc: (n, args) => [Math.sinh(n.calcL(args)[0])],
    togl: n => `sinh(${n.toglL()})`,
    tocdgl: n => `csinh(${n.tocdglL()})`,
  },
  tah: {
    str: 'tanh',
    argc: 1,
    calc: (n, args) => [Math.tanh(n.calcL(args)[0])],
    togl: n => `tanh(${n.toglL()})`,
    tocdgl: n => `ctanh(${n.tocdglL()})`,
  },
  // 三角関数
  cos: {
    str: 'cos',
    argc: 1,
    calc: (n, args) => [Math.cos(n.calcL(args)[0])],
    togl: n => `cos(${n.toglL()})`,
    tocdgl: n => `ccos(${n.tocdglL()})`,
  },
  sin: {
    str: 'sin',
    argc: 1,
    calc: (n, args) => [Math.sin(n.calcL(args)[0])],
    togl: n => `sin(${n.toglL()})`,
    tocdgl: n => `csin(${n.tocdglL()})`,
  },
  tan: {
    str: 'tan',
    argc: 1,
    calc: (n, args) => [Math.tan(n.calcL(args)[0])],
    togl: n => `tan(${n.toglL()})`,
    tocdgl: n => `ctan(${n.tocdglL()})`,
  },
  // n乗根
  sqr: {
    str: 'sqrt',
    argc: 1,
    calc: (n, args) => [Math.sqrt(n.calcL(args)[0])],
    togl: n => `sqrt(${n.toglL()})`,
    tocdgl: n => `csqrt(${n.tocdglL()})`,
  },
  cbr: {
    str: 'cbrt',
    argc: 1,
    calc: (n, args) => [Math.cbrt(n.calcL(args)[0])],
    togl: n => `cbrt(${n.toglL()})`,
    tocdgl: n => `ccbrt(${n.tocdglL()})`,
  },
  // 整数，小数
  flr: {
    str: 'floor',
    argc: 1,
    calc: (n, args) => [Math.floor(n.calcL(args)[0])],
    togl: n => `floor(${n.toglL()})`,
    tocdgl: n => `cfloor(${n.tocdglL()})`,
  },
  rnd: {
    str: 'round',
    argc: 1,
    calc: (n, args) => [Math.round(n.calcL(args)[0])],
    togl: n => `floor(${n.toglL()}+.5)`,
    tocdgl: n => `cround(${n.tocdglL()})`,
  },
  cil: {
    str: 'ceil',
    argc: 1,
    calc: (n, args) => [Math.ceil(n.calcL(args)[0])],
    togl: n => `ceil(${n.toglL()})`,
    tocdgl: n => `cceil(${n.tocdglL()})`,
  },
  frc: {
    str: 'fract',
    argc: 1,
    calc: (n, args) => (x=>[x-Math.floor(x)])(n.calcL(args)[0]),
    togl: n => `fract(${n.toglL()})`,
    tocdgl: n => `fract(${n.tocdglL()})`,
  },
  // 多変数関数
  mix: {
    str: 'mix',
    argc: 3,
    cdgl: 'cmix',
    tocdgl: n => `cmix(${n.tocdglL()},${n.tocdglR()})`,
  },
  max: {
    str: 'max',
    argc: Infinity,
    cdgl: 'max',
    calc: (n, args) => [Math.max(...n.calcL(args),...n.calcR(args))],
    togl: n => `max(${n.toglL()},${n.toglR()})`,
    tocdgl: n => `max(${n.tocdglL('max')},${n.tocdglR('max')})`,
  },
  min: {
    str: 'min',
    argc: Infinity,
    cdgl: 'min',
    calc: (n, args) => [Math.min(...n.calcL(args),...n.calcR(args))],
    togl: n => `min(${n.toglL()},${n.toglR()})`,
    tocdgl: n => `min(${n.tocdglL('min')},${n.tocdglR('min')})`,
  },
  med: {
    str: 'median',
    argc: Infinity,
    // cdgl: 'median',
    calc: (n, args) => [median(...n.calcL(args),...n.calcR(args))],
    togl: n => `median(${n.toglL()},${n.toglR()})`,
  },
  men: {
    str: 'mean',
    argc: Infinity,
    // cdgl: 'mean',
    calc: (n, args) => [mean(...n.calcL(args),...n.calcR(args))],
    togl: n => `mean(${n.toglL()},${n.toglR()})`,
  },
};

export function isFunc(input: any){
  let s = String(input);
  for (let fn in Funcs) {
    if ((new RegExp(`^${{...Funcs}[fn]!.str}`)).test(s)) return fn;
  }
  return '';
}