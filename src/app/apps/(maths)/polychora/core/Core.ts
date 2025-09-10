import axios from "axios";
import {
  AmbientLight,
  BufferGeometry,
  CullFaceBack,
  DirectionalLight,
  DoubleSide,
  Group,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Matrix4,
  OrthographicCamera,
  Object3D,
  PerspectiveCamera,
  RawShaderMaterial,
  Scene,
  Quaternion,
  Vector3,
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
  polyGroup: Group = new Group();

  // 片手/両手掴み用の状態
  controllerStates: {
    [index: number]:
      | {
          grabbing: boolean;
          offsetMatrix: Matrix4; // controller^-1 * polyWorld
        }
      | undefined;
  } = {};
  twoHandInitial: {
    aIndex: number;
    bIndex: number;
    midpoint0: Vector3;
    abDir0: Vector3;
    abLen0: number;
    polyWorld0: Matrix4;
  } | null = null;
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
    this.vrCamera = new PerspectiveCamera(75, 1, 0.01, 1000);
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
    // ライティング（見た目に必要最低限。オブジェクトは多胞体とコントローラのみ）
    this.scene.add(new AmbientLight());
    // this.scene.add(new AxesHelper(10));

    this.scene.add(this.camera);
    this.scene.add(this.vrCamera);
    this.scene.add(this.polyGroup);
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

  // 多胞体の位置・回転・スケールを初期化
  resetPolyTransform(): void {
    // 現在のモードに応じた初期位置
    const initialZ = this.isVRMode ? -2 : 0;
    this.polyGroup.position.set(0, 0, initialZ);
    this.polyGroup.quaternion.identity();
    this.polyGroup.scale.set(1, 1, 1);

    // 掴み状態をクリア
    this.controllerStates = {};
    this.twoHandInitial = null;
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
      this.polyGroup.add(this.mesh);
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
    const controller: Object3D = event.target;
    const index = this.vrControllers.indexOf(controller);
    if (index === -1) return;

    // 近接チェック（任意）：コントローラが多胞体に近い時のみ掴む
    const grip: Object3D = this.controllerGrips[index];
    // const controllerPos = new Vector3();
    // controllerPos.setFromMatrixPosition(grip.matrixWorld);
    // const polyPos = new Vector3();
    // polyPos.setFromMatrixPosition(this.polyGroup.matrixWorld);
    // const distance = controllerPos.distanceTo(polyPos);
    // const maxGrabDistance = 1.0; // 1m以内なら掴める
    // if (distance > maxGrabDistance) return;

    // 片手掴み開始
    const offsetMatrix = new Matrix4()
      .copy(grip.matrixWorld)
      .invert()
      .multiply(this.polyGroup.matrixWorld.clone());

    this.controllerStates[index] = {
      grabbing: true,
      offsetMatrix,
    };

    // 両手掴みの初期化
    const grabbingIndices = Object.keys(this.controllerStates)
      .map((k) => +k)
      .filter((i) => this.controllerStates[i]?.grabbing);
    if (grabbingIndices.length === 2) {
      const aIndex = grabbingIndices[0];
      const bIndex = grabbingIndices[1];
      const gripA = this.controllerGrips[aIndex];
      const gripB = this.controllerGrips[bIndex];
      const posA0 = new Vector3().setFromMatrixPosition(gripA.matrixWorld);
      const posB0 = new Vector3().setFromMatrixPosition(gripB.matrixWorld);
      const ab0 = new Vector3().subVectors(posB0, posA0);
      const midpoint0 = new Vector3()
        .addVectors(posA0, posB0)
        .multiplyScalar(0.5);

      this.twoHandInitial = {
        aIndex,
        bIndex,
        midpoint0,
        abDir0: ab0.clone().normalize(),
        abLen0: Math.max(ab0.length(), 1e-6),
        polyWorld0: this.polyGroup.matrixWorld.clone(),
      };
    }
  }

  private onSelectEnd(event: any): void {
    const controller: Object3D = event.target;
    const index = this.vrControllers.indexOf(controller);
    if (index === -1) return;

    if (this.controllerStates[index]) {
      this.controllerStates[index]!.grabbing = false;
    }

    // 両手掴み解除時に片手掴みへスムーズに移行できるよう再計算
    const grabbingIndices = Object.keys(this.controllerStates)
      .map((k) => +k)
      .filter((i) => this.controllerStates[i]?.grabbing);
    if (grabbingIndices.length === 1) {
      const i = grabbingIndices[0];
      const grip = this.controllerGrips[i];
      const offsetMatrix = new Matrix4()
        .copy(grip.matrixWorld)
        .invert()
        .multiply(this.polyGroup.matrixWorld.clone());
      this.controllerStates[i] = { grabbing: true, offsetMatrix };
    }

    // 0本になったら初期状態に戻す
    if (grabbingIndices.length === 0) {
      this.twoHandInitial = null;
    }
  }

  // VRコントローラを更新
  private updateVRControllers(): void {
    // 掴んでいる本数に応じて変換
    const grabbingIndices = Object.keys(this.controllerStates)
      .map((k) => +k)
      .filter((i) => this.controllerStates[i]?.grabbing);

    if (grabbingIndices.length === 1) {
      // 片手掴み：コントローラ姿勢に追従
      const i = grabbingIndices[0];
      const grip: Object3D = this.controllerGrips[i];
      const state = this.controllerStates[i]!;
      const newPolyWorld = new Matrix4()
        .copy(grip.matrixWorld)
        .multiply(state.offsetMatrix);
      this.applyWorldMatrixToGroup(this.polyGroup, newPolyWorld);
    }

    if (grabbingIndices.length === 2 && this.twoHandInitial) {
      // 両手掴み：スケール + 回転（AB方向合わせ） + 並進（中点合わせ）
      const { aIndex, bIndex, midpoint0, abDir0, abLen0, polyWorld0 } =
        this.twoHandInitial;
      const gripA = this.controllerGrips[aIndex];
      const gripB = this.controllerGrips[bIndex];
      const posA1 = new Vector3().setFromMatrixPosition(gripA.matrixWorld);
      const posB1 = new Vector3().setFromMatrixPosition(gripB.matrixWorld);
      const ab1 = new Vector3().subVectors(posB1, posA1);
      const midpoint1 = new Vector3()
        .addVectors(posA1, posB1)
        .multiplyScalar(0.5);

      const dir1 = ab1.clone().normalize();
      const scale = Math.max(ab1.length() / abLen0, 1e-6);
      const qRot = new Quaternion().setFromUnitVectors(abDir0, dir1);

      const T1 = new Matrix4().makeTranslation(
        midpoint1.x,
        midpoint1.y,
        midpoint1.z
      );
      const R = new Matrix4().makeRotationFromQuaternion(qRot);
      const S = new Matrix4().makeScale(scale, scale, scale);
      const T0inv = new Matrix4().makeTranslation(
        -midpoint0.x,
        -midpoint0.y,
        -midpoint0.z
      );

      const m = new Matrix4()
        .multiply(T1)
        .multiply(R)
        .multiply(S)
        .multiply(T0inv)
        .multiply(polyWorld0.clone());

      this.applyWorldMatrixToGroup(this.polyGroup, m);
    }
  }

  // Groupにワールド行列を適用（position/rotation/scaleへ分解）
  private applyWorldMatrixToGroup(group: Group, world: Matrix4): void {
    const pos = new Vector3();
    const quat = new Quaternion();
    const scl = new Vector3();
    world.decompose(pos, quat, scl);
    group.position.copy(pos);
    group.quaternion.copy(quat);
    group.scale.copy(scl);
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

          // VRモードでは多胞体グループをユーザー前方に配置
          this.polyGroup.position.set(0, 0, -2);

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
