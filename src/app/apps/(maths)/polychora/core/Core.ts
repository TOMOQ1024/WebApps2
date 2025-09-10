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
  XRControllerModelFactory,
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
  vrControllers: any[] = [];
  controllerGrips: any[] = [];
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
    this.vrCamera.position.set(0, 1.6, 3); // 人間の目線の高さ(1.6m)と適切な距離

    this.renderer = new WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true,
    });

    // WebXRを有効化
    this.renderer.xr.enabled = true;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.ctrls = new OrbitControls(this.camera, this.renderer.domElement);
    // 強いライティングを設定（VRモードでも良く見えるように）
    const light = new DirectionalLight(0xffffff, 1.0);
    light.position.set(5, 10, 5);
    this.scene.add(light);

    const light2 = new DirectionalLight(0xffffff, 0.8);
    light2.position.set(-5, 5, -5);
    this.scene.add(light2);

    this.scene.add(new AmbientLight(0xffffff, 0.6));
    // this.scene.add(new AxesHelper(10));

    this.scene.add(this.camera);
    this.scene.add(this.vrCamera);
    this.isCompiled = true;

    // VRButtonを作成して一時的に保存（後で表示させる）
    this.vrButton = VRButton.createButton(this.renderer);
    this.vrButton.style.display = "none"; // 最初は非表示

    // VRコントローラを初期化
    this.initVRControllers();
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

    // WebXRモードと通常モード共通のアニメーションループを設定
    this.renderer.setAnimationLoop((time) => {
      if (this.renderer.xr.isPresenting) {
        // VRモード: より高いフレームレート
        this.loop(time / 1000);
        this.updateVRControllers();
      } else {
        // 通常モード
        this.loop(1 / 60);
      }
    });
  }

  endLoop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    // アニメーションループを停止
    this.renderer.setAnimationLoop(null);
  }

  loop(deltaTime: number) {
    // console.log("loop");
    if (this.renderer && this.isCompiled) {
      const currentCamera = this.isVRMode ? this.vrCamera : this.camera;
      this.renderer.render(this.scene, currentCamera);

      // VRモードでのデバッグ情報
      if (this.isVRMode && this.renderer.xr.isPresenting) {
        // console.log("VR rendering...", currentCamera.position);
      }
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
      // メッシュを適切なサイズにスケール
      this.mesh.scale.set(0.5, 0.5, 0.5);
      this.scene.add(this.mesh);
    }
  }

  // VRコントローラを初期化
  private initVRControllers(): void {
    const controllerModelFactory = new XRControllerModelFactory();

    // コントローラー1
    const controller1 = this.renderer.xr.getController(0);
    controller1.addEventListener("selectstart", this.onSelectStart.bind(this));
    controller1.addEventListener("selectend", this.onSelectEnd.bind(this));
    this.scene.add(controller1);
    this.vrControllers.push(controller1);

    const controllerGrip1 = this.renderer.xr.getControllerGrip(0);
    controllerGrip1.add(
      controllerModelFactory.createControllerModel(controllerGrip1)
    );
    this.scene.add(controllerGrip1);
    this.controllerGrips.push(controllerGrip1);

    // コントローラー2
    const controller2 = this.renderer.xr.getController(1);
    controller2.addEventListener("selectstart", this.onSelectStart.bind(this));
    controller2.addEventListener("selectend", this.onSelectEnd.bind(this));
    this.scene.add(controller2);
    this.vrControllers.push(controller2);

    const controllerGrip2 = this.renderer.xr.getControllerGrip(1);
    controllerGrip2.add(
      controllerModelFactory.createControllerModel(controllerGrip2)
    );
    this.scene.add(controllerGrip2);
    this.controllerGrips.push(controllerGrip2);
  }

  // コントローラのイベントハンドラ
  private onSelectStart(event: any): void {
    console.log("Controller select start");
  }

  private onSelectEnd(event: any): void {
    console.log("Controller select end");
  }

  // VRコントローラを更新
  private updateVRControllers(): void {
    // コントローラの状態を更新する処理が必要な場合はここに記述
    // 例: コントローラの位置や向きに基づいた処理
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

          // VRモードではメッシュを適切な位置に配置
          if (this.mesh) {
            this.mesh.position.set(0, 0, -2); // ユーザーの前方に配置
          }

          // デバッグ用の参考オブジェクトを追加
          this.addDebugObjects();

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

  // デバッグ用の参考オブジェクトを追加
  private addDebugObjects(): void {
    // 座標軸を表示（デバッグ用）
    const { AxesHelper } = require("three");
    const axesHelper = new AxesHelper(1);
    axesHelper.position.set(0, 0, -1);
    this.scene.add(axesHelper);

    // 基準キューブを追加（サイズ感の参考用）
    const { BoxGeometry, MeshBasicMaterial } = require("three");
    const cubeGeometry = new BoxGeometry(0.1, 0.1, 0.1);
    const cubeMaterial = new MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    const cube = new Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0.5, 0, -1.5);
    this.scene.add(cube);
  }

  // 通常モードに戻す
  private restoreNormalMode(): void {
    // 背景を元に戻す（必要に応じて）
    // this.scene.background = new THREE.Color(0x000000);

    // マテリアルの透明度を元に戻す
    this.material.transparent = false;
    this.material.opacity = 1.0;

    // メッシュの位置を元に戻す
    if (this.mesh) {
      this.mesh.position.set(0, 0, 0);
    }

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
