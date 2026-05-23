import { BufferAttribute, Vector3 } from "three";
import { MobiusGyrovectorSphericalSpace3 } from "@/src/maths/MobiusGyrovectorSphericalSpace3";
import { CoxeterNode } from "@/src/maths/CoxeterNode";
import { Polytope } from "@/src/maths/Polytope";

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

/**
 * 平均位置を取得する
 */
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

/**
 * 透明な属性を作成する
 */
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

/**
 * フレーム属性を作成する
 */
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

/**
 * 立体フレーム属性を作成する
 */
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
        ...MobiusGyrovectorSphericalSpace3.mix(vertex, meanPos, 0.1).toArray()
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

/**
 * 属性を作成する
 */
export function CreateAttributes(
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
