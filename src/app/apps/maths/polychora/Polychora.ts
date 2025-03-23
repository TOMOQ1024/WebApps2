import {
  BufferAttribute,
  BufferGeometry,
  Vector2,
  Vector3,
  Vector3Tuple,
} from "three";
import { GyrovectorSpace2 } from "@/src/maths/GyrovectorSpace2";
import { CoxeterNode } from "@/src/maths/CoxeterNode";

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
  const g = new GyrovectorSpace2();
  g.curvature = 1;
  g.radius = 1;
  const a = Math.PI / labels.bc;
  const b = Math.PI / labels.ca;
  const c = Math.PI / labels.ab;
  const BC = g.acos(
    (Math.cos(a) + Math.cos(b) * Math.cos(c)) / (Math.sin(b) * Math.sin(c))
  );
  const CA = g.asin((g.sin(BC) * Math.sin(b)) / Math.sin(a));
  const AB = g.asin((g.sin(BC) * Math.sin(c)) / Math.sin(a));
  const A = new Vector2(0, 0);
  const B = g.mul(AB, new Vector2(g.tan(0.5), 0));
  const C = g.mul(CA, g.normalize(new Vector2(Math.cos(a), Math.sin(a))));

  // console.log(A, B, C);
  // console.log(g.line(g.v_2v1e(B, C, b, c / 2), A, B));

  // 群構造の構築
  const graph = new CoxeterNode(labels);
  await graph.build();

  const coordinates = [""];
  // graph.isSolved(undefined, coordinates);
  // console.log(coordinates);

  console.log(graph);
  console.log(graph.isSolved(undefined, coordinates) ? "solved" : "unsolved");
  console.log(`Elements: ${coordinates.length}`);
  coordinates[0] = "1";
  const pad =
    coordinates.reduce((p, s) => (p.length > s.length ? p : s)).length + 1;
  console.log(
    coordinates.reduce((p, s, i) => {
      return p.padEnd(pad) + s.padEnd(pad) + ((i + 1) % 8 ? "" : "\n");
    })
  );
  coordinates[0] = "";
  const nodes = graph.nodes(coordinates);

  const tmpGeometry = new BufferGeometry();
  tmpGeometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array([]), 3)
  );
  tmpGeometry.setAttribute(
    "normal",
    new BufferAttribute(new Float32Array([]), 3)
  );
  tmpGeometry.setIndex(new BufferAttribute(new Uint16Array([]), 1));
  return tmpGeometry;

  const positions: Vector2[] = []; // ジャイロベクトル平面上の頂点座標
  const polygons: number[][] = []; // 多角形

  // 重複した頂点の抽出
  const identicalIndices: number[][] = [];
  for (let i = 0; i < coordinates.length; i++) {
    if (identicalIndices.flat().indexOf(i) < 0) {
      identicalIndices.push(
        graph
          .getNodeAt(coordinates[i])!
          .getIdenticalNodes(ni)
          .map((v) => coordinates.indexOf(v))
      );
    }
  }
  // console.log(identicalIndices);

  // 単位領域内の頂点定義
  let Q0 = getInitPoint(g, A, B, C, a, b, c, ni);

  // 頂点座標の生成(gyrovector)
  for (let i = 0; i < identicalIndices.length; i++) {
    let Q = Q0;
    const coordinate = coordinates[identicalIndices[i][0]];
    for (let j = coordinate.length - 1; j >= 0; j--) {
      if (coordinate[j] === "a") {
        Q = g.reflect(Q, B, C);
      } else if (coordinate[j] === "b") {
        Q = g.reflect(Q, C, A);
      } else if (coordinate[j] === "c") {
        Q = g.reflect(Q, A, B);
      }
    }
    positions.push(Q);
  }
  console.log(positions);

  // snubによる面の追加
  const indicesToDelete: number[] = [];
  if (Object.values(ni).indexOf("s") >= 0) {
    for (let i = 0; i < identicalIndices.length; i++) {
      const ii = identicalIndices[i];
      const n = nodes[ii[0]];
      const co = n.coordinate;
      const sa = ni[0] === "s" ? (co.match(/a/g) ?? []).length : 0;
      const sb = ni[1] === "s" ? (co.match(/b/g) ?? []).length : 0;
      const sc = ni[2] === "s" ? (co.match(/c/g) ?? []).length : 0;
      if ((sa + sc + sb) % 2) continue;
      indicesToDelete.push(i);
      polygons.push([
        coordinates.indexOf(n.siblings.a!.coordinate),
        coordinates.indexOf(n.siblings.b!.coordinate),
        coordinates.indexOf(n.siblings.c!.coordinate),
      ]);
    }
  }

  // 多角形リストの作成(graphの破壊)
  for (let i = 0; i < coordinates.length; i++) {
    polygons.push(
      nodes[i].popPolygons(ni).map((co) => coordinates.indexOf(co))
    );
  }

  // 重複した頂点の結合
  arrangePolygons(polygons, identicalIndices);

  // snubによる頂点の削除
  for (let i = identicalIndices.length - 1; i >= 0; i--) {
    if (indicesToDelete.indexOf(i) >= 0) {
      positions.splice(i, 1);
      identicalIndices.splice(i, 1);
    }
  }
  for (let i = 0; i < polygons.length; i++) {
    const p = polygons[i];
    for (let j = 0; j < p.length; j++) {
      p[j] -= indicesToDelete.filter((d) => d <= p[j]).length;
    }
  }

  console.log(polygons);

  if (dual) {
    const newPositions: Vector2[] = [];
    const newPolygons: number[][] = [];
    for (let i = 0; i < polygons.length; i++) {
      newPositions.push(g.mean(...polygons[i].map((p) => positions[p])));
    }
    for (let i = 0; i < positions.length; i++) {
      const newPolygon: number[] = [];
      for (let j = 0; j < polygons.length; j++) {
        if (polygons[j].indexOf(i) >= 0) {
          newPolygon.push(j);
        }
      }
      newPolygons.push([]);
      let p = 0;
      while (true) {
        if (p < 0) break;
        newPolygons[i].push(newPolygon[p]);
        let neighbor =
          polygons[newPolygon[p]][
            (polygons[newPolygon[p]].indexOf(i) -
              1 +
              polygons[newPolygon[p]].length) %
              polygons[newPolygon[p]].length
          ];
        p = newPolygon.findIndex(
          (n) =>
            newPolygons[i].indexOf(n) < 0 && polygons[n].indexOf(neighbor) >= 0
        );
      }
    }
    console.log(newPolygons);

    positions.splice(0, positions.length);
    positions.push(...newPositions);
    polygons.splice(0, polygons.length);
    polygons.push(...newPolygons);
  }

  console.log(polygons);

  // 三角形リストの作成
  const order: number[] = [];
  for (let i = 0; i < polygons.length; i++) {
    const p = polygons[i];
    for (let j = 0; j < p.length - 2; j++) {
      const L = (Math.floor(j / 2) + 1) % p.length;
      const H = (p.length - Math.ceil(j / 2)) % p.length;
      order.push(p[H], p[j % 2 ? L + 1 : (H + p.length - 1) % p.length], p[L]);
    }
  }

  // console.log(order);

  const vertices = new Float32Array(
    positions
      .map((p) => {
        const l = p.length();
        const t = p
          .clone()
          .multiplyScalar(1 / (l * l + 1))
          .toArray();
        return new Vector3(t[0], t[1], (l * l) / (l * l + 1) - 0.5);
      })
      .map((p) => p.toArray())
      .flat()
  );
  const indices = new Uint16Array(order);

  console.log(vertices);

  const geometry = new BufferGeometry();
  geometry.setAttribute("normal", new BufferAttribute(vertices, 3));
  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  return geometry;
}

function getInitPoint(
  g: GyrovectorSpace2,
  A: Vector2,
  B: Vector2,
  C: Vector2,
  a: number,
  b: number,
  c: number,
  ni: { [gen: string]: string }
) {
  let Q0: Vector2;
  return g.incenter(A, B, C);

  return Q0;
}

// 面の配列を整える
function arrangePolygons(polygons: number[][], identicalIndices: number[][]) {
  for (let i = 0; i < polygons.length; i++) {
    const p = polygons[i];
    // 不要な点の削除
    for (let j = 0; j < p.length; j++) {
      p[j] = identicalIndices.findIndex((ii) => ii.indexOf(p[j]) >= 0);
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
