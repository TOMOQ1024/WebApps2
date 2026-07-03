import { getPermutations } from "./getPermutations";

/** 配列の全順列を生成する */
export function getAllPermutations<T>(items: T[]): T[][] {
  return getPermutations(items);
}
