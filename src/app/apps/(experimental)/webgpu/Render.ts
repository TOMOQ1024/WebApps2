import WGMgr from "./Core";

export default function Render(this: WGMgr) {
  (this.renderPassDescriptor!.colorAttachments as GPURenderPassColorAttachment[])[0].view =
    this.ctx.getCurrentTexture().createView();
 
  // コマンドエンコーダを生成する。コマンドのエンコードができる状態にする。
	const encoder = this.device!.createCommandEncoder({ label: 'our encoder' });
 
  // レンダーパスのエンコーダを生成する。そこへコマンドを並べて、描画手順をエンコードする。
  const pass = encoder.beginRenderPass(this.renderPassDescriptor!);
  pass.setPipeline(this.pipeline!);
  pass.draw(3);  // 頂点シェーダを３回呼び出す
  pass.end();

  const commandBuffer = encoder.finish();
  this.device!.queue.submit([commandBuffer]);
}