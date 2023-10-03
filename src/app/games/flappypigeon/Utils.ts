export const ImageNames: {[Key:string]:string} = {
  dd: 'dead.png',
  f0: 'flap0.png',
  f1: 'flap1.png',
  nc: 'nicha.png',
  nh: 'nessy-head.png',
  nn: 'nessy-neck.png',
}


export function Clamp(min: number, val: number, max: number){
  return Math.max(min, Math.min(val, max));
}

export function IsIn(x:number,y:number,l:number,t:number,w:number,h:number){
  if(x < l)return false;
  if(y < t)return false;
  if(l+w <= x)return false;
  if(t+h <= y)return false;
  
  return true;
}

export function IsIn_p(pos:{x:number,y:number},l:number,t:number,w:number,h:number){
  if(pos.x < l)return false;
  if(pos.y < t)return false;
  if(l+w <= pos.x)return false;
  if(t+h <= pos.y)return false;
  
  return true;
}
