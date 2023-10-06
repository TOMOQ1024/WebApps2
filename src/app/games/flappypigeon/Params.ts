import { useSearchParams } from "next/navigation";

export class Params {
  static readonly GRIDSIZE = 10;
  static readonly GRAVITY = 4e-5;
  static readonly FLAPVELOCITY = -9e-3;
  static readonly HVELOCITY = 4e-3;
  static readonly NESSYINTERVAL = 1450;
  static readonly SCENETRANSITION = 300;
  static readonly CANVASWIDTH = 1024;
  static readonly CANVASHEIGHT = 1024;
  static readonly FRAMERATE = 60;
  static readonly BORDER = 10;
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
  get TIMELIMIT(){return Params.KITFES;};
  
  static get(getFunc: (name: string) => string | null){
    const f = getFunc('kitfes');
    Params.KITFES = f !== null;
    const l = getFunc('timelimit');
    Params.TIMELIMIT = l!==null ? Number(l) : 30000;
  }
}