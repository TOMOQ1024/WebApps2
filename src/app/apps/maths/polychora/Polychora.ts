import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Matrix3,
  Vector3,
  Vector4,
} from "three";
import { CoxeterNode } from "@/src/maths/CoxeterNode";
import { MobiusGyrovectorSphericalSpace3 } from "@/src/maths/MobiusGyrovectorSphericalSpace3";
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
  labels: { [genPair: string]: [number, number] },
  ni: { [gen: string]: string },
  dual: boolean
) {
  // 群構造の構築
  const graph = new CoxeterNode(labels, ni);
  console.log("Building graph");
  await graph.build();
  console.log(graph.isSolved(undefined) ? "solved" : "unsolved");
  console.log(graph);
  const nodes = graph.nodes(); // グラフの頂点配列
  console.log(`Elements: ${Object.keys(nodes).length}`);
  // coordinates.delete("");
  // coordinates.add("1");
  // const pad =
  //   Array.from(coordinates).reduce((p, s) => (p.length > s.length ? p : s))
  //     .length + 1;
  // const col = Math.ceil(Math.sqrt((2 * coordinates.size) / pad)) + 1;
  // console.log(
  //   Array.from(coordinates).reduce((p, s, i) => {
  //     return p.padEnd(pad) + s.padEnd(pad) + ((i + 1) % col ? "" : "\n");
  //   })
  // );
  // coordinates.delete("1");
  // coordinates.add("");

  console.log("Getting identical coordinates");
  const identicalCoordinates = GetIdenticalCoordinates(nodes); // 重複した頂点の抽出
  // console.log(identicalCoordinates);

  const positions = GetPositions(identicalCoordinates, labels, ni); // ジャイロベクトル平面上の頂点座標

  // console.log(positions);

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
  console.log("Creating polygons");
  const subpolytopes2 = graph.getSubpolytopes(2);
  const polygons: { coordinates: string[]; gens: string }[] = [];
  for (const [gens, faces] of Object.entries(subpolytopes2)) {
    for (const face of faces) {
      polygons.push({
        coordinates: face.map((n) => n.coordinate),
        gens: gens,
      });
    }
  }
  // console.log(`Polygons: ${polygons.length}`);
  // console.log(polygons.map((p) => p.length).toSorted());

  // 重複した頂点の結合
  console.log("Arranging polygons");
  ArrangePolygons(polygons, identicalCoordinates);
  // console.log(
  //   `Polygons:\n${polygons
  //     .map((p) => `(${p.length}) ${p.map((c) => c || "1").join(",")}`)
  //     .join("\n")}`
  // );

  // 重複した面の削除
  console.log("Deduplicating polygons");
  DedupePolygons(polygons);
  // console.log(
  //   `Polygons:\n${polygons
  //     .map((p) => `(${p.length}) ${p.map((c) => c || "1").join(",")}`)
  //     .join("\n")}`
  // );
  // console.log(`Polygons: ${polygons.length}`);

  console.log(`Vertices: ${identicalCoordinates.length}`);
  console.log(`Faces: ${polygons.length}`);
  console.log(CountMap(polygons.map((p) => p.coordinates.length)));

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

  const { indices, ...attributes } = CreateAttributes(
    positions,
    polygons,
    "frame"
  );
  const geometry = new BufferGeometry();
  geometry.setIndex(indices);

  for (const [key, value] of Object.entries(attributes)) {
    geometry.setAttribute(key, value);
  }
  return geometry;
}

function GetFundamentalDomain(
  labels: { [genPair: string]: [number, number] },
  g: MobiusGyrovectorSphericalSpace3
) {
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
    pointB: pointB.lengthSq() > 1 ? g.antipode(pointB) : pointB,
    pointC: pointC.lengthSq() > 1 ? g.antipode(pointC) : pointC,
    pointD: pointD.lengthSq() > 1 ? g.antipode(pointD) : pointD,
  };
}

function GetIdenticalCoordinates(nodes: { [key: string]: CoxeterNode }) {
  const identicalCoordinates: string[][] = [];
  const searchedCoordinates = new Set<string>();
  let n: string[];

  Object.keys(nodes).forEach((c) => {
    if (searchedCoordinates.has(c)) return;
    n = nodes[c].getIdenticalNodes();
    identicalCoordinates.push(n);
    for (const i of n) {
      searchedCoordinates.add(i);
    }
  });
  return identicalCoordinates;
}

