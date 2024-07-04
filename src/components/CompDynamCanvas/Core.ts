import {
  Application,
  Assets,
  Geometry,
  Mesh,
  Rectangle,
  Shader,
  Sprite,
  Texture,
} from "pixi.js";
import axios from "axios";
import { Vector2 } from "three";
import { Dispatch, SetStateAction } from "react";
import { Parse } from "@/src/parser/Main";
import GraphMgr from "@/src/GraphMgr";
import { RenderingMode } from "@/components/CompDynamCanvas/RenderingMode";
import DisposePixiApp from "@/src/DisposePixiApp";

export default class Core {
  pointers: {
    pointerId: number;
    clientX: number;
    clientY: number;
  }[] = [];
  _error = "";
  _setError: Dispatch<SetStateAction<string>> = () => {};
  get error() {
    return this._error;
  }
  set error(e) {
    this._setError((this._error = e));
  }
  graph = new GraphMgr();
  app = new Application();
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
  quad = new Mesh<Geometry, Shader>({
    geometry: new Geometry({
      attributes: {
        aPosition: [-1, -1, -1, +3, +3, -1],
      },
      indexBuffer: [0, 2, 1],
    }),
  });
  rawShaderData = {
    vert: "",
    frag: "",
  };
  nessyTex = new Texture();
  nessySp = new Sprite();
  controls = true;
  lowFPS = false;

  async init(wr: HTMLElement) {
    await this.app.init({
      resizeTo: wr,
      preference: "webgl",
    });
    wr.appendChild(this.app.canvas);
    this.app.canvas.style.width = "100%";

    this.nessyTex = new Texture({
      source: await Assets.load("/resources/compdynam/images/earth.jpg"),
      frame: new Rectangle(0, 0, 128, 128),
    });
    this.nessyTex.source.addressMode = "repeat";
    this.nessyTex.source.scaleMode = "nearest";

    // 表示には影響しないが，これを表示すると何故かテクスチャがシェーダーに適用される(???)
    this.nessySp = Sprite.from(this.nessyTex);
    this.nessySp.alpha = 0;
    this.quad.width = wr.clientWidth * 4;
    this.quad.height = wr.clientHeight * 4;
    this.quad.eventMode = "static";
    this.setEvents();

    this.rawShaderData = await axios
      .get("/api/compdynam-shaders")
      .then((res) => {
        return res.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

    this.updateShader();

    this.app.stage.addChild(this.nessySp);
    this.app.stage.addChild(this.quad);
    if (this.lowFPS) this.app.ticker.maxFPS = 1;

    this.app.ticker.add(() => {
      // if (this.lowFPS) DisposePixiApp(this.app);
      this.quad.shader.resources.uniforms.uniforms.uTime =
        performance.now() / 1000;
    });
  }

  endLoop() {
    if (!this.app || !this.app.ticker) return;
    this.app.ticker.destroy();
  }

  updateShader() {
    const shader = Shader.from({
      gl: {
        vertex: this.rawShaderData.vert,
        fragment: this.rawShaderData.frag
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
          ),
      },
      resources: {
        uniforms: {
          uResolution: {
            value: [this.app.canvas.width, this.app.canvas.height],
            type: "vec2<f32>",
          },
          uTime: { value: performance.now() / 1000, type: "f32" },
          "uGraph.origin": {
            value: this.graph.origin.toArray(),
            type: "vec2<f32>",
          },
          "uGraph.radius": { value: this.graph.radius, type: "f32" },
          // uTexture: this.nessyTex
        },
      },
    });

    this.quad.shader = shader;
  }

  setIter(i: number) {
    this.iter = i;
  }

  setRF(x: number) {
    this.app.renderer.resolution = x;
  }

  setRM(m: RenderingMode) {
    this.renderingMode = m;
  }

  setEvents() {
    this.quad
      .on("wheel", (e) => {
        if (!this.controls) return;
        const rect = this.app.canvas.getBoundingClientRect();
        // [0,1]正規化した座標
        const m = Math.min(rect.width, rect.height);
        const c = new Vector2(
          (((2 * (e.clientX - rect.left)) / rect.width - 1) * rect.width) / m,
          (((2 * (e.clientY - rect.top)) / rect.height - 1) * rect.height) / m
        );
        const dy = e.deltaY;
        this.graph.zoom(c.negate(), dy);

        this.updateShader();
      })
      .on("pointerdown", (e) => {
        if (!this.controls) return;
        e.preventDefault();
        this.app.canvas.setPointerCapture(e.pointerId); // キャンバス外も追跡
        this.pointers.push({
          pointerId: e.pointerId,
          clientX: e.clientX,
          clientY: e.clientY,
        });
      })
      .on("pointermove", (e) => {
        if (!this.controls) return;
        e.preventDefault();
        const rect = this.app.canvas.getBoundingClientRect();
        const m = Math.min(rect.width, rect.height);
        const pidx = this.pointers.findIndex(
          (p) => p.pointerId === e.pointerId
        );
        const p = this.pointers[pidx] ?? e;
        const c = this.pointers;
        switch (c.length) {
          case 0:
            return;
          case 1:
            let delta = new Vector2(
              (2 * (e.clientX - p.clientX)) / m,
              (2 * (p.clientY - e.clientY)) / m
            );
            this.graph.translate(delta.negate());
            this.updateShader();
            break;
          default:
            const C0 = pidx === 0 ? e : c[0];
            const C1 = pidx === 1 ? e : c[1];
            let pOri = new Vector2(
              (((c[1].clientX + c[0].clientX) / rect.width - 1) * rect.width) /
                m,
              (((c[1].clientY + c[0].clientY) / rect.height - 1) *
                rect.height) /
                m
            );
            let dOri = new Vector2(
              (((C1.clientX + C0.clientX) / rect.width - 1) * rect.width) / m,
              (((C1.clientY + C0.clientY) / rect.height - 1) * rect.height) / m
            )
              .sub(pOri)
              .multiply({ x: 1, y: -1 });
            let pDelta = Math.hypot(
              (2 * (c[1].clientX - c[0].clientX)) / m,
              (2 * (c[1].clientY - c[0].clientY)) / m
            );
            let nDelta = Math.hypot(
              (2 * (C1.clientX - C0.clientX)) / m,
              (2 * (C1.clientY - C0.clientY)) / m
            );
            this.graph.translate(dOri.negate());
            this.graph.zoom(pOri.negate(), Math.log(pDelta / nDelta) * 500);
            this.updateShader();
            break;
        }
        if (0 <= pidx) {
          this.pointers[pidx] = {
            pointerId: e.pointerId,
            clientX: e.clientX,
            clientY: e.clientY,
          };
        }
      })
      .on("pointerup", (e) => {
        if (!this.controls) return;
        e.preventDefault();
        this.app.canvas.releasePointerCapture(e.pointerId);
        this.pointers.splice(
          this.pointers.findIndex((p) => p.pointerId === e.pointerId),
          1
        );
      });
  }
}
