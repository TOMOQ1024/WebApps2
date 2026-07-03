import { fragmentShader as fBm } from "./fBm";
import { fragmentShader as honeycomb } from "./honeycomb";
import { fragmentShader as honeycombs } from "./honeycombs";
import { fragmentShader as hyperbolic_tiling_c3_botu } from "./hyperbolic-tiling-c3-botu";
import { fragmentShader as hyperbolic_tiling_c3 } from "./hyperbolic-tiling-c3";
import { fragmentShader as hyperbolic_tiling } from "./hyperbolic-tiling";
import { fragmentShader as icosidodecahedron } from "./icosidodecahedron";
import { fragmentShader as partial_grayscale } from "./partial-grayscale";
import { fragmentShader as perlinNoise } from "./perlinNoise";
import { fragmentShader as perlinNoise2 } from "./perlinNoise2";
import { fragmentShader as polyhedron } from "./polyhedron";
import { fragmentShader as r2_tiling } from "./r2_tiling";
import { fragmentShader as rgb_filter } from "./rgb_filter";
import { fragmentShader as sierpinski_carpet } from "./sierpinski-carpet";
import { fragmentShader as voronoi } from "./voronoi";
import { fragmentShader as zoom_bokasi } from "./zoom_bokasi";

export const fragmentShaders = {
  fBm: fBm,
  honeycomb: honeycomb,
  honeycombs: honeycombs,
  "hyperbolic-tiling-c3-botu": hyperbolic_tiling_c3_botu,
  "hyperbolic-tiling-c3": hyperbolic_tiling_c3,
  "hyperbolic-tiling": hyperbolic_tiling,
  icosidodecahedron: icosidodecahedron,
  "partial-grayscale": partial_grayscale,
  perlinNoise: perlinNoise,
  perlinNoise2: perlinNoise2,
  polyhedron: polyhedron,
  r2_tiling: r2_tiling,
  rgb_filter: rgb_filter,
  "sierpinski-carpet": sierpinski_carpet,
  voronoi: voronoi,
  zoom_bokasi: zoom_bokasi,
} as const satisfies Record<string, string>;

export type FragmentShaderName = keyof typeof fragmentShaders;

export function getFragmentShader(name: string): string | undefined {
  return fragmentShaders[name as FragmentShaderName];
}
