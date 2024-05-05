import { RenderingMode } from "./Definitions";
import Graph from "./Graph";
import { Application, Assets, Geometry, Mesh, Rectangle, Shader, Sprite, Texture } from "pixi.js";
import axios from "axios";
import { Vector2 } from "three";

export default class CDCore {
  mMgr = {
    isDown: false,
    dPos: new Vector2(),
    pos: new Vector2(),
  };
  tMgr: {
    touches: {
      [id: number]: Vector2
    }
  } = {
    touches: {}
  }
  graph = new Graph();
  app = new Application();
  iter: number = 100;
  z0: string = 'c';
  z0expr: string = 'c';
  func: string = 'z = csq(z) - vec2(.6, .42);';
  expr: string = 'z^2-0.6-0.42i';
  resFactor: number = 1;
  renderingMode: RenderingMode = RenderingMode.HSV;
  nessyMode = false;
  interval: NodeJS.Timeout | null = null;
  quad = new Mesh<Geometry, Shader>({geometry: new Geometry({
    attributes: {
      aPosition: [
        -1, -1,
        -1, +3,
        +3, -1,
      ],
    },
    indexBuffer: [0, 2, 1],
  })});
  rawShaderData = {
    vert: '',
    frag: '',
  };
  nessyTex = new Texture();

  async init () {
    this.nessyTex = new Texture({
      source: await Assets.load('/resources/compdynam/images/nessy.png'),
      frame: new Rectangle(0, 0, 128, 128),
    });
    this.nessyTex.source.addressMode = 'repeat';
    this.nessyTex.source.scaleMode = 'nearest';

    // 表示には影響しないが，これを表示すると何故かテクスチャがシェーダーに適用される(???)
    const nessySp = Sprite.from(this.nessyTex);
    nessySp.x = -200;
    this.app.stage.addChild(nessySp);

    const wr = document.querySelector('#graph-wrapper') as HTMLElement;
    await this.app.init({
      resizeTo: wr,
      preference: 'webgl',
    });
    wr.appendChild(this.app.canvas);

    this.rawShaderData = await axios.get('/api/compdynam-shaders').then(res=>{
      return res.data;
    }).catch(e=>{
      throw new Error(e);
    });

    this.updateShader();
  
    this.quad.width = this.app.screen.width;
    this.quad.height = this.app.screen.height;
    this.quad.x = this.app.screen.width / 2;
    this.quad.y = this.app.screen.height / 2;
      
    this.app.stage.addChild(this.quad);

    this.app.ticker.add(() =>
    {
      this.quad.shader.resources.uniforms.uniforms.uTime = performance.now()/1000;
    });
  }

  updateShader() {
    const shader = Shader.from({
      gl: {
        vertex: this.rawShaderData.vert,
        fragment: this.rawShaderData.frag
          .replace('z/* input func here */', this.func)
          .replace('1/* input iter here */', `${this.iter}`)
          .replace('c/* input z0 here */', `${this.z0}`)
          .replace('/* delete if mode is not grayscale */', this.renderingMode !== RenderingMode.GRAYSCALE ? '//' : '')
          .replace('/* delete if mode is not hsv */', this.renderingMode !== RenderingMode.HSV ? '//' : '')
          .replace('false/* input boolean of nessy here */', this.nessyMode ? 'true' : 'false'),
      },
      resources: {
        uniforms: {
          uResolution: { value: [this.app.canvas.width, this.app.canvas.height], type: 'vec2<f32>' },
          uTime: { value: performance.now()/1000, type: 'f32' },
          'uGraph.origin': { value: this.graph.origin.toArray(), type: 'vec2<f32>' },
          'uGraph.radius': { value: this.graph.radius, type: 'f32' },
          // uTexture: this.nessyTex
        },
      },
    });
  
    this.quad.shader = shader;

    // this.glmgr.updateGraphUniform();
  }

  setIter(i: number) {
    this.iter = i;
  }

  setRF(x: number) {
    this.resFactor = x;
  }

  setRM(m: RenderingMode) {
    this.renderingMode = m;
  }
}