import { BufferAttribute, BufferGeometry, Matrix3, Vector3 } from "three";
import { CoxeterNode } from "@/src/maths/CoxeterNode";
import { MobiusGyrovectorSphericalSpace3 } from "@/src/maths/MobiusGyrovectorSphericalSpace3";
import { CountMap } from "@/src/CountMap";
import { Polytope } from "@/src/maths/Polytope";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";

/**
 * 多面体のモデルを生成する．
 * @param mx ノード間ラベル
 * @param nodeMarks ノードの種類 (o|x|s){3}
 * @param dual 双対
 *
 * @example
 * CreatePolyhedron(4,3,2,0,1,0) -> Cube
 */
export function CreatePolychoron(
  labels: { [genPair: string]: [number, number] },
  nodeMarks: { [gen: string]: string },
  dual: boolean
) {
  // 群構造の構築
  const graph = new CoxeterNode(new CoxeterDynkinDiagram(labels, nodeMarks));
  console.log("ℹ️ Building graph");
  graph.build();
  console.log("✅ Graph built");
  console.log(graph);
  const nodes = graph.nodes(); // グラフの頂点配列
  console.log(`Elements: ${Object.keys(nodes).length}`);

  console.log("ℹ️ Getting representative nodes");
  const representativeNodes = GetRepresentativeNodes(nodes);
  console.log("✅ Representative nodes found");
  console.log(representativeNodes);

  console.log("ℹ️ Getting positions");
  const positions = GetPositions(representativeNodes, labels, nodeMarks); // ジャイロベクトル平面上の頂点座標
  console.log("✅ Positions found");

  // console.log(positions);

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
  console.log("ℹ️ Building polytope");
  const polytope = graph.buildPolytope();
  console.log("✅ Polytope built");
  console.log(polytope);

  // console.log(`Dim 0 Elements: ${representativeNodes.size}`);
  // console.log(`Faces: ${polygons.size}`);
  // console.log(
  //   CountMap([...polygons.values()].map((p) => p.representativeNodes.size))
  // );

  console.log("ℹ️ Building geometry");
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
  console.log("✅ Geometry built");
  return geometry;
}

function GetFundamentalDomain(labels: { [genPair: string]: [number, number] }) {
  // point A
  const pointA = new Vector3(0, 0, 0);

  // hyperplane B,C,D
  const angleCD = Math.PI - (Math.PI / labels.cd[0]) * labels.cd[1];
  const angleDB = Math.PI - (Math.PI / labels.bd[0]) * labels.bd[1];
  const angleBC = Math.PI - (Math.PI / labels.bc[0]) * labels.bc[1];
  const planeB = new Vector3(1, 0, 0);
  const planeC = new Vector3(Math.cos(angleBC), Math.sin(angleBC), 0);
  const planeD = new Vector3(Math.cos(angleDB), 0, Math.sin(angleDB));
  planeD.applyAxisAngle(
    planeB,
    Math.asin(
      (Math.cos(angleCD) - Math.cos(angleDB) * Math.cos(angleBC)) /
        (Math.sin(angleDB) * Math.sin(angleBC))
    )
  );
  // console.log(planeB, planeC, planeD);

  // hyperplane A
  const angleAB = Math.PI - (Math.PI / labels.ab[0]) * labels.ab[1];
  const angleAC = Math.PI - (Math.PI / labels.ac[0]) * labels.ac[1];
  const angleAD = Math.PI - (Math.PI / labels.ad[0]) * labels.ad[1];
  const sphereCenterA = new Vector3(
    Math.cos(angleAB),
    Math.cos(angleAC),
    Math.cos(angleAD)
  ).applyMatrix3(
    new Matrix3(
      ...planeB.toArray(),
      ...planeC.toArray(),
      ...planeD.toArray()
    ).invert()
  );
  const sphereRadiusA = 1 / Math.sqrt(1 - sphereCenterA.lengthSq());
  sphereCenterA.multiplyScalar(sphereRadiusA);

  // point B
  const pointB = planeC.clone().cross(planeD).normalize();
  pointB.multiplyScalar(
    pointB.dot(sphereCenterA) +
      Math.sqrt(
        pointB.dot(sphereCenterA) ** 2 -
          sphereCenterA.lengthSq() +
          sphereRadiusA * sphereRadiusA
      )
  );

  // point C
  const pointC = planeD.clone().cross(planeB).normalize();
  pointC.multiplyScalar(
    pointC.dot(sphereCenterA) +
      Math.sqrt(
        pointC.dot(sphereCenterA) ** 2 -
          sphereCenterA.lengthSq() +
          sphereRadiusA * sphereRadiusA
      )
  );

  // point D
  const pointD = planeB.clone().cross(planeC).normalize();
  pointD.multiplyScalar(
    pointD.dot(sphereCenterA) +
      Math.sqrt(
        pointD.dot(sphereCenterA) ** 2 -
          sphereCenterA.lengthSq() +
          sphereRadiusA * sphereRadiusA
      )
  );

  return {
    pointA,
    pointB:
      pointB.lengthSq() > 1
        ? MobiusGyrovectorSphericalSpace3.antipode(pointB)
        : pointB,
    pointC:
      pointC.lengthSq() > 1
        ? MobiusGyrovectorSphericalSpace3.antipode(pointC)
        : pointC,
    pointD:
      pointD.lengthSq() > 1
        ? MobiusGyrovectorSphericalSpace3.antipode(pointD)
        : pointD,
  };
}

