import * as THREE from "three";
import GraphMgr from "@/src/GraphMgr";

export interface CanvasManagerOptions {
  container: HTMLDivElement;
  resolution: THREE.Vector2;
  onGraphChange?: (graph: GraphMgr) => void;
  graphManager?: GraphMgr;
  onResolutionChange?: (resolution: THREE.Vector2) => void;
}

export class CanvasManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private graphManager: GraphMgr | undefined;
  private pointers: { pointerId: number; clientX: number; clientY: number }[] =
    [];
  private animationFrameId: number = 0;
  private onGraphChange?: (graph: GraphMgr) => void;
  private onResolutionChange?: (resolution: THREE.Vector2) => void;
  private boundHandleResize: () => void;
  private boundHandlePointerDown: (e: PointerEvent) => void;
  private boundHandlePointerMove: (e: PointerEvent) => void;
  private boundHandlePointerUp: (e: PointerEvent) => void;
  private boundHandleWheel: (e: WheelEvent) => void;

  constructor(options: CanvasManagerOptions) {
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
      -options.resolution.x,
      options.resolution.x,
      options.resolution.y,
      -options.resolution.y,
      0.1,
      10
    );
    this.graphManager = options.graphManager;
    this.onGraphChange = options.onGraphChange;
    this.onResolutionChange = options.onResolutionChange;

    this.renderer.setSize(options.resolution.x, options.resolution.y);
    options.container.appendChild(this.renderer.domElement);
    this.camera.position.z = 1;

    // イベントハンドラを事前にバインド
    this.boundHandleResize = this.handleResize.bind(this);
    this.boundHandlePointerDown = this.handlePointerDown.bind(this);
    this.boundHandlePointerMove = this.handlePointerMove.bind(this);
    this.boundHandlePointerUp = this.handlePointerUp.bind(this);
    this.boundHandleWheel = this.handleWheel.bind(this);

    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener("resize", this.boundHandleResize);
    if (!this.graphManager) return;

    // タッチイベントの設定を改善
    this.renderer.domElement.addEventListener(
      "pointerdown",
      this.boundHandlePointerDown,
      {
        passive: false,
        capture: true, // キャプチャフェーズでイベントを取得
      }
    );
    this.renderer.domElement.addEventListener(
      "pointermove",
      this.boundHandlePointerMove,
      {
        passive: false,
        capture: true,
      }
    );
    this.renderer.domElement.addEventListener(
      "pointerup",
      this.boundHandlePointerUp,
      {
        passive: false,
        capture: true,
      }
    );
    this.renderer.domElement.addEventListener("wheel", this.boundHandleWheel, {
      passive: false,
    });

    // タッチイベントも明示的に処理
    this.renderer.domElement.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
      },
      { passive: false, capture: true }
    );

    this.renderer.domElement.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false, capture: true }
    );

    this.renderer.domElement.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
      },
      { passive: false, capture: true }
    );
  }

  private handlePointerDown(e: PointerEvent) {
    if (!this.graphManager) return;

    // タッチ操作とマウス操作の両方に対応
    e.preventDefault();
    e.stopPropagation();

    if (e.button === 2) return; // 右クリックは無視

    // ポインターキャプチャを設定
    this.renderer.domElement.setPointerCapture(e.pointerId);

    this.pointers.push({
      pointerId: e.pointerId,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  }

  private handlePointerMove(e: PointerEvent) {
    if (!this.graphManager) return;
    e.preventDefault();
    const rect = this.renderer.domElement.getBoundingClientRect();
    const m = Math.min(rect.width, rect.height);
    const pidx = this.pointers.findIndex((p) => p.pointerId === e.pointerId);
    const p = this.pointers[pidx] ?? e;
    const c = this.pointers;

    switch (c.length) {
      case 0:
        return;
      case 1:
        const delta = new THREE.Vector2(
          (2 * (e.clientX - p.clientX)) / m,
          (2 * (p.clientY - e.clientY)) / m
        );
        this.graphManager.translate(delta.negate());
        this.onGraphChange?.(this.graphManager);
        break;
      default:
        const C0 = pidx === 0 ? e : c[0];
        const C1 = pidx === 1 ? e : c[1];
        const pOri = new THREE.Vector2(
          (((c[1].clientX + c[0].clientX) / rect.width - 1) * rect.width) / m,
          (((c[1].clientY + c[0].clientY) / rect.height - 1) * rect.height) / m
        );
        const dOri = new THREE.Vector2(
          (((C1.clientX + C0.clientX) / rect.width - 1) * rect.width) / m,
          (((C1.clientY + C0.clientY) / rect.height - 1) * rect.height) / m
        )
          .sub(pOri)
          .multiply({ x: 1, y: -1 });
        const pDelta = Math.hypot(
          (2 * (c[1].clientX - c[0].clientX)) / m,
          (2 * (c[1].clientY - c[0].clientY)) / m
        );
        const nDelta = Math.hypot(
          (2 * (C1.clientX - C0.clientX)) / m,
          (2 * (C1.clientY - C0.clientY)) / m
        );
        this.graphManager.translate(dOri.negate());
        this.graphManager.zoom(pOri, Math.log(pDelta / nDelta) * 500);
        this.onGraphChange?.(this.graphManager);
        break;
    }

    if (0 <= pidx) {
      this.pointers[pidx] = {
        pointerId: e.pointerId,
        clientX: e.clientX,
        clientY: e.clientY,
      };
    }
  }

  private handlePointerUp(e: PointerEvent) {
    if (!this.graphManager) return;
    e.preventDefault();
    this.renderer.domElement.releasePointerCapture(e.pointerId);
    this.pointers.splice(
      this.pointers.findIndex((p) => p.pointerId === e.pointerId),
      1
    );
  }

  private handleWheel(event: WheelEvent) {
    if (!this.graphManager) return;
    event.preventDefault();
    const rect = this.renderer.domElement.getBoundingClientRect();
    const m = Math.min(rect.width, rect.height);
    const c = new THREE.Vector2(
      ((((event.clientX - rect.left) / rect.width) * 2 - 1) * rect.width) / m,
      ((((event.clientY - rect.top) / rect.height) * 2 - 1) * rect.height) / m
    );
    this.graphManager.zoom(c.negate(), event.deltaY);
    this.onGraphChange?.(this.graphManager);
  }

  private handleResize() {
    const newResolution = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight - 50
    );

    this.camera.left = -newResolution.x;
    this.camera.right = newResolution.x;
    this.camera.top = newResolution.y;
    this.camera.bottom = -newResolution.y;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(newResolution.x, newResolution.y);
    this.onResolutionChange?.(newResolution);
  }

  public startAnimation(updateCallback: (time: number) => void) {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      updateCallback(performance.now());
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  public getScene() {
    return this.scene;
  }

  public getCamera() {
    return this.camera;
  }

  public getRenderer() {
    return this.renderer;
  }

  public getGraphManager() {
    return this.graphManager;
  }

  public updateGraph(newGraph: GraphMgr) {
    this.graphManager = newGraph;
    this.onGraphChange?.(this.graphManager);
  }

  public dispose() {
    window.removeEventListener("resize", this.boundHandleResize);
    if (this.graphManager) {
      this.renderer.domElement.removeEventListener(
        "pointerdown",
        this.boundHandlePointerDown
      );
      this.renderer.domElement.removeEventListener(
        "pointermove",
        this.boundHandlePointerMove
      );
      this.renderer.domElement.removeEventListener(
        "pointerup",
        this.boundHandlePointerUp
      );
      this.renderer.domElement.removeEventListener(
        "wheel",
        this.boundHandleWheel
      );
    }
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(
        this.renderer.domElement
      );
    }
  }
}
