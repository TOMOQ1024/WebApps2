import axios from "axios";
import {
  Mesh,
  Object3DEventMap,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  Scene,
  Texture,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { h2t_generate_uniform } from "./Math";

class H2T_Labels {
  private _A = 2;
  private _B = 3;
  private _C = 7;

  constructor(public parent: Core) {}

  get A() {
    return this._A;
  }
  get B() {
    return this._B;
  }
  get C() {
    return this._C;
  }
  set A(a) {
    if ((this.B * this.C + this.C * a + a * this.B) / a / this.B / this.C >= 1)
      return;
    this._A = a;
    this.setUniforms();
  }
  set B(b) {
    if ((b * this.C + this.C * this.A + this.A * b) / this.A / b / this.C >= 1)
      return;
    this._B = b;
    this.setUniforms();
  }
  set C(c) {
    if ((this.B * c + c * this.A + this.A * this.B) / this.A / this.B / c >= 1)
      return;
    this._C = c;
    this.setUniforms();
  }

  setUniforms() {
    const t = h2t_generate_uniform(this.A, this.B, this.C);
    this.parent.quad.material.uniforms.A.value = t.A;
    this.parent.quad.material.uniforms.C.value = t.C;
    this.parent.quad.material.uniforms.R.value = t.R;
    this.parent.quad.material.uniformsNeedUpdate = true;
  }
}
export default class Core {
  cvs: HTMLCanvasElement;
  interval: NodeJS.Timeout | null = null;
  renderer: WebGLRenderer;
  camera: OrthographicCamera;
  scene: Scene;
  textureLoader = new TextureLoader();
  // quad: Mesh;
  quad: Mesh<PlaneGeometry, RawShaderMaterial, Object3DEventMap>;
  nessyTex: Texture;
  rawShaderData = {
    vert: "",
    frag: "",
  };
  _iter: number = 100;
  get iter() {
    return this._iter;
  }
  set iter(s: number) {
    this._iter = s;
    this.updateShader();
  }
  labels = new H2T_Labels(this);
  controls = true;

  constructor(cvs: HTMLCanvasElement | undefined = undefined) {
    if (cvs) {
      this.cvs = cvs;
    } else {
      this.cvs = document.createElement("canvas") as HTMLCanvasElement;
      this.cvs.width = 200;
      this.cvs.height = 200;
    }
    this.scene = new Scene();
    this.camera = new OrthographicCamera();
    this.camera.position.z = 1;

    this.renderer = new WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true,
    });
    // this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);

    this.nessyTex = this.textureLoader.load(
      "/resources/compdynam/images/earth.jpg"
    );

    // this.quad = new Mesh(new PlaneGeometry(), new MeshBasicMaterial());
    this.quad = new Mesh(new PlaneGeometry(2, 2), new RawShaderMaterial());
    this.scene.add(this.camera);
    this.scene.add(this.quad);
  }

  async init(beginLoop = true) {
    this.rawShaderData = await axios
      .get("/api/shaders/h2tiling")
      .then((res) => {
        return res.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

    this.resizeCanvas();

    this.quad.material.vertexShader = this.rawShaderData.vert;
    this.quad.material.fragmentShader = this.rawShaderData.frag;
    this.updateShader();
    this.quad.material.needsUpdate = true;
    const t = h2t_generate_uniform(this.labels.A, this.labels.B, this.labels.C);
    this.quad.material.uniforms = {
      uResolution: {
        value: [this.cvs.width, this.cvs.height],
      },
      uTime: { value: performance.now() / 1000 },
      uTexture: {
        value: this.nessyTex,
      },
      A: { value: t.A },
      C: { value: t.C },
      R: { value: t.R },
    };
    this.quad.material.uniformsNeedUpdate = true;

    if (beginLoop) {
      this.beginLoop();
    }
  }

  resizeCanvas() {
    const wrapper = this.cvs.parentElement;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height, false);
  }

  updateShader() {
    this.quad.material.fragmentShader = this.rawShaderData.frag.replace(
      "10./* input iteration limit here */",
      `${this.iter.toFixed(1)}`
    );
    this.quad.material.needsUpdate = true;
  }

  updateUniforms() {
    this.quad.material.uniforms.uResolution.value = [
      this.cvs.width,
      this.cvs.height,
    ];
    this.quad.material.uniforms.uTime.value = performance.now() / 1000;
    this.quad.material.uniforms.uTexture.value = this.nessyTex;

    this.quad.material.uniformsNeedUpdate = true;
  }

  beginLoop() {
    this.interval = setInterval(() => {
      this.loop();
    }, 1000 / 60);
  }

  endLoop() {
    if (!this.interval) return;
    clearInterval(this.interval);
  }

  loop() {
    this.updateUniforms();
    this.renderer.render(this.scene, this.camera);
  }

  export() {
    return this.cvs.toDataURL();
  }
}
