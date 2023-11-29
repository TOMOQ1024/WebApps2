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
  uniformBuffer: GPUBuffer | null = null;
  uniformValues: Float32Array | null = null;
  bindGroup: GPUBindGroup | null = null;

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

    const bindGroupLayout = this.device.createBindGroupLayout({
      label: 'raymarching bindgrouplayout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: {},
        },
        // {
        //   binding: 1,
        //   visibility: GPUShaderStage.FRAGMENT,
        //   texture: {},
        // },
        // {
        //   binding: 2,
        //   visibility: GPUShaderStage.FRAGMENT,
        //   sampler: {},
        // },
      ],
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    this.pipeline = this.device.createRenderPipeline({
      label: 'raymarching pipeline',
      layout: pipelineLayout,
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

    // Uniform変数の設定
    const uniformBufferSize = 4 * 4;
    this.uniformBuffer = this.device.createBuffer({
      label: 'raymarching uniformbuffer',
      size: uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.uniformValues = new Float32Array(uniformBufferSize / 4);
    this.updateGraphUniform();
    this.bindGroup = this.device.createBindGroup({
      label: 'raymarching bindgroup',
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.uniformBuffer
          }
        },
      ],
    });

    this.renderPassDescriptor = {
      label: 'raymarching renderPass',
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

  updateGraphUniform() {
    // this.uniformValues!.set([
    //   this.graph.origin.x,
    //   this.graph.origin.y,
    //   this.graph.radius
    // ], 0);
  }
}
