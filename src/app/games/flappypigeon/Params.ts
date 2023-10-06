import { useSearchParams } from "next/navigation";

export class Params {
  static readonly GRIDSIZE = 10;
  static readonly GRAVITY = 4e-5;
  static readonly FLAPVELOCITY = -9e-3;
  static readonly HVELOCITY = 3e-3;
  static readonly NESSYINTERVAL = 1500;
  static readonly SCENETRANSITION = 300;
  static readonly CANVASWIDTH = 1024;
  static readonly CANVASHEIGHT = 1024;
  static readonly FRAMERATE = 60;

  private static _KITFES = false;
  get KITFES(){return Params._KITFES;};
  private static _TIMELIMIT = 30000;
  get TIMELIMIT(){return Params._KITFES;};
  
  static get(getFunc: (name: string) => string | null){
    const f = getFunc('kitfes');
    Params._KITFES = f !== null;
    const l = getFunc('timelimit');
    Params._TIMELIMIT = l!==null ? Number(l) : 30000;
  }
}