function GetRepresentativeNodes(nodes: { [key: string]: CoxeterNode }) {
  const representativeNodes: Set<CoxeterNode> = new Set();
  let n: CoxeterNode;

  Object.keys(nodes).forEach((c) => {
    n = nodes[c].identicalNodes.values().next().value!;
    representativeNodes.add(n);
  });
  return representativeNodes;
}

function GetInitPoint(
  pointA: Vector3,
  pointB: Vector3,
  pointC: Vector3,
  pointD: Vector3,
  labels: { [genPair: string]: [number, number] },
  ni: { [gen: string]: string }
) {
  const planeA = MobiusGyrovectorSphericalSpace3.hyperplane(
    pointB,
    pointC,
    pointD
  );
  const planeB = MobiusGyrovectorSphericalSpace3.hyperplane(
    pointA,
    pointD,
    pointC
  );
  const planeC = MobiusGyrovectorSphericalSpace3.hyperplane(
    pointD,
    pointA,
    pointB
  );
  const planeD = MobiusGyrovectorSphericalSpace3.hyperplane(
    pointC,
    pointB,
    pointA
  );
  const planeMAB = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeA,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeB)
  );
  const planeMAC = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeA,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeC)
  );
  const planeMAD = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeA,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeD)
  );
  const planeMBC = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeB,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeC)
  );
  const planeMBD = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeB,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeD)
  );
  const planeMCD = MobiusGyrovectorSphericalSpace3.midHyperplane(
    planeC,
    MobiusGyrovectorSphericalSpace3.invertHyperplane(planeD)
  );

  switch (`${ni.a}${ni.b}${ni.c}${ni.d}`) {
    case "xxxx":
      console.log(
        MobiusGyrovectorSphericalSpace3.incenter4(
          pointA,
          pointB,
          pointC,
          pointD
        )
      );
      return MobiusGyrovectorSphericalSpace3.incenter4(
        pointA,
        pointB,
        pointC,
        pointD
      );

    case "xooo":
      return pointA;
    case "oxoo":
      return pointB;
    case "ooxo":
      return pointC;
    case "ooox":
      return pointD;

    case "xxoo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeC,
        planeD,
        planeMAB
      );
    case "xoxo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeB,
        planeD,
        planeMAC
      );
    case "xoox":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeB,
        planeC,
        planeMAD
      );
    case "oxxo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeD,
        planeMBC
      );
    case "oxox":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeC,
        planeMBD
      );
    case "ooxx":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeB,
        planeMCD
      );

    case "oxxx":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeMBC,
        planeMCD
      );
    case "xoxx":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeB,
        planeMAD,
        planeMCD
      );
    case "xxox":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeC,
        planeMAD,
        planeMAB
      );
    case "xxxo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeD,
        planeMAC,
        planeMAB
      );

    default:
      return MobiusGyrovectorSphericalSpace3.mean(
        pointA,
        pointB,
        pointC,
        pointD
      );
  }
}

