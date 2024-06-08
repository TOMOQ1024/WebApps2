import { RenderingMode } from "./Definitions";
import { Dispatch, SetStateAction } from "react";
import { Parse } from "@/src/parser/Main";
import GraphMgr from "@/src/GraphMgr";
import { AmbientLight, AxesHelper, BoxGeometry, DirectionalLight, GridHelper, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons";
import { MarchingCubesMgr } from "./MarchingCubesMgr";

export default class Core {
  pointers: {
    pointerId: number,
    clientX: number,
    clientY: number,
  }[] = [];
  _error = '';
  _setError: Dispatch<SetStateAction<string>> = ()=>{};
  get error () { return this._error };
  set error (e) { this._setError(this._error = e) };
  graph = new GraphMgr();
  func: string = 'x*x+y*y+z*z-20';
  _funcexpr: string = 'xx+yy+zz-100';
  _setFuncexpr: Dispatch<SetStateAction<string>> = ()=>{};
  get funcexpr () { return this._funcexpr; }
  set funcexpr (s: string) {
    const result = Parse( s, ['x', 'y', 'z', 't'], 'expr' );
    let f = '';
    if (true) {//(result.status) {
      try {
        f = s;//result.root!.togl();
      }
      catch(e) {
        this.error = `${e}`;
        console.error(e);
        return;
      }
      this.error = '';
      this.func = f;
      this._funcexpr = s;// this line will be deleted
      this._setFuncexpr(s);
      this.mcMgr.func = (x: number, y: number, z: number) => result.root!.calc({x, y, z})[0];
    }
    else {
      this.error = 'parse failed';
    }
  }
  renderingMode: RenderingMode = RenderingMode.HSV;
  rawShaderData = {
    vert: '',
    frag: '',
  };
  cvs = document.createElement('canvas');
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  interval: NodeJS.Timeout | null = null;
  controls: OrbitControls;
  mcMgr: MarchingCubesMgr;

  constructor () {
    const wr = document.querySelector('#main-wrapper') as HTMLElement;
    wr.appendChild(this.cvs);
    this.cvs.style.width = '100%';
    this.scene = new Scene();
    
    this.camera = new PerspectiveCamera(
      75,
      this.cvs.width / this.cvs.height,
      0.1,
      1000
    );
    this.camera.translateZ(9);
    this.camera.translateY(6);
    // this.camera.rotateX(-1);

    this.renderer = new WebGLRenderer({
      canvas: this.cvs,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.cvs.width, this.cvs.height);
    this.renderer.setPixelRatio(devicePixelRatio);

    this.scene.add(new Mesh(
      new BoxGeometry(10, 10, 10),
      new MeshLambertMaterial({color: '#ffffff', wireframe: true}),
    ));
    this.scene.add(new GridHelper());
    this.scene.add(new AxesHelper());

    const ambientLight = new AmbientLight('#ffffff', .3);
    this.scene.add(ambientLight);
    const directionalLight = new DirectionalLight();
    directionalLight.position.set(.3, 1., .3).normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    this.controls = new OrbitControls(this.camera, this.cvs);

    this.mcMgr = new MarchingCubesMgr(this.scene);

    this.beginLoop();

    this.funcexpr = this.funcexpr;
  }

  setRF(x: number) {
    // this.app.renderer.resolution = x;
  }

  setRM(m: RenderingMode) {
    this.renderingMode = m;
  }

  setEvents () {
  }

  beginLoop () {
    this.interval = setInterval(()=>{
      this.loop();
    }, 1000/60);
  }

  endLoop () {
    clearInterval(this.interval!);
  }

  loop () {
    // Render three.js
    this.renderer.render(this.scene, this.camera);
  }
}