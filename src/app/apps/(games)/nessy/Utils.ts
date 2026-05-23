export const Scenes = [
  '->title',
  'title',
  'title->',
  '->game',
  'game',
  'game->',
  '->result',
  'result',
  'result->'
] as const;

export type Scene = typeof Scenes[number];

export const ImageNames: {[Key:string]:string} = {
  bg: 'bg-tile.png',
  fc: 'face.png',
  fh: 'face-hato.png',
  ns: 'neck-strait.png',
  nb: 'neck-bend.png',
  sh: 'shoulder.png',

  pc: 'peace.png',
  mc: 'minecraft.png',
  np: 'nyanpuppu.png',
  ak: 'akiko.png'
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

export default function a2dp(d: number){
  return {
    x: Math.round(Math.cos(Math.PI/2*d)),
    y: Math.round(Math.sin(Math.PI/2*d)),
  }
}