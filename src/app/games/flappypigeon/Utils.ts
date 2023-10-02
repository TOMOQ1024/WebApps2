export const Scenes = [
  'title_in',
  'title',
  'title_out',
  'game_in',
  'game',
  'game_out',
  'result_in',
  'result',
  'result_out'
] as const;

export type Scene = typeof Scenes[number];

export const ImageNames: {[Key:string]:string} = {
  dd: 'dead.png',
  f0: 'flap0.png',
  f1: 'flap1.png',
  nc: 'nicha.png',
  nh: 'nessy-head.png',
  nn: 'nessy-neck.png',
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
