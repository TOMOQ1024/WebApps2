import CDCore from "../CompDynamCore";
import { RenderingMode } from "../Definitions";

export default function Settings({core}: {
  core: CDCore;
}) {
  return (
    <div id='settings'>
      <div>- 描画設定 -</div>
      <div id='rf-editor'>
        解像度倍率：
        <input
        id='rf-input'
        className='range'
        type='range'
        name='rf'
        min='-1'
        max='1'
        step='0.01'
        onChange={e=>{
          core.setRF(10**(Number(e.target.value)));
          core.resizeCanvas();
        }} />
      </div>
      <div id='rm-editor'>
        描画モード：
        <input
        id='rm-input-h'
        className='radio'
        type='radio'
        name='rm'
        value='hsv'
        defaultChecked
        onChange={e=>{
          core.setRM(RenderingMode.HSV);
          core.init();
        }}
        /><span className='rm-option'>HSV</span>
        <input
        id='rm-input-v'
        className='radio'
        type='radio'
        name='rm'
        value='grayscale'
        onChange={e=>{
          core.setRM(RenderingMode.GRAYSCALE);
          core.init();
        }}
        /><span className='rm-option'>Grayscale</span>
      </div>
    </div>
  );
}