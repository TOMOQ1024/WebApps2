import axios from "axios";
import {
  AmbientLight,
  BufferGeometry,
  CullFaceBack,
  DirectionalLight,
  DoubleSide,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  RawShaderMaterial,
  Scene,
  WebGLRenderer,
} from "three";
import {
  GLTFExporter,
  OrbitControls,
  VRButton,
} from "three/examples/jsm/Addons";
import { CreatePolychoronGeometry } from "./Geometry";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";
import { vertexShader } from "../Shaders/VertexShader";
import { fragmentShader } from "../Shaders/FragmentShader";

export default class Core {
  cvs: HTMLCanvasElement;
  interval: NodeJS.Timeout | null = null;
  renderer: WebGLRenderer;
  camera: OrthographicCamera;
  vrCamera: PerspectiveCamera;
  scene: Scene;
  isVRMode: boolean = false;
  vrButton: HTMLElement | null = null;
  diagram = new CoxeterDynkinDiagram(
    {
      ab: [2, 1],
      ba: [2, 1],
      bc: [3, 1],
      cb: [3, 1],
      cd: [3, 1],
      dc: [3, 1],
      ad: [3, 1],
      da: [3, 1],
      ac: [2, 1],
      ca: [2, 1],
      bd: [2, 1],
      db: [2, 1],
    },
    {
      a: "x",
      b: "x",
      c: "x",
      d: "x",
    }
  );
  ctrls: OrbitControls;
  mesh: LineSegments | Mesh | null = null;
  buildTime: number = 0;
  material = new RawShaderMaterial({
    side: DoubleSide,
    // side: CullFaceBack,
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
  isCompiled = false;

  constructor(cvs: HTMLCanvasElement | undefined = undefined) {
    if (cvs) {
      this.cvs = cvs;
    } else {
      this.cvs = document.createElement("canvas") as HTMLCanvasElement;
      this.cvs.width = 200;
      this.cvs.height = 200;
    }
    this.scene = new Scene();

    // OrthographicCameraをデフォルトに設定
    this.camera = new OrthographicCamera();
    this.camera.position.z = 1;

    // VR用のPerspectiveCamera
    this.vrCamera = new PerspectiveCamera(75, 1, 0.1, 1000);
    this.vrCamera.position.set(0, 0, 5);

    this.renderer = new WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true,
    });

    // WebXRを有効化
    this.renderer.xr.enabled = true;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.ctrls = new OrbitControls(this.camera, this.renderer.domElement);
    const light = new DirectionalLight(0xffffff, 0.5);
    light.position.set(1, 2, 3).normalize();
    this.scene.add(light);
    this.scene.add(new AmbientLight(0xffffff, 0.3));
    // this.scene.add(new AxesHelper(10));

    this.scene.add(this.camera);
    this.scene.add(this.vrCamera);
    this.isCompiled = true;

    // VRButtonを作成して一時的に保存（後で表示させる）
    this.vrButton = VRButton.createButton(this.renderer);
    this.vrButton.style.display = "none"; // 最初は非表示
  }

