import { Game } from "./Game";

export const Scenes = [
  'title_in',
  'title',
  'title_out',
  'howto_in',
  'howto',
  'howto_out',
  'game_in',
  'game',
  'game_resume_in',
  'game_resume_out',
  'game_out',
  'result_in',
  'result',
  'result_out'
] as const;

export type Scene = typeof Scenes[number];

export class SceneMgr {
  private _current: Scene = 'title_in';
  constructor(private _parent: Game){}

  get current(){
    return this._current;
  }

  set(s: Scene){
    this._current = s;
  }

  is(s: Scene){
    return this._current === s;
  }

  match(regexp: string | RegExp){
    return Boolean(this._current.match(regexp));
  }

  // next() {
  //   this._current = Scenes[(Scenes.indexOf(this._current)+1)%Scenes.length];
  // }
}
