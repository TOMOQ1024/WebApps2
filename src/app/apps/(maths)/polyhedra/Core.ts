import axios from "axios";
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Camera,
  DirectionalLight,
  Mesh,
  MeshLambertMaterial,
  Object3DEventMap,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  RawShaderMaterial,
  Scene,
  Texture,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons";

class H2T_Labels {
  private _A = 8;
  private _B = 3;
  private _C = 5;

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
    this._A = a;
    this.setUniforms();
  }
  set B(b) {
    this._B = b;
    this.setUniforms();
  }
  set C(c) {
    this._C = c;
    this.setUniforms();
  }

  setUniforms() {
    const ma = this.A;
    const mb = this.B;
    const mc = this.C;
    const cv = Math.sign(mb * mc + mc * ma + ma * mb - ma * mb * mc);
    this.parent.quad.material.uniforms.ma.value = ma;
    this.parent.quad.material.uniforms.mb.value = mb;
    this.parent.quad.material.uniforms.mc.value = mc;
    this.parent.quad.material.uniforms.cv.value = cv;
    this.parent.quad.material.uniforms.cr.value = 1 / Math.sqrt(Math.abs(cv));
    this.parent.quad.material.uniformsNeedUpdate = true;
    this.parent.loop();
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
  _iter: number = 1;
  get iter() {
    return this._iter;
  }
  set iter(s: number) {
    this._iter = s;
    this.updateShader();
    this.loop();
  }
  labels = new H2T_Labels(this);
  controls = true;
  ctrls: OrbitControls;

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
    // this.camera = new OrthographicCamera();
    this.camera.position.z = 1;

    this.renderer = new WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true,
    });
    // this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.ctrls = new OrbitControls(this.camera, this.renderer.domElement);
    const light = new DirectionalLight(0xffffff, 0.5);
    light.position.set(1, 2, 3).normalize();
    this.scene.add(light);
    this.scene.add(new AmbientLight(0xffffff, 0.3));
    // this.scene.add(new Mesh(new BoxGeometry(), new MeshLambertMaterial()));

    this.nessyTex = this.textureLoader.load(
      "/resources/compdynam/images/earth.jpg"
    );

    // this.quad = new Mesh(new PlaneGeometry(), new MeshBasicMaterial());
    this.quad = new Mesh(new PlaneGeometry(2, 2), new RawShaderMaterial());
    this.scene.add(this.camera);
    // this.scene.add(this.quad);
  }

  async init(beginLoop = true) {
    this.rawShaderData = await axios
      .get("/api/shaders/r2tiling")
      .then((res) => {
        return res.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

    this.quad.material.vertexShader = this.rawShaderData.vert;
    this.quad.material.fragmentShader = this.rawShaderData.frag;
    this.updateShader();
    this.quad.material.needsUpdate = true;
    // const t = h2t_generate_uniform(this.labels.A, this.labels.B, this.labels.C);
    const ma = this.labels.A;
    const mb = this.labels.B;
    const mc = this.labels.C;
    const cv = Math.sign(mb * mc + mc * ma + ma * mb - ma * mb * mc);
    this.quad.material.uniforms = {
      uResolution: {
        value: [this.cvs.width, this.cvs.height],
      },
      uTime: { value: performance.now() / 1000 },
      uTexture: {
        value: this.nessyTex,
      },
      // A: { value: t.A },
      // C: { value: t.C },
      // R: { value: t.R },
      ma: { value: ma },
      mb: { value: mb },
      mc: { value: mc },
      cv: { value: cv },
      cr: { value: 1 / Math.sqrt(Math.abs(cv)) },
    };
    this.quad.material.uniformsNeedUpdate = true;

    this.resizeCanvas();

    if (beginLoop) {
      this.beginLoop();
    } else {
      this.loop();
    }
  }

  resizeCanvas() {
    console.log("resize");
    const wrapper = this.cvs.parentElement;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(rect.width, rect.height, false);
    const width = rect.width; // またはcanvas.width
    const height = rect.height; // またはcanvas.height
    this.camera.left = width / -200;
    this.camera.right = width / 200;
    this.camera.top = height / 200;
    this.camera.bottom = height / -200;
    this.camera.near = 0;
    this.camera.far = 100;
    this.camera.updateProjectionMatrix();
    this.loop();
  }

  updateShader() {
    this.quad.material.fragmentShader = this.rawShaderData.frag.replace(
      "10./* input iteration limit here */",
      `${this.iter.toFixed(1)}`
    );
    this.quad.material.needsUpdate = true;
  }

  updateUniforms() {
    if (!this.quad.material.uniforms.uResolution) return;
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
    }, 1000 / 20);
  }

  endLoop() {
    if (!this.interval) return;
    clearInterval(this.interval);
  }

  loop() {
    this.updateUniforms();
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  }

  export() {
    return this.cvs.toDataURL();
  }

  createPolyhedron() {
    //
  }
}
