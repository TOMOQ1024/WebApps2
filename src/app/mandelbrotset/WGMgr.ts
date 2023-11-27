import CreateModule from "./CreateModule";
import Render from "./Render";

export default class WGMgr {
  cvs: HTMLCanvasElement;
  ctx: GPUCanvasContext;
  adapter: GPUAdapter | null = null;
  device: GPUDevice | null = null;
  texFormat: GPUTextureFormat | null = null;
  render = Render;
  module: GPUShaderModule | null = null;
  pipeline: GPURenderPipeline | null = null;
  renderPassDescriptor: GPURenderPassDescriptor | null = null;

  constructor(){
    this.cvs = document.querySelector('#cvs')!;
    this.ctx = this.cvs.getContext('webgpu') as GPUCanvasContext;
  }

  async init(){
    this.adapter = await navigator.gpu?.requestAdapter();
    this.device = await this.adapter?.requestDevice() ?? null;
    if (!this.device) {
      console.error('WebGPU対応ブラウザが必要です');
      alert('WebGPU対応ブラウザが必要です');
      return;
    }

    this.texFormat = navigator.gpu.getPreferredCanvasFormat();
    this.ctx.configure({
      device: this.device,
      format: this.texFormat,
    });

    this.module = await CreateModule(this.device);
    if(!this.module) return;

    this.pipeline = this.device.createRenderPipeline({
      label: 'mandel pipeline',
      layout: 'auto',
      vertex: {
        module: this.module,
        entryPoint: 'vs',
      },
      fragment: {
        module: this.module,
        entryPoint: 'fs',
        targets: [{ format: this.texFormat }],
      },
    });

    this.renderPassDescriptor = {
      label: 'mandel renderPass',
      colorAttachments: [
        {
          view: this.ctx.getCurrentTexture().createView(),
          clearValue: [0.3, 0.3, 0.3, 1],
          loadOp: 'clear' as GPULoadOp,
          storeOp: 'store' as GPUStoreOp,
        },
      ],
    }; 
  }
}
