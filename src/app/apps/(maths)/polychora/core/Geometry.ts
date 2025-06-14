import { BufferGeometry } from "three";
import { CoxeterNode } from "@/src/maths/CoxeterNode";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";
import { CreateAttributes } from "./Attributes";
import { GetPositions } from "./Positions";
import { GetRepresentativeNodes } from "./RepresentativeNodes";

/**
 * 多面体のモデルを生成する．
 * @param diagram コクセター・ディンキン図形
 * @param dual 双対
 */
export function CreatePolychoronGeometry(
  diagram: CoxeterDynkinDiagram,
  dual: boolean
) {
  diagram.dropCache();
  // 群構造の構築
  const graph = new CoxeterNode(diagram);
  console.time("⌛️ Graph build time");
  graph.build();
  console.timeEnd("⌛️ Graph build time");
  const nodes = graph.nodes(); // グラフの頂点配列

  console.time("⌛️ Representative nodes time");
  const representativeNodes = GetRepresentativeNodes(nodes);
  console.timeEnd("⌛️ Representative nodes time");

  console.time("⌛️ Positions time");
  const positions = GetPositions(representativeNodes, diagram); // ジャイロベクトル平面上の頂点座標
  console.timeEnd("⌛️ Positions time");

  // #region snubによる面の追加
  // // snubによる面の追加
  // const indicesToDelete: number[] = [];
  // if (Object.values(nodeMarks).indexOf("s") >= 0) {
  //   for (let i = 0; i < identicalIndices.length; i++) {
  //     const ii = identicalIndices[i];
  //     const n = nodes[ii[0]];
  //     const co = n.coordinate;
  //     const sa = nodeMarks[0] === "s" ? (co.match(/a/g) ?? []).length : 0;
  //     const sb = nodeMarks[1] === "s" ? (co.match(/b/g) ?? []).length : 0;
  //     const sc = nodeMarks[2] === "s" ? (co.match(/c/g) ?? []).length : 0;
  //     if ((sa + sc + sb) % 2) continue;
  //     indicesToDelete.push(i);
  //     polygons.push([
  //       coordinates.indexOf(n.siblings.a!.coordinate),
  //       coordinates.indexOf(n.siblings.b!.coordinate),
  //       coordinates.indexOf(n.siblings.c!.coordinate),
  //     ]);
  //   }
  // }
  // #endregion

  // 多角形リストの作成
  console.time("⌛️ Polytope build time");
  const polytope = graph.buildPolytope();
  console.timeEnd("⌛️ Polytope build time");

  // console.log(`Dim 0 Elements: ${representativeNodes.size}`);
  // console.log(`Faces: ${polygons.size}`);
  // console.log(
  //   CountMap([...polygons.values()].map((p) => p.representativeNodes.size))
  // );

  console.time("⌛️ Geometry build time");
  const { indices, ...attributes } = CreateAttributes(
    positions,
    polytope,
    "solidframe"
  );
  const geometry = new BufferGeometry();
  geometry.setIndex(indices);
  for (const [key, value] of Object.entries(attributes)) {
    geometry.setAttribute(key, value);
  }
  console.timeEnd("⌛️ Geometry build time");

  console.log(`Elements: ${Object.keys(nodes).length}`);
  console.log("graph: ", graph);
  console.log("representativeNodes: ", representativeNodes);
  console.log("positions: ", positions);
  console.log("polytope: ", polytope);

  return geometry;
}
