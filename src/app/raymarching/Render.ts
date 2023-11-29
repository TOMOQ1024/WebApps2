import WGMgr from "./WGMgr";

export default function Render(this: WGMgr) {
  (this.renderPassDescriptor!.colorAttachments as GPURenderPassColorAttachment[])[0].view =
    this.ctx.getCurrentTexture().createView();

	const encoder = this.device!.createCommandEncoder({ label: 'raymarching encoder' });
 
  // 描画
  this.device!.queue.writeBuffer(this.uniformBuffer!, 0, this.uniformValues!);
  const renderPassEncoder = encoder.beginRenderPass(this.renderPassDescriptor!);
  renderPassEncoder.setPipeline(this.pipeline!);
  renderPassEncoder.setBindGroup(0, this.bindGroup);
  renderPassEncoder.draw(6);
  renderPassEncoder.end();

  const commandBuffer = encoder.finish();
  this.device!.queue.submit([commandBuffer]);
}