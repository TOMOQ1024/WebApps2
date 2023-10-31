export default class WGMgr {
  cvs: HTMLCanvasElement;
  ctx: GPUCanvasContext;

  constructor(){
    this.cvs = document.querySelector('#cvs')!;
    this.ctx = this.cvs.getContext('webgpu') as GPUCanvasContext;
  }

  async init(){
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
      console.error('WebGPU対応ブラウザが必要です');
      return;
    }
  }
}