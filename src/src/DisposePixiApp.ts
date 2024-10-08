import { Application } from "pixi.js";

/**
 * Remove stage correctly
 * reference:
 * - https://github.com/pixijs/pixijs/issues/8215#issuecomment-1980290231
 * - https://github.com/pixijs/pixijs/issues/2233#issuecomment-192227185
 */
export default function DisposePixiApp(app: Application) {
  if ("gl" in app.renderer) {
    (app.renderer.gl as WebGLRenderingContext)
      .getExtension("WEBGL_lose_context")
      ?.loseContext();
  }
}
