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
export function CreatePolychoron(diagram: CoxeterDynkinDiagram, dual: boolean) {
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
        planeMAB,
        MobiusGyrovectorSphericalSpace3.mean(pointC, pointD)
      );

    case "xoxo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeB,
        planeD,
        planeMAC,
        MobiusGyrovectorSphericalSpace3.mean(pointB, pointD)
      );
    case "xoox":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeB,
        planeC,
        planeMAD,
        MobiusGyrovectorSphericalSpace3.mean(pointB, pointC)
      );
    case "oxxo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeD,
        planeMBC,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointD)
      );
    case "oxox":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeC,
        planeMBD,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointC)
      );
    case "ooxx":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeB,
        planeMCD,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointB)
      );

    case "oxxx":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeA,
        planeMBC,
        planeMCD,
        MobiusGyrovectorSphericalSpace3.mean(pointB, pointC, pointD)
      );
    case "xoxx":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeB,
        planeMAD,
        planeMCD,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointC, pointD)
      );
    case "xxox":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeC,
        planeMAD,
        planeMAB,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointB, pointD)
      );
    case "xxxo":
      return MobiusGyrovectorSphericalSpace3.intersectionPoint(
        planeD,
        planeMAC,
        planeMAB,
        MobiusGyrovectorSphericalSpace3.mean(pointA, pointB, pointC)
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
  diagram: CoxeterDynkinDiagram
) {
  const positions: { [key: string]: Vector3 } = {};

  // 初期頂点座標の生成
  const { pointA, pointB, pointC, pointD } = GetFundamentalDomain(
    diagram.labels
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

// 共通の色定義を定数として抽出
const POLYGON_COLORS = {
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
} as const;

const SOLID_COLORS = {
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
} as const;

// ヘルパー関数
function createPolygonIndices(
  vertexCount: number,
  indexOffset: number
): number[] {
  const indices: number[] = [];
  for (let j = 0; j < vertexCount - 2; j++) {
    const L = (Math.floor(j / 2) + 1) % vertexCount;
    const H = (vertexCount - Math.ceil(j / 2)) % vertexCount;
    indices.push(
      indexOffset + H,
      indexOffset + (j % 2 ? L + 1 : (H + vertexCount - 1) % vertexCount),
      indexOffset + L
    );
  }
  return indices;
}

function getMeanPosition(
  identicalNodeSets: Set<Set<CoxeterNode>>,
  positionMap: { [key: string]: Vector3 }
): Vector3 {
  return MobiusGyrovectorSphericalSpace3.mean(
    ...[...identicalNodeSets.values()].map(
      (nodeSet) => positionMap[nodeSet.values().next().value!.coordinate]
    )
  );
}

function createTransparentAttributes(
  polygons: Set<Polytope>,
  positionMap: { [key: string]: Vector3 }
) {
  const indices: number[] = [];
  const vertices: number[] = [];
  const uvs: number[] = [];
  const UV_DIV = 10;
  let indexOffset = 0;

  for (const polygon of polygons) {
    const vertexCount = polygon.identicalNodeSets.size;
    indices.push(...createPolygonIndices(vertexCount, indexOffset));

    for (let j = 0; j < vertexCount; j++) {
      const nodeSet = [...polygon.identicalNodeSets.values()][j];
      const node = [...nodeSet.values()][0];
      vertices.push(...positionMap[node.coordinate].toArray());

      const n = vertexCount >= 100 ? 0 : vertexCount;
      uvs.push(
        (Math.cos((j * 2 * Math.PI) / n) / 2 + 0.5 + (n % UV_DIV)) / UV_DIV,
        (Math.sin((j * 2 * Math.PI) / n) / 2 + 0.5 + Math.floor(n / UV_DIV)) /
          UV_DIV
      );
    }
    indexOffset += vertexCount;
  }

  return {
    position: new BufferAttribute(new Float32Array(vertices), 3),
    uv: new BufferAttribute(new Float32Array(uvs), 2),
    indices: new BufferAttribute(new Uint32Array(indices), 1),
  };
}

function createFrameAttributes(
  polygons: Set<Polytope>,
  positionMap: { [key: string]: Vector3 }
) {
  const indices: number[] = [];
  const vertices: number[] = [];
  const colors: number[] = [];
  let indexOffset = 0;

  for (const polygon of polygons) {
    const color = POLYGON_COLORS[
      polygon.diagram.gens.join("") as keyof typeof POLYGON_COLORS
    ] ?? [1, 1, 1];
    const vertexCount = polygon.identicalNodeSets.size;
    const meanPos = getMeanPosition(polygon.identicalNodeSets, positionMap);

    for (let j = 0; j < vertexCount; j++) {
      const k = (j + 1) % vertexCount;
      indices.push(
        indexOffset + j,
        indexOffset + k,
        indexOffset + k + vertexCount,
        indexOffset + j,
        indexOffset + k + vertexCount,
        indexOffset + j + vertexCount
      );

      const nodeSet = [...polygon.identicalNodeSets.values()][j];
      const node = [...nodeSet.values()][0];
      vertices.push(...positionMap[node.coordinate].toArray());
      colors.push(...color.map((c) => c * 0.1), 1);
    }

    for (let j = 0; j < vertexCount; j++) {
      const nodeSet = [...polygon.identicalNodeSets.values()][j];
      const node = [...nodeSet.values()][0];
      vertices.push(
        ...MobiusGyrovectorSphericalSpace3.mix(
          positionMap[node.coordinate],
          meanPos,
          0.1
        ).toArray()
      );
      colors.push(...color.map((c) => 1), 1);
    }
    indexOffset += vertexCount * 2;
  }

  return {
    position: new BufferAttribute(new Float32Array(vertices), 3),
    color: new BufferAttribute(new Float32Array(colors), 4),
    indices: new BufferAttribute(new Uint32Array(indices), 1),
  };
}

function createSolidFrameAttributes(
  polytope: Polytope,
  polygons: Set<Polytope>,
  positionMap: { [key: string]: Vector3 }
) {
  const indexMap = new Map<Polytope, Map<CoxeterNode, number>>();
  const indices: number[] = [];
  const positions: number[] = [];
  const colors: number[] = [];

  // 頂点とインデックスの初期化
  for (const polygon of polygons) {
    indexMap.set(polygon, new Map());
    const meanPos = getMeanPosition(polygon.identicalNodeSets, positionMap);
    const color = SOLID_COLORS[
      polygon.diagram.gens.join("") as keyof typeof SOLID_COLORS
    ] ?? [1, 1, 1];

    for (const nodeSet of polygon.identicalNodeSets) {
      const node = nodeSet.values().next().value!;
      const vertex = positionMap[node.coordinate];
      indexMap.get(polygon)!.set(node, positions.length / 3);
      positions.push(
        ...MobiusGyrovectorSphericalSpace3.mix(vertex, meanPos, 0.01).toArray()
      );
      colors.push(...color, 1);
    }
  }

  // エッジの処理
  for (const polyhedron of polytope.children) {
    const searchedEdges = new Set<Polytope>();
    for (const polygon of polyhedron.children) {
      for (const [sibling, edge] of polygon.siblings) {
        if (searchedEdges.has(edge)) continue;
        if (
          sibling.identicalNodeSets.difference(polyhedron.identicalNodeSets)
            .size > 0
        )
          continue;

        searchedEdges.add(edge);
        const [s, e] = [...edge.identicalNodeSets.values()].map(
          (n) => n.values().next().value!
        );
        indices.push(
          indexMap.get(polygon)!.get(s)!,
          indexMap.get(sibling)!.get(s)!,
          indexMap.get(polygon)!.get(e)!,
          indexMap.get(sibling)!.get(s)!,
          indexMap.get(sibling)!.get(e)!,
          indexMap.get(polygon)!.get(e)!
        );
      }
    }
  }

  // 頂点の処理
  for (const polyhedron of polytope.children) {
    const searchedVertices = new Set<Polytope>();
    for (const polygon of polyhedron.children) {
      for (const edge of polygon.children) {
        for (const vertex of edge.children) {
          if (searchedVertices.has(vertex)) continue;
          if (
            vertex.identicalNodeSets.difference(polyhedron.identicalNodeSets)
              .size > 0
          )
            continue;

          searchedVertices.add(vertex);
          const faces = new Set<Polytope>([polygon]);
          const edges = new Set<Polytope>();
          let currentFace: Polytope | undefined = polygon;

          while (true) {
            const nextEdgeAndFace: [Polytope, Polytope] | undefined = [
              ...currentFace!.siblings,
            ].find(
              ([sibling, joint]) =>
                !edges.has(joint) &&
                joint.children.has(vertex) &&
                sibling.identicalNodeSets.difference(
                  polyhedron.identicalNodeSets
                ).size === 0
            );

            if (!nextEdgeAndFace) break;
            const [nextFace, nextEdge]: [Polytope, Polytope] = nextEdgeAndFace;

            if (faces.has(nextFace)) break;
            if (nextFace.visibility) faces.add(nextFace);
            edges.add(nextEdge);
            currentFace = nextFace;
          }

          const vertexIndices = [...faces].map(
            (f) =>
              indexMap
                .get(f)!
                .get(
                  [...vertex.identicalNodeSets.values()][0].values().next()
                    .value!
                )!
          );

          indices.push(
            ...createPolygonIndices(vertexIndices.length, 0).map(
              (i) => vertexIndices[i]
            )
          );
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

function CreateAttributes(
  positionMap: { [key: string]: Vector3 },
  polytope: Polytope,
  mode: "transparent" | "frame" | "solidframe"
) {
  const polygons = new Set<Polytope>();
  for (const node of polytope.nodes) {
    for (const polytope of node.polytopes) {
      if (polytope.diagram.getDimension() === 2 && polytope.visibility) {
        polygons.add(polytope);
      }
    }
  }

  switch (mode) {
    case "transparent":
      return createTransparentAttributes(polygons, positionMap);
    case "frame":
      return createFrameAttributes(polygons, positionMap);
    case "solidframe":
      return createSolidFrameAttributes(polytope, polygons, positionMap);
  }
}
