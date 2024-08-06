import { Parse } from "@/src/parser/Main";
import CDCore from "../CompDynamCore";
import { PresetExpressions } from "../Definitions";

export default function PresetSelector({ core }: { core: CDCore }) {
  function HandleClick(i: number) {
    const expr = PresetExpressions[i].split("|");
    // テキストの解析
    core.funcexpr = expr[1];
    core.z0expr = expr[0];
  }

  return (
    <div id="preset-selector">
      <div>- プリセット選択 -</div>
      <div id="preset-button-wrapper">
        {PresetExpressions.map((v, i) => {
          return (
            <input
              className="preset-button"
              key={v}
              type="image"
              alt={`Select \`${v}\``}
              src={`/resources/compdynam/images/p${i.toString(16)}.png`}
              onClick={() => HandleClick(i)}
            />
          );
        })}
      </div>
    </div>
  );
}
