import { Parse } from "@/src/parser/Main";
import CDCore from "../CompDynamCore";
import { PresetExpressions } from "../Definitions";

export default function PresetSelector({ core }: { core: CDCore }) {
  function HandleClick(i: number) {
    const expr = PresetExpressions[i].split("|");
    // テキストの解析
    let result = Parse(expr[1], ["z", "i", "c"]);

    const ctl = document.getElementById("controls")!;
    if (result.status) {
      ctl.className = ctl.className.replace(/(?:in)?valid/, "valid");
      core.z0 = "c";
      core.expr = expr[1];
      core.func = result.root!.tocdgl();
    } else {
      ctl.className = ctl.className.replace(/(?:in)?valid/, "invalid");
      console.error(`failed to parse preset expression no.${i}`);
    }

    result = Parse(expr[0], ["i", "c"]);

    let z0: string = "";
    if (result.status) {
      try {
        z0 = result.root!.tocdgl();
      } catch (e) {
        ctl.className = ctl.className.replace(/(?:in)?valid/, "invalid");
        console.error(e);
        return;
      }
      ctl.className = ctl.className.replace(/(?:in)?valid/, "valid");
      core.z0 = z0;
      core.z0expr = expr[0];
      core.init();
    }
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