function GetInitPoint(
  pointA: Vector3,
  pointB: Vector3,
  pointC: Vector3,
  pointD: Vector3,
  labels: { [genPair: string]: [number, number] },
  ni: { [gen: string]: string },
  g: MobiusGyrovectorSphericalSpace3
) {
  const planeA = g.hyperplane(pointB, pointC, pointD);
  const planeB = g.hyperplane(pointA, pointD, pointC);
  const planeC = g.hyperplane(pointD, pointA, pointB);
  const planeD = g.hyperplane(pointC, pointB, pointA);
  const planeMAB = g.midHyperplane(planeA, g.invertHyperplane(planeB));
  const planeMAC = g.midHyperplane(planeA, g.invertHyperplane(planeC));
  const planeMAD = g.midHyperplane(planeA, g.invertHyperplane(planeD));
  const planeMBC = g.midHyperplane(planeB, g.invertHyperplane(planeC));
  const planeMBD = g.midHyperplane(planeB, g.invertHyperplane(planeD));
  const planeMCD = g.midHyperplane(planeC, g.invertHyperplane(planeD));

  switch (`${ni.a}${ni.b}${ni.c}${ni.d}`) {
    case "xxxx":
      console.log(g.incenter4(pointA, pointB, pointC, pointD));
      return g.incenter4(pointA, pointB, pointC, pointD);

    case "xooo":
      return pointA;
    case "oxoo":
      return pointB;
    case "ooxo":
      return pointC;
    case "ooox":
      return pointD;

    case "xxoo":
      return g.intersectionPoint(planeC, planeD, planeMAB);
    case "xoxo":
      return g.intersectionPoint(planeB, planeD, planeMAC);
    case "xoox":
      return g.intersectionPoint(planeB, planeC, planeMAD);
    case "oxxo":
      return g.intersectionPoint(planeA, planeD, planeMBC);
    case "oxox":
      return g.intersectionPoint(planeA, planeC, planeMBD);
    case "ooxx":
      return g.intersectionPoint(planeA, planeB, planeMCD);

    case "oxxx":
      return g.intersectionPoint(planeA, planeMBC, planeMCD);
    case "xoxx":
      return g.intersectionPoint(planeB, planeMAD, planeMCD);
    case "xxox":
      return g.intersectionPoint(planeC, planeMAD, planeMAB);
    case "xxxo":
      return g.intersectionPoint(planeD, planeMAC, planeMAB);

    default:
      return g.mean(pointA, pointB, pointC, pointD);
  }
}

function GetPositions(
  identicalCoordinates: string[][],
  labels: { [genPair: string]: [number, number] },
  ni: { [gen: string]: string }
) {
  const positions: { [key: string]: Vector3 } = {};

  // 初期頂点座標の生成
  const g = new MobiusGyrovectorSphericalSpace3();
  const { pointA, pointB, pointC, pointD } = GetFundamentalDomain(labels, g);
  console.log(pointA, pointB, pointC, pointD);
  // 単位領域内の頂点定義
  let Q0 = GetInitPoint(pointA, pointB, pointC, pointD, labels, ni, g);

  // 頂点座標の生成(gyrovector)
  for (let i = 0; i < identicalCoordinates.length; i++) {
    let Q = Q0;
    const coordinate = identicalCoordinates[i][0];
    for (let j = coordinate.length - 1; j >= 0; j--) {
      if (positions[coordinate.slice(j)]) {
        Q = positions[coordinate.slice(j)]!;
        continue;
      }
      if (coordinate[j] === "a") {
        Q = g.reflect(Q, pointB, pointC, pointD);
      } else if (coordinate[j] === "b") {
        Q = g.reflect(Q, pointA, pointD, pointC);
      } else if (coordinate[j] === "c") {
        Q = g.reflect(Q, pointD, pointA, pointB);
      } else if (coordinate[j] === "d") {
        Q = g.reflect(Q, pointC, pointB, pointA);
      }
      positions[coordinate.slice(j)] = Q;
    }
    positions[coordinate] = Q;
  }
  return positions;
}

// 面の重複を削除
function DedupePolygons(polygons: { coordinates: string[]; gens: string }[]) {
  const uniquePolygons = new Map<
    string,
    { coordinates: string[]; gens: string }
  >();

  for (const polygon of polygons) {
    // 最小の頂点を見つける
    let minVertex = polygon.coordinates[0];
    let minIndex = 0;
    for (let i = 1; i < polygon.coordinates.length; i++) {
      if (polygon.coordinates[i] < minVertex) {
        minVertex = polygon.coordinates[i];
        minIndex = i;
      }
    }

    // 最小頂点から始まる2つの回転を生成
    const rotated = polygon.coordinates
      .slice(minIndex)
      .concat(polygon.coordinates.slice(0, minIndex));
    const reversed = [polygon.coordinates[minIndex]].concat(
      [...rotated].reverse().slice(0, -1)
    );

    // 辞書順で小さい方をキーとして使用
    const key =
      rotated.join(",") < reversed.join(",")
        ? rotated.join(",")
        : reversed.join(",");

    uniquePolygons.set(key, { coordinates: rotated, gens: polygon.gens });
  }

  // 結果を元の配列に書き戻し
  polygons.length = 0;
  polygons.push(...Array.from(uniquePolygons.values()));
}

