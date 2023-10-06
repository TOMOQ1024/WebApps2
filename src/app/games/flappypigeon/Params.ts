import { useSearchParams } from "next/navigation";

export class Params {
  static readonly GRIDSIZE = 10;
  static readonly CANVASWIDTH = 1024;
  static readonly CANVASHEIGHT = 1024;
  static readonly FIXEDNESSYPOS = [
    0.50,
    0.50,
    0.30,
    0.50,
    0.80,// #05
    0.90,
    1.00,
    1.00,
    0.00,
    1.00,// #10
    0.00,
    -.20,
    1.00,
    0.00,
    1.00,// #15
    0.00,
    -.50,
    1.20,
    1.20,
    0.50,// #20
  ];

  static KITFES = false;
  static TIMELIMIT = 30000;
  static KEYHOLDTIME = 2000;
  static BORDER = 10;
  static GRAVITY = 4e-5;
  static FLAPVELOCITY = -9e-3;
  static HVELOCITY = 4e-3;
  static NESSYINTERVAL = 1450;
  static SCENETRANSITION = 300;
  static FRAMERATE = 60;
  
  static get(getFunc: (name: string) => string | null){
    let v = getFunc('kitfes');
    if(v!==null)Params.KITFES = true;
    v = getFunc('timelimit');
    if(v!==null)Params.TIMELIMIT = Number(v);
    v = getFunc('keyholdtime');
    if(v!==null)Params.KEYHOLDTIME = Number(v);
    v = getFunc('border');
    if(v!==null)Params.BORDER = Number(v);
    v = getFunc('gravity');
    if(v!==null)Params.GRAVITY = Number(v);
    v = getFunc('flapvelocity');
    if(v!==null)Params.FLAPVELOCITY = Number(v);
    v = getFunc('hvelocity');
    if(v!==null)Params.HVELOCITY = Number(v);
    v = getFunc('nessyinterval');
    if(v!==null)Params.NESSYINTERVAL = Number(v);
    v = getFunc('scenetransition');
    if(v!==null)Params.SCENETRANSITION = Number(v);
    v = getFunc('framerate');
    if(v!==null)Params.FRAMERATE = Number(v);
  }
}