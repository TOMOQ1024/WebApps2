import GraphMgr from "@/src/GraphMgr";
import { Parse } from "@/src/parser-old/Main";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";
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
import { RenderingMode } from "./RenderingMode";

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
  graph = new GraphMgr();
  _error = "";
  _setError: Dispatch<SetStateAction<string>> = () => {};
  get error() {
    return this._error;
  }
  set error(e) {
    this._setError((this._error = e));
  }
  _iter: number = 100;
  get iter() {
    return this._iter;
  }
  set iter(s: number) {
    this._iter = s;
    this.updateShader();
  }
  z0: string = "c";
  _z0expr: string = "c";
  _setZ0Expr: Dispatch<SetStateAction<string>> = () => {};
  get z0expr() {
    return this._z0expr;
  }
  set z0expr(s: string) {
    const result = Parse(s, ["i", "c", "t"], "expr");
    let z0 = "";
    if (result.status) {
      try {
        z0 = result.root!.tocdgl();
      } catch (e) {
        this.error = `${e}`;
        console.error(e);
        return;
      }
      this.error = "";
      this.z0 = z0;
      this._z0expr = s; // this line will be deleted
      this._setZ0Expr(s);
      this.updateShader();
    } else {
      this.error = "parse failed";
    }
  }
  func: string = "z = csq(z) - vec2(.6, .42);";
  _funcexpr: string = "z^2-0.6-0.42i";
  _setFuncexpr: Dispatch<SetStateAction<string>> = () => {};
  get funcexpr() {
    return this._funcexpr;
  }
  set funcexpr(s: string) {
    const result = Parse(s, ["z", "i", "c", "t"], "expr");
    let f = "";
    if (result.status) {
      try {
        f = result.root!.tocdgl();
      } catch (e) {
        this.error = `${e}`;
        console.error(e);
        return;
      }
      this.error = "";
      this.func = f;
      this._funcexpr = s; // this line will be deleted
      this._setFuncexpr(s);
      this.updateShader();
    } else {
      this.error = "parse failed";
    }
  }
  private _renderingMode: RenderingMode = "hsv";
  get renderingMode() {
    return this._renderingMode;
  }
  set renderingMode(r) {
    this._renderingMode = r;
    this.updateShader();
  }
  nessyMode = false;
  pointers: {
    pointerId: number;
    clientX: number;
    clientY: number;
  }[] = [];
  controls = true;
  private _resolutionFactor = 1;
  get resolutionFactor() {
    return this._resolutionFactor;
  }
  set resolutionFactor(r) {
    this._resolutionFactor = r;
    this.resizeCanvas();
  }

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
      .get("/api/shaders/compdynam")
      .then((res) => {
        return res.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

    this.resizeCanvas();

    this.quad.material.vertexShader = this.rawShaderData.vert;
    this.updateShader();
    this.quad.material.uniforms = {
      uResolution: {
        value: [this.cvs.width, this.cvs.height],
      },
      uTime: { value: performance.now() / 1000 },
      uGraph: {
        value: {
          origin: this.graph.origin.toArray(),
          radius: this.graph.radius,
        },
      },
      uTexture: {
        value: this.nessyTex,
      },
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
    this.renderer.setSize(
      rect.width * this.resolutionFactor,
      rect.height * this.resolutionFactor,
      false
    );
  }

  updateUniforms() {
    this.quad.material.uniforms.uResolution.value = [
      this.cvs.width,
      this.cvs.height,
    ];
    this.quad.material.uniforms.uTime.value = performance.now() / 1000;
    this.quad.material.uniforms.uGraph.value = {
      origin: this.graph.origin.toArray(),
      radius: this.graph.radius,
    };
    this.quad.material.uniforms.uTexture.value = this.nessyTex;

    this.quad.material.uniformsNeedUpdate = true;
  }

  updateShader() {
    this.quad.material.fragmentShader = this.rawShaderData.frag
      .replace("z/* input func here */", this.func)
      .replace("1/* input iter here */", `${this.iter}`)
      .replace("c/* input z0 here */", `${this.z0}`)
      .replace(
        "/* delete if mode is not grayscale */",
        this.renderingMode !== "grayscale" ? "//" : ""
      )
      .replace(
        "/* delete if mode is not hsv */",
        this.renderingMode !== "hsv" ? "//" : ""
      )
      .replace(
        "false/* input boolean of nessy here */",
        this.nessyMode ? "true" : "false"
      );
    this.quad.material.needsUpdate = true;
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
