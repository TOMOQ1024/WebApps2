import {
  BufferAttribute,
  BufferGeometry,
  Matrix3,
  Vector3,
  Vector4,
} from "three";
import { CoxeterNode } from "@/src/maths/CoxeterNode";
import { GyrovectorSpace3 } from "@/src/maths/GyrovectorSpace3";
import { CountMap } from "@/src/CountMap";

/**
 * 多面体のモデルを生成する．
 * @param mx ノード間ラベル
 * @param ni ノードの種類 (o|x|s){3}
 * @param dual 双対
 *
 * @example
 * CreatePolyhedron(4,3,2,0,1,0) -> Cube
 */
export async function CreatePolychora(
  labels: { [genPair: string]: number },
  ni: { [gen: string]: string },
  dual: boolean
) {
  // 群構造の構築
  const graph = new CoxeterNode(labels);
  await graph.build();

  const coordinates = new Set([""]);
  // graph.isSolved(undefined, coordinates);
  // console.log(coordinates);

  console.log(graph);
  console.log(graph.isSolved(undefined, coordinates) ? "solved" : "unsolved");
  console.log(`Elements: ${coordinates.size}`);
  coordinates.delete("");
  coordinates.add("1");
  const pad =
    Array.from(coordinates).reduce((p, s) => (p.length > s.length ? p : s))
      .length + 1;
  const col = Math.ceil(Math.sqrt((2 * coordinates.size) / pad)) + 1;
  // console.log(
  //   Array.from(coordinates).reduce((p, s, i) => {
  //     return p.padEnd(pad) + s.padEnd(pad) + ((i + 1) % col ? "" : "\n");
  //   })
  // );
  coordinates.delete("1");
  coordinates.add("");

  const nodes = graph.nodes(coordinates); // グラフの頂点配列
  const positions: { [key: string]: Vector3 } = {}; // ジャイロベクトル平面上の頂点座標
  const polygons: string[][] = []; // 多角形

  // 重複した頂点の抽出
  const identicalCoordinates: string[][] = [];
  coordinates.forEach((c) => {
    if (identicalCoordinates.flat().indexOf(c) < 0) {
      identicalCoordinates.push(graph.getNodeAt(c)!.getIdenticalNodes(ni));
    }
  });
  // console.log(
  //   `Identical coordinates: ${identicalCoordinates.map((c) => c || "1")}`
  // );

  // 初期頂点座標の生成
  const g = new GyrovectorSpace3();
  g.curvature = 1;
  g.radius = 1;
  const { pointA, pointB, pointC, pointD } = CreatePoints(labels, g);
  console.log(pointA, pointB, pointC, pointD);

  // 単位領域内の頂点定義
  let Q0 = GetInitPoint(pointA, pointB, pointC, pointD, labels, ni, g);
  console.log(Q0);

  // 頂点座標の生成(gyrovector)
  for (let i = 0; i < identicalCoordinates.length; i++) {
    let Q = Q0;
    const coordinate = identicalCoordinates[i][0];
    // console.log(`Coordinate: ${coordinate}`);
    // let prevQ = Q;
    // for (let j = 0; j < coordinate.length; j++) {
    for (let j = coordinate.length - 1; j >= 0; j--) {
      // console.log(coordinate[j]);
      // prevQ = Q;
      // console.log(prevQ);
      if (coordinate[j] === "a") {
        Q = g.reflect(Q, pointB, pointC, pointD);
      } else if (coordinate[j] === "b") {
        Q = g.reflect(Q, pointA, pointD, pointC);
      } else if (coordinate[j] === "c") {
        Q = g.reflect(Q, pointD, pointA, pointB);
      } else if (coordinate[j] === "d") {
        Q = g.reflect(Q, pointC, pointB, pointA);
      }
      // console.log(g.distance(Q, prevQ));
      // console.log(Q);
    }
    positions[coordinate] = Q;
  }

  // #region snubによる面の追加
  // // snubによる面の追加
  // const indicesToDelete: number[] = [];
  // if (Object.values(ni).indexOf("s") >= 0) {
  //   for (let i = 0; i < identicalIndices.length; i++) {
  //     const ii = identicalIndices[i];
  //     const n = nodes[ii[0]];
  //     const co = n.coordinate;
  //     const sa = ni[0] === "s" ? (co.match(/a/g) ?? []).length : 0;
  //     const sb = ni[1] === "s" ? (co.match(/b/g) ?? []).length : 0;
  //     const sc = ni[2] === "s" ? (co.match(/c/g) ?? []).length : 0;
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

  // 多角形リストの作成(graphの破壊)
  coordinates.forEach((c) => {
    polygons.push(...nodes.find((n) => n.coordinate === c)!.popPolygons(ni));
  });
  // console.log(`Polygons: ${polygons.length}`);
  // console.log(polygons.map((p) => p.length).toSorted());

  // 重複した面の削除
  // console.log("DedupePolygons");
  DedupePolygons(polygons);
  // console.log(`Polygons: ${polygons.length}`);

  // 重複した頂点の結合
  // console.log("ArrangePolygons");
  ArrangePolygons(polygons, identicalCoordinates);
  console.log(`Vertices: ${Object.keys(positions).length}`);
  console.log(`Faces: ${polygons.length}`);
  console.log(CountMap(polygons.map((p) => p.length)));
  // console.log(
  //   `Polygons:\n${polygons
  //     .map((p) => `(${p.length}) ${p.map((c) => c || "1").join(",")}`)
  //     .join("\n")}`
  // );

  // #region snubによる頂点の削除
  // // snubによる頂点の削除
  // for (let i = identicalIndices.length - 1; i >= 0; i--) {
  //   if (indicesToDelete.indexOf(i) >= 0) {
  //     positions.splice(i, 1);
  //     identicalIndices.splice(i, 1);
  //   }
  // }
  // for (let i = 0; i < polygons.length; i++) {
  //   const p = polygons[i];
  //   for (let j = 0; j < p.length; j++) {
  //     p[j] -= indicesToDelete.filter((d) => d <= p[j]).length;
  //   }
  // }
  // #endregion

  // console.log(polygons);

  // #region 双対の場合
  // 双対の場合
  // if (dual) {
  //   const newPositions: Vector2[] = [];
  //   const newPolygons: number[][] = [];
  //   for (let i = 0; i < polygons.length; i++) {
  //     newPositions.push(g.mean(...polygons[i].map((p) => positions[p])));
  //   }
  //   for (let i = 0; i < positions.length; i++) {
  //     const newPolygon: number[] = [];
  //     for (let j = 0; j < polygons.length; j++) {
  //       if (polygons[j].indexOf(i) >= 0) {
  //         newPolygon.push(j);
  //       }
  //     }
  //     newPolygons.push([]);
  //     let p = 0;
  //     while (true) {
  //       if (p < 0) break;
  //       newPolygons[i].push(newPolygon[p]);
  //       let neighbor =
  //         polygons[newPolygon[p]][
  //           (polygons[newPolygon[p]].indexOf(i) -
  //             1 +
  //             polygons[newPolygon[p]].length) %
  //             polygons[newPolygon[p]].length
  //         ];
  //       p = newPolygon.findIndex(
  //         (n) =>
  //           newPolygons[i].indexOf(n) < 0 && polygons[n].indexOf(neighbor) >= 0
  //       );
  //     }
  //   }
  //   console.log(newPolygons);

  //   positions.splice(0, positions.length);
  //   positions.push(...newPositions);
  //   polygons.splice(0, polygons.length);
  //   polygons.push(...newPolygons);
  // }
  // #endregion

  // console.log(polygons);

  const triangles: number[] = []; // 三角形リスト
  const vertices: number[] = []; // 頂点座標
  const uvs: number[] = []; // UV座標
  const UV_DIV = 10; // [0,1]^2 を分割する数値
  let indexOffset = 0;
  for (let i = 0; i < polygons.length; i++) {
    const p = polygons[i];
    for (let j = 0; j < p.length - 2; j++) {
      const L = (Math.floor(j / 2) + 1) % p.length;
      const H = (p.length - Math.ceil(j / 2)) % p.length;
      triangles.push(
        indexOffset + H,
        indexOffset + (j % 2 ? L + 1 : (H + p.length - 1) % p.length),
        indexOffset + L
      );
      // triangles.push(
      //   indexOffset + L,
      //   indexOffset + (j % 2 ? L + 1 : (H + p.length - 1) % p.length),
      //   indexOffset + H
      // );
    }
    for (let j = 0; j < p.length; j++) {
      vertices.push(...positions[p[j]].toArray());
      uvs.push(
        (Math.cos((j * 2 * Math.PI) / p.length) / 2 +
          0.5 +
          (p.length % UV_DIV)) /
          UV_DIV,
        (Math.sin((j * 2 * Math.PI) / p.length) / 2 +
          0.5 +
          Math.floor(p.length / UV_DIV)) /
          UV_DIV
      );
    }
    indexOffset += p.length;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(vertices), 3)
  );
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(triangles);
  return geometry;
}

