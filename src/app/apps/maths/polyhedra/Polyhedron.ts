import {
  BufferAttribute,
  BufferGeometry,
  Vector2,
  Vector3,
  Vector3Tuple,
} from "three";
import { GyrovectorSpace2 } from "./Math";
import { CoxeterNode3 } from "./CoxeterNode";

/**
 * 多面体のモデルを生成する．
 * @param mx ノード間ラベル
 * @param ni ノードの種類 (o|x|s){3}
 * @param dual 双対
 *
 * @example
 * CreatePolyhedron(4,3,2,0,1,0) -> Cube
 */
export function CreatePolyhedron(
  ma: number,
  mb: number,
  mc: number,
  ni: string,
  dual: boolean
) {
  const g = new GyrovectorSpace2();
  g.curvature = 1;
  g.radius = 1;
  const a = Math.PI / ma;
  const b = Math.PI / mb;
  const c = Math.PI / mc;
  const BC = g.acos(
    (Math.cos(a) + Math.cos(b) * Math.cos(c)) / (Math.sin(b) * Math.sin(c))
  );
  const CA = g.asin((g.sin(BC) * Math.sin(b)) / Math.sin(a));
  const AB = g.asin((g.sin(BC) * Math.sin(c)) / Math.sin(a));
  const A = new Vector2(0, 0);
  const B = g.mul(AB, new Vector2(g.tan(0.5), 0));
  const C = g.mul(CA, g.normalize(new Vector2(Math.cos(a), Math.sin(a))));

  // 群構造の構築
  const graph = new CoxeterNode3(ma, mb, mc);
  graph.build();

  // console.log(graph);
  // console.log(graph.isSolved(50, coordinates));
  // console.log(coordinates.length);
  // coordinates[0] = "1";
  // console.log(
  //   coordinates.reduce((p, s, i) => {
  //     return p.padEnd(5) + s.padEnd(5) + ((i + 1) % 4 ? "" : "\n");
  //   })
  // );

  const coordinates = [""];
  graph.isSolved(undefined, coordinates);
  console.log(coordinates);

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
  let Q0: Vector2;
  if (ni === "xxx") {
    Q0 = g.incenter(A, B, C);
  } else if (ni === "oxx") {
    Q0 = g.v_2v1e(C, A, c, a / 2);
  } else if (ni === "xox") {
    Q0 = g.v_2v1e(A, B, a, b / 2);
  } else if (ni === "xxo") {
    Q0 = g.v_2v1e(B, C, b, c / 2);
  } else if (ni === "oox") {
    Q0 = C.clone();
  } else if (ni === "oxo") {
    Q0 = B.clone();
  } else if (ni === "xoo") {
    Q0 = A.clone();
  } else {
    Q0 = new Vector2(0.1, 0.1);
  }

  // 頂点座標の生成(gyrovector)
  const positions: Vector2[] = []; // ジャイロベクトル平面上の頂点座標
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
  // console.log(positions);

  // 多角形リストの作成(graphの破壊)
  const nodes = graph.nodes(coordinates);
  const polygons: number[][] = [];
  for (let i = 0; i < coordinates.length; i++) {
    polygons.push(nodes[i].popPolygonA().map((co) => coordinates.indexOf(co)));
    polygons.push(nodes[i].popPolygonB().map((co) => coordinates.indexOf(co)));
    polygons.push(nodes[i].popPolygonC().map((co) => coordinates.indexOf(co)));
  }

  // 重複した頂点の結合
  for (let i = 0; i < polygons.length; i++) {
    const p = polygons[i];
    for (let j = 0; j < p.length; j++) {
      p[j] = identicalIndices.findIndex((ii) => ii.indexOf(p[j]) >= 0);
    }
    for (let j = 0; j < p.length; j++) {
      if (p[j] === p[(j + 1) % p.length]) {
        p.splice(j, 1);
        j--;
      }
    }
    if (p.length <= 2) {
      polygons.splice(i, 1);
      i--;
    }
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

  const geometry = new BufferGeometry();
  geometry.setAttribute("normal", new BufferAttribute(vertices, 3));
  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  return geometry;
}
