import { CoxeterDynkinDiagram } from "@/shared/maths/CoxeterDynkinDiagram";
import { CoxeterNode } from "@/shared/maths/CoxeterNode";
import {
  Hyperplane3,
  MobiusGyrovectorSphericalSpace3,
} from "@/shared/maths/MobiusGyrovectorSphericalSpace3";
import { Vector3 } from "three";
import { GetFundamentalDomain } from "./FundamentalDomain";
import { GetInitPoint } from "./InitPoint";

/**
 * 位置を取得する
 */
export function GetPositions(
  representativeNodes: Set<CoxeterNode>,
  diagram: CoxeterDynkinDiagram,
) {
  const positions: { [key: string]: Vector3 } = {};

  // 初期頂点座標の生成
  const { pointA, pointB, pointC, pointD } = GetFundamentalDomain(
    diagram.labels,
  );
  console.log(
    [pointA, pointB, pointC, pointD]
      .map(
        (v, i) =>
          `${String.fromCharCode(65 + i)}=(${v.x.toFixed(6)}, ${v.y.toFixed(
            6,
          )}, ${v.z.toFixed(6)})\n`,
      )
      .join(""),
  );
  const planeA = Hyperplane3.fromPoints(pointB, pointC, pointD);
  const planeB = Hyperplane3.fromPoints(pointA, pointD, pointC);
  const planeC = Hyperplane3.fromPoints(pointD, pointA, pointB);
  const planeD = Hyperplane3.fromPoints(pointC, pointB, pointA);
  const FDTOBJ: {
    [key: string]: { expected: number; actual: number; diff?: number };
  } = {
    AB: {
      expected: (Math.PI / diagram.labels.ab[0]) * diagram.labels.ab[1],
      actual: planeA.angleTo(planeB),
    },
    AC: {
      expected: (Math.PI / diagram.labels.ac[0]) * diagram.labels.ac[1],
      actual: planeA.angleTo(planeC),
    },
    AD: {
      expected: (Math.PI / diagram.labels.ad[0]) * diagram.labels.ad[1],
      actual: planeA.angleTo(planeD),
    },
    BC: {
      expected: (Math.PI / diagram.labels.bc[0]) * diagram.labels.bc[1],
      actual: planeB.angleTo(planeC),
    },
    BD: {
      expected: (Math.PI / diagram.labels.bd[0]) * diagram.labels.bd[1],
      actual: planeB.angleTo(planeD),
    },
    CD: {
      expected: (Math.PI / diagram.labels.cd[0]) * diagram.labels.cd[1],
      actual: planeC.angleTo(planeD),
    },
  };
  for (const key in FDTOBJ) {
    FDTOBJ[key].diff = Math.abs(FDTOBJ[key].actual - FDTOBJ[key].expected);
  }
  console.log(
    Object.values(FDTOBJ).some((x) => Math.abs(x.diff!) > 1e-6)
      ? `❌ Fundamental Domain Test Failed: \n${Object.keys(FDTOBJ)
          .map(
            (x) =>
              `${FDTOBJ[x].diff! > 1e-6 ? "\u001b[31m" : ""}[${x}] EXP:${FDTOBJ[
                x
              ].expected.toFixed(4)} ACT:${FDTOBJ[x].actual.toFixed(
                4,
              )} DIFF:${FDTOBJ[x].diff!.toFixed(4)}\u001b[0m`,
          )
          .join("\n")}`
      : "✅ Fundamental Domain Test Passed",
  );
  // 単位領域内の頂点定義
  let Q0 = GetInitPoint(
    pointA,
    pointB,
    pointC,
    pointD,
    diagram.labels,
    diagram.nodeMarks,
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
