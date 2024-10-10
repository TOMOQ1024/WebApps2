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
      .get("/api/shaders/curved")
      .then((res) => {
        return res.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

    this.resizeCanvas();

    this.quad.material.vertexShader = this.rawShaderData.vert;
    this.quad.material.fragmentShader = this.rawShaderData.frag;
    this.quad.material.needsUpdate = true;
    this.quad.material.uniforms = {
      uResolution: {
        value: [this.cvs.width, this.cvs.height],
      },
      uTime: { value: performance.now() / 1000 },
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
    this.renderer.setSize(rect.width, rect.height, false);
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