// 頂点の結合と不要な面の削除
function ArrangePolygons(
  polygons: { coordinates: string[]; gens: string }[],
  identicalCoordinates: string[][]
) {
  // 頂点のマッピングを事前に作成
  const vertexMap = new Map<string, string>();
  for (const group of identicalCoordinates) {
    const target = group[0];
    for (const vertex of group) {
      vertexMap.set(vertex, target);
    }
  }

  // 多角形を処理
  for (let i = polygons.length - 1; i >= 0; i--) {
    const p = polygons[i];

    // 不要な点の削除 - マップを使用して高速化
    for (let j = 0; j < p.coordinates.length; j++) {
      p.coordinates[j] = vertexMap.get(p.coordinates[j])!;
    }

    // 不要な辺の削除 - 配列の再割り当てを減らす
    let writeIndex = 0;
    for (let j = 0; j < p.coordinates.length; j++) {
      if (p.coordinates[j] !== p.coordinates[(j + 1) % p.coordinates.length]) {
        p.coordinates[writeIndex++] = p.coordinates[j];
      }
    }
    p.coordinates.length = writeIndex;

    // 不要な面の削除
    if (p.coordinates.length <= 2) {
      polygons.splice(i, 1);
    }
  }
}

function CreateAttributes(
  positions: { [key: string]: Vector3 },
  polygons: { coordinates: string[]; gens: string }[],
  mode: "transparent" | "frame"
) {
  switch (mode) {
    case "transparent": {
      // 面全体を半透明で描画する
      const indices: number[] = []; // 三角形リスト
      const vertices: number[] = []; // 頂点座標
      const uvs: number[] = []; // UV座標
      const UV_DIV = 10; // [0,1]^2 を分割する数値
      let indexOffset = 0;
      for (let i = 0; i < polygons.length; i++) {
        const p = polygons[i];
        for (let j = 0; j < p.coordinates.length - 2; j++) {
          const L = (Math.floor(j / 2) + 1) % p.coordinates.length;
          const H =
            (p.coordinates.length - Math.ceil(j / 2)) % p.coordinates.length;
          indices.push(
            indexOffset + H,
            indexOffset +
              (j % 2
                ? L + 1
                : (H + p.coordinates.length - 1) % p.coordinates.length),
            indexOffset + L
          );
        }
        for (let j = 0; j < p.coordinates.length; j++) {
          vertices.push(...positions[p.coordinates[j]].toArray());
          let n = p.coordinates.length >= 100 ? 0 : p.coordinates.length;
          uvs.push(
            (Math.cos((j * 2 * Math.PI) / n) / 2 + 0.5 + (n % UV_DIV)) / UV_DIV,
            (Math.sin((j * 2 * Math.PI) / n) / 2 +
              0.5 +
              Math.floor(n / UV_DIV)) /
              UV_DIV
          );
        }
        indexOffset += p.coordinates.length;
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
      const g = new MobiusGyrovectorSphericalSpace3();
      for (let i = 0; i < polygons.length; i++) {
        const c = COLORS[polygons[i].gens];
        const p = polygons[i].coordinates;
        const M = g.mean(...p.map((c) => positions[c]));
        for (let j = 0; j < p.length; j++) {
          const k = (j + 1) % p.length;
          indices.push(
            indexOffset + j,
            indexOffset + k,
            indexOffset + k + p.length,
            indexOffset + j,
            indexOffset + k + p.length,
            indexOffset + j + p.length
          );
          vertices.push(...positions[p[j]].toArray());
          colors.push(...c.map((c) => c * 0.1), 1);
        }
        for (let j = 0; j < p.length; j++) {
          vertices.push(...g.mix(positions[p[j]], M, 0.03).toArray());
          colors.push(...c, 1);
        }
        indexOffset += p.length * 2;
      }
      return {
        position: new BufferAttribute(new Float32Array(vertices), 3),
        color: new BufferAttribute(new Float32Array(colors), 4),
        indices: new BufferAttribute(new Uint32Array(indices), 1),
      };
    }
  }
}
