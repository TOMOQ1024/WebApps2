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
  VideoTexture,
  WebGLRenderer,
} from "three";
import { generateUniform } from "./Math";

export default class Core {
  cvs: HTMLCanvasElement;
  renderer: WebGLRenderer;
  camera: OrthographicCamera;
  scene: Scene;
  textureLoader = new TextureLoader();
  // quad: Mesh;
  quad: Mesh<PlaneGeometry, RawShaderMaterial, Object3DEventMap>;
  videoTex: Texture;
  rawShaderData = {
    vert: "",
    frag: "",
  };
  _iter: number = 10;
  get iter() {
    return this._iter;
  }
  set iter(s: number) {
    this._iter = s;
    this.updateShader();
  }
  ma = 2;
  mb = 3;
  mc = 6;

  loopFlag = false;

  controls = true;

  video: HTMLVideoElement;

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

    this.video = document.querySelector("#vid") as HTMLVideoElement;
    console.log(this.video);
    this.videoTex = new VideoTexture(this.video);
    // this.videoTex = this.textureLoader.load(
    //   "/resources/compdynam/images/earth.jpg"
    // );

    // this.quad = new Mesh(new PlaneGeometry(), new MeshBasicMaterial());
    this.quad = new Mesh(new PlaneGeometry(2, 2), new RawShaderMaterial());
    this.scene.add(this.camera);
    this.scene.add(this.quad);
  }

  async init(beginLoop = true) {
    this.rawShaderData = await axios
      .get("/api/shaders/kaleidoscope")
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

    const t = generateUniform(this.ma, this.mb, this.mc);
    this.quad.material.uniforms = {
      uResolution: {
        value: [this.cvs.width, this.cvs.height],
      },
      uTime: { value: performance.now() / 1000 },
      uTexture: {
        value: this.videoTex,
      },
    };
    for (let u in t) {
      this.quad.material.uniforms[u] = { value: t[u] };
    }
    this.quad.material.uniformsNeedUpdate = true;

    if (beginLoop) {
      this.loopFlag = true;
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
    console.log("a");
    this.quad.material.uniforms.uResolution.value = [
      this.cvs.width,
      this.cvs.height,
    ];
    this.quad.material.uniforms.uTime.value = performance.now() / 1000;
    // this.quad.material.uniforms.uTexture.value = this.videoTex;

    const t = generateUniform(this.ma, this.mb, this.mc);
    for (let u in t) {
      this.quad.material.uniforms[u].value = t[u];
    }

    this.quad.material.uniformsNeedUpdate = true;
  }

  beginLoop() {
    if (!this.loopFlag) return;
    this.loop();
  }

  endLoop() {
    this.loopFlag = false;
  }

  loop() {
    this.updateUniforms();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => {
      this.loop();
    });
  }

  enableVideo() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = {
        video: { width: 1280, height: 720, facingMode: "user" },
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(
          ((stream: MediaStream) => {
            // apply the stream to the video element used in the texture

            this.video.srcObject = stream;
            this.video.play();
          }).bind(this)
        )
        .catch(function (error) {
          console.error("Unable to access the camera/webcam.", error);
        });
    } else {
      console.error("MediaDevices interface not available.");
    }
  }

  export() {
    return this.cvs.toDataURL();
  }
}
