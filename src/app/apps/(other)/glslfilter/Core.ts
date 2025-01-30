import {
  Application,
  Assets,
  Filter,
  GlProgram,
  Point,
  Sprite,
  Texture,
} from "pixi.js";

export default class Core {
  vert: string = `in vec2 aPosition;
out vec2 vPosition;
out vec2 vTexCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
  vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
  
  position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
  position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

  return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
  return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
  vPosition = aPosition;
  gl_Position = filterVertexPosition();
  vTexCoord = filterTextureCoord();
}`;
  _frag: string = `in vec2 vTexCoord;
in vec2 vPosition;
out vec4 finalColor;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

void main ()
{
  vec4 col0 = texture2D(uTexture, vTexCoord);
  vec4 col1 = vec4((1.+cos(uTime)/2.), (1.+sin(uTime)/2.), 1., 1.);
  
  bool flgX = 3. < abs(vPosition.x * uResolution.x - uMouse.x);
  bool flgY = 3. < abs(vPosition.y * uResolution.y - uMouse.y);
  
	finalColor = flgX && flgY ? col0 : col1;
}
`;
  get frag() {
    return this._frag;
  }
  set frag(s: string) {
    this._frag = s;
    this.updateShader();
  }
  app = new Application();
  filter = new Filter({
    glProgram: GlProgram.from({
      fragment: this.frag,
      vertex: this.vert,
    }),
    resources: {
      uniforms: {
        uTime: { value: 0.0, type: "f32" },
        uMouse: { value: new Point(), type: "vec2<f32>" },
        uResolution: { value: new Point(), type: "vec2<f32>" },
      },
    },
  });

  constructor() {
    (async () => {
      const wr = document.querySelector(".canvas-wrapper") as HTMLElement;
      await this.app.init({
        preference: "webgl",
      });
      wr.appendChild(this.app.canvas);

      const texture = (await Assets.load(
        "/resources/compdynam/images/earth.jpg"
      )) as Texture;
      // const texture = (await Assets.load("/ogame.png")) as Texture;
      texture.source.scaleMode = "nearest";

      let sp: Sprite;
      sp = Sprite.from(texture);
      sp.interactive = true;
      sp.cursor = "pointer";
      sp.filters = [this.filter];
      this.app.stage.addChild(sp);
      this.resize(sp.width, sp.height);

      this.app.ticker.maxFPS = 0.1;
      this.app.ticker.minFPS = 0.1;

      this.app.ticker.add((tck) => {
        this.filter.resources.uniforms.uniforms.uTime =
          performance.now() / 1000;
      });

      sp.on("pointermove", (e) => {
        this.filter.resources.uniforms.uniforms.uMouse.copyFrom(e.global);
      });
    })();
  }

  updateShader() {
    this.filter.glProgram.destroy();
    this.filter.glProgram = GlProgram.from({
      fragment: this.frag,
      vertex: this.vert,
    });
  }

  resize(w: number, h: number) {
    this.app.renderer.resize(w, h);
    this.filter.resources.uniforms.uniforms.uResolution = new Point(w, h);
  }
}
