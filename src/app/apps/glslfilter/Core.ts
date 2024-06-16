import { Application, Assets, Sprite, Texture } from "pixi.js";

export default class Core {
  vert: string =
`attribute vec2 aPosition;
varying vec2 vPosition;

void main ()
{
	vPosition = aPosition;
	gl_Position = vec4(aPosition, 0., 1.);
	// gl_PointSize = 5.;
}
`
  _frag: string = 
`void main ()
{
	gl_FragColor = vec4(1., 0., 1., 1.);
}
`;
  get frag () {
    return this._frag;
  }
  set frag (s: string) {
    this._frag = s;
  }
  app = new Application();

  constructor () {
    (async () => {
      const wr = document.querySelector('.canvas-wrapper') as HTMLElement;
      await this.app.init({
        preference: 'webgl',
      });
      wr.appendChild(this.app.canvas);
  
      const texture = await Assets.load('/icon.png') as Texture;
      texture.source.scaleMode = 'nearest';

      let sp: Sprite;
      sp = Sprite.from(texture);
      sp.interactive = true;
      sp.cursor = 'pointer';
      this.app.stage.addChild(sp);

      let t = 0;
      this.app.ticker.add((tck) =>
      {
        t += tck.deltaMS;
      });
    })();
  }

  resize (w: number, h: number) {
    this.app.renderer.resize(w, h);
  }
}