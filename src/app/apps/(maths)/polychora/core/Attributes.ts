import { BufferAttribute, type Vector3 } from "three";
import type { CoxeterNode } from "@/src/maths/CoxeterNode";
import { MobiusGyrovectorSphericalSpace3 } from "@/src/maths/MobiusGyrovectorSphericalSpace3";
import type { Polytope } from "@/src/maths/Polytope";

// 共通の色定義を定数として抽出
export const POLYGON_COLORS = {
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

export const SOLID_COLORS = {
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

/**
 * ポリゴンのインデックスを作成する
 */
function createPolygonIndices(
  vertexCount: number,
  indexOffset: number,
): number[] {
  const indices: number[] = [];
  for (let j = 0; j < vertexCount - 2; j++) {
    const L = (Math.floor(j / 2) + 1) % vertexCount;
    const H = (vertexCount - Math.ceil(j / 2)) % vertexCount;
    indices.push(
      indexOffset + H,
      indexOffset + (j % 2 ? L + 1 : (H + vertexCount - 1) % vertexCount),
      indexOffset + L,
    );
  }
  return indices;
}

/**
 * 平均位置を取得する
 */
function getMeanPosition(
  identicalNodeSets: Set<Set<CoxeterNode>>,
  positionMap: { [key: string]: Vector3 },
): Vector3 {
  return MobiusGyrovectorSphericalSpace3.mean(
    ...[...identicalNodeSets.values()].map(
      (nodeSet) => positionMap[nodeSet.values().next().value?.coordinate ?? ""],
    ),
  );
}

/**
 * 置換の偶奇性を計算する
 * @param from 元の配列
 * @param to 変換後の配列
 * @returns 0 なら偶置換、1 なら奇置換
 */
function calculatePermutationParity(from: string[], to: string[]): number {
  // 要素が同じであることを確認
  if (from.length !== to.length) {
    throw new Error("Arrays must have the same length");
  }

  // 各要素の位置をマッピング
  const indexMap = new Map<string, number>();
  from.forEach((val, idx) => {
    indexMap.set(val, idx);
  });

  // 転倒数を数える
  let inversions = 0;
  for (let i = 0; i < to.length; i++) {
    const fromIdx = indexMap.get(to[i]);
    if (fromIdx === undefined) {
      throw new Error(`Element ${to[i]} not found in source array`);
    }
    for (let j = i + 1; j < to.length; j++) {
      const toIdx = indexMap.get(to[j]);
      if (toIdx !== undefined && fromIdx > toIdx) {
        inversions++;
      }
    }
  }

  // 転倒数が奇数なら奇置換（1）、偶数なら偶置換（0）
  return inversions % 2;
}

/**
 * 透明な属性を作成する
 */
function createTransparentAttributes(
  polygons: Set<Polytope>,
  positionMap: { [key: string]: Vector3 },
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
          UV_DIV,
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

/**
 * フレーム属性を作成する
 */
function createFrameAttributes(
  polygons: Set<Polytope>,
  positionMap: { [key: string]: Vector3 },
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
        indexOffset + j + vertexCount,
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
          0.1,
        ).toArray(),
      );
      colors.push(...color.map(() => 1), 1);
    }
    indexOffset += vertexCount * 2;
  }

  return {
    position: new BufferAttribute(new Float32Array(vertices), 3),
    color: new BufferAttribute(new Float32Array(colors), 4),
    indices: new BufferAttribute(new Uint32Array(indices), 1),
  };
}

/**
 * 立体フレーム属性を作成する
 */