function CreatePoints(
  labels: { [genPair: string]: number },
  g: GyrovectorSpace3
) {
  // point A
  const pointA = new Vector3(0, 0, 0);

  // hyperplane B,C,D
  const angleCD = Math.PI - Math.PI / labels.cd;
  const angleDB = Math.PI - Math.PI / labels.bd;
  const angleBC = Math.PI - Math.PI / labels.bc;
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
  const angleAB = Math.PI - Math.PI / labels.ab;
  const angleAC = Math.PI - Math.PI / labels.ac;
  const angleAD = Math.PI - Math.PI / labels.ad;
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
    pointB,
    pointC,
    pointD,
  };
}

function GetInitPoint(
  pointA: Vector3,
  pointB: Vector3,
  pointC: Vector3,
  pointD: Vector3,
  labels: { [genPair: string]: number },
  ni: { [gen: string]: string },
  g: GyrovectorSpace3
) {
  // xxxx
  return g.incenter4(pointA, pointB, pointC, pointD);

  // return g.mean(pointA, pointB, pointC, pointD);
}

// 面の重複を削除
function DedupePolygons(polygons: string[][]) {
  const uniquePolygons = new Set<string>();

  polygons.forEach((polygon) => {
    const rotations = [];
    for (let i = 0; i < polygon.length; i++) {
      rotations.push(polygon.slice(i).concat(polygon.slice(0, i)).join(","));
      rotations.push(
        polygon.slice(i).concat(polygon.slice(0, i)).reverse().join(",")
      );
    }
    const minRotation = rotations.sort()[0];
    uniquePolygons.add(minRotation);
  });

  polygons.length = 0;
  uniquePolygons.forEach((polygon) => {
    polygons.push(polygon.split(","));
  });
}

// 頂点の結合と不要な面の削除
function ArrangePolygons(
  polygons: string[][],
  identicalCoordinates: string[][]
) {
  for (let i = 0; i < polygons.length; i++) {
    const p = polygons[i];
    // 不要な点の削除
    for (let j = 0; j < p.length; j++) {
      p[j] = identicalCoordinates.find((ii) => ii.indexOf(p[j]) >= 0)![0];
    }
    // 不要な辺の削除
    for (let j = 0; j < p.length; j++) {
      if (p[j] === p[(j + 1) % p.length]) {
        p.splice(j--, 1);
      }
    }
    // 不要な面の削除
    if (p.length <= 2) {
      polygons.splice(i--, 1);
    }
  }
}
