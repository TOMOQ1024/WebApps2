import GraphMgr from "@/src/GraphMgr";
import { Parse } from "@/src/parser/Main";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import {
  AxesHelper,
  BoxGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Object3DEventMap,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  Scene,
  Texture,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons";
import { RenderingMode } from "./RenderingMode";

export default class Core {
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
  controls: OrbitControls;
  _error = "";
  _setError: Dispatch<SetStateAction<string>> = () => {};
  get error() {
    return this._error;
  }
  set error(e) {
    this._setError((this._error = e));
  }
  iter: number = 100;
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
  renderingMode: RenderingMode = RenderingMode.HSV;
  nessyMode = false;

  constructor(
    public cvs = document.getElementById("cvs") as HTMLCanvasElement
  ) {
    this.scene = new Scene();
    this.camera = new OrthographicCamera();
    this.camera.position.z = 1;

    this.renderer = new WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    this.nessyTex = this.textureLoader.load(
      "/resources/compdynam/images/earth.jpg"
    );

    // this.quad = new Mesh(new PlaneGeometry(), new MeshBasicMaterial());
    this.quad = new Mesh(new PlaneGeometry(2, 2), new RawShaderMaterial());
    this.scene.add(this.camera);
    this.scene.add(this.quad);
    this.scene.add(
      new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshBasicMaterial())
    );

    const axesHelper = new AxesHelper(5);
    this.scene.add(axesHelper);
  }

  async init() {
    this.rawShaderData = await axios
      .get("/api/shaders/compdynam")
      .then((res) => {
        return res.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

    this.quad.material.vertexShader = this.rawShaderData.vert;
    this.updateShader();
    this.updateUniforms();

    this.beginLoop();
  }

  updateUniforms() {
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
    this.quad.material.needsUpdate = true;
  }

  updateShader() {
    this.quad.material.fragmentShader = this.rawShaderData.frag
      .replace("z/* input func here */", this.func)
      .replace("1/* input iter here */", `${this.iter}`)
      .replace("c/* input z0 here */", `${this.z0}`)
      .replace(
        "/* delete if mode is not grayscale */",
        this.renderingMode !== RenderingMode.GRAYSCALE ? "//" : ""
      )
      .replace(
        "/* delete if mode is not hsv */",
        this.renderingMode !== RenderingMode.HSV ? "//" : ""
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
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
