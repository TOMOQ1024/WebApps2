import { useSearchParams } from "next/navigation";

export interface NessyPos {
  y0: number;
  freq: number;
}

export class Params {
  static readonly GRIDSIZE = 10;
  static readonly CANVASWIDTH = 1024;
  static readonly CANVASHEIGHT = 1024;
  static readonly FIXEDNESSYPOS: NessyPos[] = [
    { y0: 0.50, freq: 0 },
    { y0: 0.50, freq: 0 },
    { y0: 0.30, freq: 0 },
    { y0: 0.50, freq: 0 },
    { y0: 0.80, freq: 0 },// #05
    { y0: 0.90, freq: 0 },
    { y0: 1.00, freq: 0 },
    { y0: 1.00, freq: 0 },
    { y0: 0.00, freq: 0 },
    { y0: 1.00, freq: 0 },// #10
    { y0: 0.00, freq: 1 },
    { y0: 0.00, freq: 2 },
    { y0: 1.00, freq: 3 },
    { y0: 0.00, freq: 4 },
    { y0: 1.00, freq: 5 },// #15
    { y0: 0.00, freq: 6 },
    { y0: 0.00, freq: 7 },
    { y0: 1.00, freq: 8 },
    { y0: 1.00, freq: 9 },
    { y0: 0.50, freq:10 },// #20
  ];

  static KITFES = false;
  static TIMELIMIT = 30000;
  static KEYHOLDTIME = 1000;
  static BORDER = 10;
  static GRAVITY = 4e-5;
  static FLAPVELOCITY = -9e-3;
  static HVELOCITY = 4e-3;
  static NESSYINTERVAL = 1450;
  static SCENETRANSITION = 200;
  static FRAMERATE = 60;
  static NESSYSTIFFNESS = 5;
  
  static get(getFunc: (name: string) => string | null){
    let v = getFunc('kitfes');
    if(v!==null)Params.KITFES = true;
    v = getFunc('timelimit');
    if(v!==null && !Number.isNaN(Number(v)))Params.TIMELIMIT = Number(v);
    v = getFunc('keyholdtime');
    if(v!==null && !Number.isNaN(Number(v)))Params.KEYHOLDTIME = Number(v);
    v = getFunc('border');
    if(v!==null && !Number.isNaN(Number(v)))Params.BORDER = Number(v);
    v = getFunc('gravity');
    if(v!==null && !Number.isNaN(Number(v)))Params.GRAVITY = Number(v);
    v = getFunc('flapvelocity');
    if(v!==null && !Number.isNaN(Number(v)))Params.FLAPVELOCITY = Number(v);
    v = getFunc('hvelocity');
    if(v!==null && !Number.isNaN(Number(v)))Params.HVELOCITY = Number(v);
    v = getFunc('nessyinterval');
    if(v!==null && !Number.isNaN(Number(v)))Params.NESSYINTERVAL = Number(v);
    v = getFunc('scenetransition');
    if(v!==null && !Number.isNaN(Number(v)))Params.SCENETRANSITION = Number(v);
    v = getFunc('framerate');
    if(v!==null && !Number.isNaN(Number(v)))Params.FRAMERATE = Number(v);
    v = getFunc('nessystiffness');
    if(v!==null && !Number.isNaN(Number(v)))Params.NESSYSTIFFNESS = Number(v);
  }
}