function createSolidFrameFAttributes(
  polytope: Polytope,
  polygons: Set<Polytope>,
  positionMap: { [key: string]: Vector3 },
) {
  const indexMap = new Map<Polytope, Map<CoxeterNode, number>>();
  const indices: number[] = [];
  const positions: number[] = [];
  const colors: number[] = [];

  // 頂点とインデックスの初期化
  // 各面の各頂点について，頂点を作成する．
  for (const polygon of polygons) {
    indexMap.set(polygon, new Map());
    const meanPos = getMeanPosition(polygon.identicalNodeSets, positionMap);
    const color = SOLID_COLORS[
      polygon.diagram.gens.join("") as keyof typeof SOLID_COLORS
    ] ?? [1, 1, 1];

    for (const nodeSet of polygon.identicalNodeSets) {
      const node = nodeSet.values().next().value as CoxeterNode;
      const vertex = positionMap[node.coordinate];
      indexMap.get(polygon)?.set(node, positions.length / 3);
      positions.push(
        ...MobiusGyrovectorSphericalSpace3.mix(vertex, meanPos, 0.1).toArray(),
      );
      colors.push(...color, 1);
    }
  }

  console.log(indexMap);

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
          (n) => n.values().next().value as CoxeterNode,
        );

        // ここで面の向きを調整する
        // TODO: 反転の基準を調査する
        // 基準は辺の生成元と面の生成元組から計算できる．
        // 以下，Lで反転
        // ("1","a","ab") → ??? → L
        // ("1","a","ac") → ??? → R
        // ("1","b","bc") → ??? → L
        // ("1","b","ba") → ??? → R
        // ("1","c","ca") → ??? → L
        // ("1","c","cb") → ??? → R
        // ("a","a","ab") → ??? → R
        // ("a","a","ac") → ??? → L
        // ("a","b","bc") → ??? → R
        // ("a","b","ba") → ??? → L
        // ("a","c","ca") → ??? → L
        // ("a","c","cb") → ??? → R
        const parent = polygon.parent
          .intersection(sibling.parent)
          .values()
          .next().value;
        if (!parent) throw new Error("Parent not found");
        const genEdge = edge.diagram.gensStr;
        const genPolygon =
          polygon.diagram.gens.filter((c) => c !== genEdge)[0] ?? "";
        const genPolyhedron =
          parent.diagram.gens.filter(
            (c) => c !== genEdge && c !== genPolygon,
          )[0] ?? "";
        const genPolychora =
          polytope.diagram.gens.filter(
            (c) => c !== genEdge && c !== genPolygon && c !== genPolyhedron,
          )[0] ?? "";
        const arr = [genEdge, genPolygon, genPolyhedron, genPolychora];
        const permutationParity = calculatePermutationParity(
          polytope.diagram.gens,
          arr,
        );
        const shouldFlip = s.getParity() !== permutationParity;
        if (!shouldFlip) {
          indices.push(
            indexMap.get(polygon)?.get(e) ?? -1,
            indexMap.get(sibling)?.get(e) ?? -1,
            indexMap.get(polygon)?.get(s) ?? -1,
            indexMap.get(sibling)?.get(e) ?? -1,
            indexMap.get(sibling)?.get(s) ?? -1,
            indexMap.get(polygon)?.get(s) ?? -1,
          );
        } else {
          indices.push(
            indexMap.get(polygon)?.get(s) ?? -1,
            indexMap.get(sibling)?.get(s) ?? -1,
            indexMap.get(polygon)?.get(e) ?? -1,
            indexMap.get(sibling)?.get(s) ?? -1,
            indexMap.get(sibling)?.get(e) ?? -1,
            indexMap.get(polygon)?.get(e) ?? -1,
          );
        }
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
              ...(currentFace?.siblings ?? []),
            ].find(
              ([sibling, joint]) =>
                !edges.has(joint) &&
                joint.children.has(vertex) &&
                sibling.identicalNodeSets.difference(
                  polyhedron.identicalNodeSets,
                ).size === 0,
            );

            if (!nextEdgeAndFace) break;
            const [nextFace, nextEdge]: [Polytope, Polytope] = nextEdgeAndFace;

            if (faces.has(nextFace)) break;
            if (nextFace.visibility) faces.add(nextFace);
            edges.add(nextEdge);
            currentFace = nextFace;
          }

          const facesArr = [...faces];
          const parentPolyhedron = facesArr[0].parent
            .intersection(facesArr[1].parent)
            .intersection(facesArr[2].parent)
            .values()
            .next().value as Polytope;
          const genPolychora =
            polytope.diagram.gens.filter(
              (c) => !parentPolyhedron.diagram.gens.includes(c),
            )[0] ?? "";
          const genArr = [
            ...facesArr.map(
              (f) =>
                parentPolyhedron.diagram.gens.filter(
                  (c) => !f.diagram.gens.includes(c),
                )[0] ?? "",
            ),
            genPolychora,
          ];

          if (polytope.diagram.gens.length !== genArr.length) {
            console.error(facesArr);
            console.error(polytope.diagram.gens, genArr);
            continue;
          }
          const permutationParity = calculatePermutationParity(
            polytope.diagram.gens,
            genArr,
          );

          const shouldFlip =
            vertex.nodes.values().next().value?.getParity() !==
            permutationParity;

          if (shouldFlip)
            [facesArr[0], facesArr[1]] = [facesArr[1], facesArr[0]];

          const vertexIndices = facesArr.map(
            (f) =>
              indexMap
                .get(f)
                ?.get(
                  [...vertex.identicalNodeSets.values()][0].values().next()
                    .value as CoxeterNode,
                ) ?? -1,
          );

          indices.push(
            ...createPolygonIndices(vertexIndices.length, 0).map(
              (i) => vertexIndices[i],
            ),
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

/**
 * 立体フレーム属性を作成する
 */
function createSolidFrameCAttributes(
  polytope: Polytope,
  polyhedra: Set<Polytope>,
  positionMap: { [key: string]: Vector3 },
) {
  const indexMap = new Map<Polytope, Map<CoxeterNode, number>>();
  const indices: number[] = [];
  const positions: number[] = [];
  const colors: number[] = [];

  // 頂点とインデックスの初期化
  for (const polyhedron of polyhedra) {
    indexMap.set(polyhedron, new Map());
    const meanPos = getMeanPosition(polyhedron.identicalNodeSets, positionMap);
    const color = SOLID_COLORS[
      polyhedron.diagram.gens.join("") as keyof typeof SOLID_COLORS
    ] ?? [1, 1, 1];

    for (const nodeSet of polyhedron.identicalNodeSets) {
      const node = nodeSet.values().next().value as CoxeterNode;
      const vertex = positionMap[node.coordinate];
      indexMap.get(polyhedron)?.set(node, positions.length / 3);
      positions.push(
        ...MobiusGyrovectorSphericalSpace3.mix(vertex, meanPos, 0.1).toArray(),
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
          (n) => n.values().next().value as CoxeterNode,
        );
        indices.push(
          indexMap.get(polyhedron)?.get(s) ?? -1,
          indexMap.get(sibling)?.get(s) ?? -1,
          indexMap.get(polyhedron)?.get(e) ?? -1,
          indexMap.get(sibling)?.get(s) ?? -1,
          indexMap.get(sibling)?.get(e) ?? -1,
          indexMap.get(polyhedron)?.get(e) ?? -1,
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
              ...(currentFace?.siblings ?? []),
            ].find(
              ([sibling, joint]) =>
                !edges.has(joint) &&
                joint.children.has(vertex) &&
                sibling.identicalNodeSets.difference(
                  polyhedron.identicalNodeSets,
                ).size === 0,
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
                .get(f)
                ?.get(
                  [...vertex.identicalNodeSets.values()][0].values().next()
                    .value as CoxeterNode,
                ) ?? -1,
          );

          indices.push(
            ...createPolygonIndices(vertexIndices.length, 0).map(
              (i) => vertexIndices[i],
            ),
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

/**
 * 属性を作成する
 */
export function CreateAttributes(
  positionMap: { [key: string]: Vector3 },
  polytope: Polytope,
  mode: "transparent" | "frame" | "solidframe-f" | "solidframe-c",
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
    case "solidframe-f":
      return createSolidFrameFAttributes(polytope, polygons, positionMap);
    case "solidframe-c": {
      const cells = new Set<Polytope>();
      for (const node of polytope.nodes) {
        for (const polytope of node.polytopes) {
          if (polytope.diagram.getDimension() === 3 && polytope.visibility) {
            cells.add(polytope);
          }
        }
      }
      return createSolidFrameCAttributes(polytope, cells, positionMap);
    }
  }
}