function GetPositions(
  representativeNodes: Set<CoxeterNode>,
  labels: { [genPair: string]: [number, number] },
  ni: { [gen: string]: string }
) {
  const positions: { [key: string]: Vector3 } = {};

  // 初期頂点座標の生成
  const { pointA, pointB, pointC, pointD } = GetFundamentalDomain(labels);
  console.log(pointA, pointB, pointC, pointD);
  // 単位領域内の頂点定義
  let Q0 = GetInitPoint(pointA, pointB, pointC, pointD, labels, ni);

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

function CreateAttributes(
  positionMap: { [key: string]: Vector3 },
  polytope: Polytope,
  mode: "transparent" | "frame" | "solidframe"
) {
  // const polyhedrons: Set<Polytope> = new Set();
  const polygons: Set<Polytope> = new Set();
  // const edges: Set<Polytope> = new Set();
  // const vertices: Set<Polytope> = new Set();
  for (const node of polytope.nodes) {
    for (const polytope of node.polytopes) {
      switch (polytope.diagram.getDimension()) {
        case 0:
          // if (polytope.visibility) vertices.add(polytope);
          break;
        case 1:
          // if (polytope.visibility) edges.add(polytope);
          break;
        case 2:
          if (polytope.visibility) polygons.add(polytope);
          break;
        case 3:
          // if (polytope.visibility) polyhedrons.add(polytope);
          break;
        default:
          break;
      }
    }
  }
  switch (mode) {
    case "transparent": {
      // 面全体を半透明で描画する
      const indices: number[] = []; // 三角形リスト
      const vertices: number[] = []; // 頂点座標
      const uvs: number[] = []; // UV座標
      const UV_DIV = 10; // [0,1]^2 を分割する数値
      let indexOffset = 0;
      for (let polygon of polygons) {
        const p = polygon;
        const P = p.identicalNodeSets.size;
        for (let j = 0; j < P - 2; j++) {
          const L = (Math.floor(j / 2) + 1) % P;
          const H = (P - Math.ceil(j / 2)) % P;
          indices.push(
            indexOffset + H,
            indexOffset + (j % 2 ? L + 1 : (H + P - 1) % P),
            indexOffset + L
          );
        }
        for (let j = 0; j < P; j++) {
          vertices.push(
            ...positionMap[
              [...p.identicalNodeSets.values()][j].values().next().value!
                .coordinate
            ].toArray()
          );
          let n =
            p.identicalNodeSets.size >= 100 ? 0 : p.identicalNodeSets.size;
          uvs.push(
            (Math.cos((j * 2 * Math.PI) / n) / 2 + 0.5 + (n % UV_DIV)) / UV_DIV,
            (Math.sin((j * 2 * Math.PI) / n) / 2 +
              0.5 +
              Math.floor(n / UV_DIV)) /
              UV_DIV
          );
        }
        indexOffset += P;
      }
      return {
        position: new BufferAttribute(new Float32Array(vertices), 3),
        uv: new BufferAttribute(new Float32Array(uvs), 2),
        indices: new BufferAttribute(new Uint32Array(indices), 1),
      };
    }
    case "frame": {
      // 辺のみを不透明で描画する
      const COLORS = {
        ab: [1, 1, 0.9],
        ba: [1, 1, 0.9],
        bc: [1, 0.9, 1],
        cb: [1, 0.9, 1],
        cd: [0.9, 1, 1],
        dc: [0.9, 1, 1],
        da: [0.95, 0.95, 1],
        ad: [0.95, 0.95, 1],
        ac: [0.95, 1, 0.95],
        ca: [0.95, 1, 0.95],
        bd: [1, 0.95, 0.95],
        db: [1, 0.95, 0.95],
      } as { [key: string]: [number, number, number] };
      const indices: number[] = []; // 三角形リスト
      const vertices: number[] = []; // 頂点座標
      const colors: number[] = []; // 頂点色
      let indexOffset = 0;
      for (let polygon of polygons) {
        const c = COLORS[polygon.diagram.gens.join("")];
        const p = polygon.identicalNodeSets;
        const P = polygon.identicalNodeSets.size;
        const M = MobiusGyrovectorSphericalSpace3.mean(
          ...[...p.values()].map(
            (s) => positionMap[s.values().next().value!.coordinate]
          )
        );
        // const M = p
        //   .map((c) => positions[c])
        //   .reduce((a, b) => a.add(b), new Vector3())
        //   .divideScalar(p.length);
        for (let j = 0; j < P; j++) {
          const k = (j + 1) % P;
          indices.push(
            indexOffset + j,
            indexOffset + k,
            indexOffset + k + P,
            indexOffset + j,
            indexOffset + k + P,
            indexOffset + j + P
          );
          vertices.push(
            ...positionMap[
              [...p.values()][j].values().next().value!.coordinate
            ].toArray()
          );
          colors.push(...c.map((c) => 1).map((c) => c * 0.1), 1);
        }
        for (let j = 0; j < P; j++) {
          vertices.push(
            ...MobiusGyrovectorSphericalSpace3.mix(
              positionMap[[...p.values()][j].values().next().value!.coordinate],
              M,
              0.1
            ).toArray()
          );
          colors.push(...c.map((c) => 1), 1);
        }
        indexOffset += P * 2;
      }
      return {
        position: new BufferAttribute(new Float32Array(vertices), 3),
        color: new BufferAttribute(new Float32Array(colors), 4),
        indices: new BufferAttribute(new Uint32Array(indices), 1),
      };
    }
    case "solidframe": {
      const COLORS = {
        ab: [1, 1, 0.6],
        ba: [1, 1, 0.6],
        bc: [1, 0.6, 1],
        cb: [1, 0.6, 1],
        cd: [0.6, 1, 1],
        dc: [0.6, 1, 1],
        da: [0.6, 0.6, 1],
        ad: [0.6, 0.6, 1],
        ac: [0.6, 1, 0.6],
        ca: [0.6, 1, 0.6],
        bd: [1, 0.6, 0.6],
        db: [1, 0.6, 0.6],
      } as { [key: string]: [number, number, number] };
      const indexMap: Map<Polytope, Map<CoxeterNode, number>> = new Map();
      const indices: number[] = []; // 三角形リスト
      const positions: number[] = []; // 頂点座標
      const colors: number[] = []; // 頂点色

      for (const polygon of polygons) {
        indexMap.set(polygon, new Map());
        const M = MobiusGyrovectorSphericalSpace3.mean(
          ...[...polygon.identicalNodeSets.values()].map(
            (n) => positionMap[n.values().next().value!.coordinate]
          )
        );
        for (const nodeSet of polygon.identicalNodeSets) {
          const node = nodeSet.values().next().value!;
          const vertex = positionMap[node.coordinate];
          indexMap.get(polygon)!.set(node, positions.length / 3);
          positions.push(
            ...MobiusGyrovectorSphericalSpace3.mix(vertex, M, 0.1).toArray()
          );
          colors.push(
            ...(COLORS[polygon.diagram.gens.join("")] ?? [1, 1, 1]),
            1
          );
        }
      }

      const searchedEdges: Set<Polytope> = new Set();
      for (const polyhedron of polytope.children) {
        searchedEdges.clear();
        for (const polygon of polyhedron.children) {
          for (const [sibling, edge] of polygon.siblings) {
            if (searchedEdges.has(edge)) continue;
            if (
              sibling.identicalNodeSets.difference(polyhedron.identicalNodeSets)
                .size > 0
            ) {
              continue;
            }
            searchedEdges.add(edge);
            const [l, r] = [polygon, sibling];
            const [s, e] = [
              ...[...edge.identicalNodeSets.values()].map(
                (n) => n.values().next().value!
              ),
            ];
            indices.push(
              indexMap.get(l)!.get(s)!,
              indexMap.get(r)!.get(s)!,
              indexMap.get(l)!.get(e)!,
              indexMap.get(r)!.get(s)!,
              indexMap.get(r)!.get(e)!,
              indexMap.get(l)!.get(e)!
            );
          }
        }
      }
      const searchedVertices: Set<Polytope> = new Set();
      for (const polyhedron of polytope.children) {
        searchedVertices.clear();
        for (const polygon of polyhedron.children) {
          for (const edge of polygon.children) {
            for (const vertex of edge.children) {
              if (searchedVertices.has(vertex)) continue;
              if (
                vertex.identicalNodeSets.difference(
                  polyhedron.identicalNodeSets
                ).size > 0
              ) {
                continue;
              }
              searchedVertices.add(vertex);
              let e: Polytope | undefined = undefined;
              let f: Polytope | undefined = polygon;
              const edges = new Set<Polytope>([]);
              const faces = new Set<Polytope>([]);
              if (f.visibility) faces.add(f);
              while (1) {
                [f, e] =
                  [...f.siblings].find(
                    ([sibling, joint]) =>
                      !edges.has(joint) &&
                      joint.children.has(vertex) &&
                      sibling.identicalNodeSets.difference(
                        polyhedron.identicalNodeSets
                      ).size === 0
                  ) ?? [];
                if (!e || !f) {
                  console.log(vertex, edges, faces);
                  throw new Error("Failed to find edge");
                }
                if (faces.has(f)) break;

                if (f.visibility) faces.add(f);
                edges.add(e);
              }
              console.log("successed");
              const p: number[] = [];
              faces.forEach((f) => {
                p.push(
                  indexMap
                    .get(f)!
                    .get(
                      vertex.identicalNodeSets
                        .values()
                        .next()
                        .value!.values()
                        .next().value!
                    )!
                );
              });
              for (let j = 0; j < p.length - 2; j++) {
                const L = (Math.floor(j / 2) + 1) % p.length;
                const H = (p.length - Math.ceil(j / 2)) % p.length;
                indices.push(
                  p[H],
                  p[j % 2 ? L + 1 : (H + p.length - 1) % p.length],
                  p[L]
                );
              }
            }
          }
        }
      }
      return {
        position: new BufferAttribute(new Float32Array(positions), 3),
        color: new BufferAttribute(new Float32Array(colors), 4),
        indices: new BufferAttribute(new Uint32Array(indices), 1),
      };
    }
  }
}
