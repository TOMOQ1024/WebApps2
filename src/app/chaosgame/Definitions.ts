import Mat3 from "@/src/Mat3";
import Vec2 from "@/src/Vec2";

export type Seed = {
  mat: Mat3;
  p: number;
}[];

export const sFern: Seed = [
  {
    p: 0.01,
    mat: new Mat3(
      0.00, 0.00, 0.00,
      0.00, 0.16, 0.00,
      0.00, 0.00, 1.00,
    ),
  },
  {
    p: 0.85,
    mat: new Mat3(
      0.85, 0.04, 0.00,
      -.04, 0.85, 1.60,
      0.00, 0.00, 1.00,
    ),
  },
  {
    p: 0.07,
    mat: new Mat3(
      0.20, -.26, 0.00,
      0.23, 0.22, 1.60,
      0.00, 0.00, 1.00,
    ),
  },
  {
    p: 0.07,
    mat: new Mat3(
      -.15, 0.28, 0.00,
      0.26, 0.24, 0.44,
      0.00, 0.00, 1.00,
    ),
  },
];

export const s4Gasket: Seed = [
  {
    p: 1/4,
    mat: new Mat3(
      0.50, 0.00, 0.00,
      0.00, 0.50, 0.00,
      0.00, 0.00, 1.00,
    ),
  },
  {
    p: 1/4,
    mat: new Mat3(
      0.50, 0.00, 4.00,
      0.00, 0.50, 7.00,
      0.00, 0.00, 1.00,
    ),
  },
  {
    p: 1/4,
    mat: new Mat3(
      0.50, 0.00, -5.00,
      0.00, 0.50, 9.00,
      0.00, 0.00, 1.00,
    ),
  },
  {
    p: 1/4,
    mat: new Mat3(
      0.50, 0.00, 2.00,
      0.00, 0.50, 12.0,
      0.00, 0.00, 1.00,
    ),
  },
];

export const sGasket: Seed = [
  {
    p: 1/3,
    mat: new Mat3(
      0.50, 0.00, 0.00,
      0.00, 0.50, 0.00,
      0.00, 0.00, 1.00,
    ),
  },
  {
    p: 1/3,
    mat: new Mat3(
      0.50, 0.00, 4.00,
      0.00, 0.50, 9.00,
      0.00, 0.00, 1.00,
    ),
  },
  {
    p: 1/3,
    mat: new Mat3(
      0.50, 0.00, -4.00,
      0.00, 0.50, 9.00,
      0.00, 0.00, 1.00,
    ),
  },
];

export function sNFlake (N: number): Seed {
  const seeds_n_flake: Seed = [];
  const R = 1/2/(1+(n=>{
    let sum = 0;
    for(let k=1; k<=n; k++){
      sum += Math.cos(2*Math.PI*k/N)
    }
    return sum;
  })(Math.floor(N/4)));
  // seeds_n_flake.push({
  //   p: 1/(N+1),
  //   mat: Mat3.Identity.mixBy(Mat3.cMat(new Vec2(0, 0)), N%2 ? (1-R)/Math.cos(Math.PI/N)-R : 1-2*R)
  // });
  for (let i=0; i<N; i++) {
    seeds_n_flake.push({
      p: 1/(N),
      mat: Mat3.Identity.mixedBy(
        Mat3.cMat((new Vec2(11, 0)).rotatedBy(Math.PI*2/N*i)),
        R
      )
    });
  }
  return seeds_n_flake;
}