  init(beginLoop = true) {
    this.resizeCanvas();

    if (beginLoop) {
      this.beginLoop();
    } else {
      this.loop(0);
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
    const angle = 100;
    this.camera.left = width / -2 / angle;
    this.camera.right = width / 2 / angle;
    this.camera.top = height / 2 / angle;
    this.camera.bottom = height / -2 / angle;
    this.camera.near = -angle;
    this.camera.far = angle;
    this.camera.updateProjectionMatrix();
    this.loop(0);
  }

  beginLoop() {
    this.setPolychoron();

    if (this.renderer.xr.isPresenting) {
      // WebXRモードではレンダラーのアニメーションループを使用
      this.renderer.setAnimationLoop((time) => {
        this.loop(1 / 90); // WebXRは90fpsを目指す
      });
    } else {
      // 通常モード
      this.interval = setInterval(() => {
        this.loop(1 / 20);
      }, 1000 / 20);
    }
  }

  endLoop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.renderer.xr.isPresenting) {
      this.renderer.setAnimationLoop(null);
    }
  }

  loop(deltaTime: number) {
    // console.log("loop");
    if (this.renderer && this.isCompiled) {
      const currentCamera = this.isVRMode ? this.vrCamera : this.camera;
      this.renderer.render(this.scene, currentCamera);
    }
    this.material.uniforms.time.value += deltaTime;
  }

  // メッシュをglbとしてエクスポート
  downloadGLB() {
    if (!this.mesh) return;
    const exporter = new GLTFExporter();
    const scene = new Scene();
    const mesh = this.mesh.clone();
    mesh.material = new MeshBasicMaterial({ color: 0xffffff });
    scene.add(mesh);
    exporter.parse(
      scene,
      (gltf: ArrayBuffer | { [key: string]: unknown }) => {
        if (gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: "model/gltf-binary" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "model.glb";
          a.click();
          URL.revokeObjectURL(url);
        } else {
          console.error(
            "GLBのエクスポートに失敗しました: 不正なデータ形式です"
          );
        }
      },
      (error: ErrorEvent) => {
        console.error("GLBのエクスポートに失敗しました:", error.message);
      },
      { binary: true }
    );
  }

  setPolychoron() {
    console.clear();
    const startTime = performance.now();
    const geometry = CreatePolychoronGeometry(this.diagram, false);
    const endTime = performance.now();
    const buildTime = endTime - startTime;
    this.buildTime = buildTime;
    if (this.mesh) {
      this.mesh.geometry = geometry;
    } else {
      this.mesh = new Mesh(geometry, this.material);
      this.scene.add(this.mesh);
    }
  }

  // WebXRのVRモードを開始/停止
  async toggleVRMode(): Promise<void> {
    if (!this.renderer.xr.isPresenting) {
      // VRモードを開始
      try {
        // Mixed Reality (passthrough)をリクエスト
        const session = await navigator.xr?.requestSession("immersive-vr", {
          requiredFeatures: ["local-floor"],
          optionalFeatures: ["mixed-reality-passthrough"],
        });

        if (session) {
          // セッションイベントハンドラーを設定
          session.addEventListener("end", () => {
            this.isVRMode = false;
            this.restoreNormalMode();
            console.log("VRセッションが終了しました");
          });

          await this.renderer.xr.setSession(session);
          this.isVRMode = true;

          // パススルーモードを有効化（対応している場合）
          await this.enablePassthrough(session);

          // VRモード用にカメラを調整
          this.vrCamera.aspect = window.innerWidth / window.innerHeight;
          this.vrCamera.updateProjectionMatrix();

          console.log("VRモードを開始しました");
        }
      } catch (error) {
        console.error("VRモードの開始に失敗しました:", error);
      }
    } else {
      // VRモードを停止
      await this.renderer.xr.getSession()?.end();
      this.isVRMode = false;
      this.restoreNormalMode();
      console.log("VRモードを終了しました");
    }
  }

  // パススルーモードを有効化
  private async enablePassthrough(session: any): Promise<void> {
    try {
      // パススルー機能の確認と有効化
      if ("requestPassthrough" in session) {
        await session.requestPassthrough();
        console.log("パススルーモードを有効化しました");

        // 背景を透明にしてパススルーを見えるようにする
        this.scene.background = null;

        // マテリアルの透明度を調整（多胞体を半透明にして現実世界と重ねる）
        this.material.transparent = true;
        this.material.opacity = 0.8;
      } else if (
        "environmentBlendMode" in session &&
        session.environmentBlendMode === "additive"
      ) {
        console.log("Additive blending パススルーモードが利用可能です");
        this.scene.background = null;
      } else {
        console.log(
          "パススルーモードは利用できませんが、VRモードは正常に動作します"
        );
      }
    } catch (error) {
      console.log(
        "パススルーモードの有効化に失敗しましたが、VRモードは継続されます:",
        error
      );
    }
  }

  // 通常モードに戻す
  private restoreNormalMode(): void {
    // 背景を元に戻す（必要に応じて）
    // this.scene.background = new THREE.Color(0x000000);

    // マテリアルの透明度を元に戻す
    this.material.transparent = false;
    this.material.opacity = 1.0;

    console.log("通常モードに戻しました");
  }

  // WebXRの可用性をチェック
  async checkWebXRSupport(): Promise<boolean> {
    if ("xr" in navigator) {
      try {
        const supported = await navigator.xr?.isSessionSupported(
          "immersive-vr"
        );
        return supported || false;
      } catch {
        return false;
      }
    }
    return false;
  }
}
