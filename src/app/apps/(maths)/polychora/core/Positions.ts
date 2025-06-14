import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";
import { CoxeterNode } from "@/src/maths/CoxeterNode";
import { MobiusGyrovectorSphericalSpace3 } from "@/src/maths/MobiusGyrovectorSphericalSpace3";
import { Vector3 } from "three";
import { GetFundamentalDomain } from "./FundamentalDomain";
import { GetInitPoint } from "./InitPoint";

/**
 * 位置を取得する
 */
export function GetPositions(
  representativeNodes: Set<CoxeterNode>,
  diagram: CoxeterDynkinDiagram
) {
  const positions: { [key: string]: Vector3 } = {};

  // 初期頂点座標の生成
  const { pointA, pointB, pointC, pointD } = GetFundamentalDomain(
    diagram.labels
  );
  console.log(
    [pointA, pointB, pointC, pointD]
      .map(
        (v, i) =>
          `${String.fromCharCode(65 + i)}=(${v.x.toFixed(6)}, ${v.y.toFixed(
            6
          )}, ${v.z.toFixed(6)})\n`
      )
      .join("")
  );
  // 単位領域内の頂点定義
  let Q0 = GetInitPoint(
    pointA,
    pointB,
    pointC,
    pointD,
    diagram.labels,
    diagram.nodeMarks
  );

  // 頂点座標の生成(gyrovector)
  for (const node of representativeNodes) {
    let Q = Q0;
    const coordinate = node.coordinate;
    for (let j = coordinate.length - 1; j >= 0; j--) {
      if (positions[coordinate.slice(j)]) {
        Q = positions[coordinate.slice(j)]!;
        continue;
      }
      if (coordinate[j] === "a") {
        Q = MobiusGyrovectorSphericalSpace3.reflect(Q, pointB, pointC, pointD);
      } else if (coordinate[j] === "b") {
        Q = MobiusGyrovectorSphericalSpace3.reflect(Q, pointA, pointD, pointC);
      } else if (coordinate[j] === "c") {
        Q = MobiusGyrovectorSphericalSpace3.reflect(Q, pointD, pointA, pointB);
      } else if (coordinate[j] === "d") {
        Q = MobiusGyrovectorSphericalSpace3.reflect(Q, pointC, pointB, pointA);
      }
      positions[coordinate.slice(j)] = Q;
    }
    positions[coordinate] = Q;
  }
  return positions;
}
