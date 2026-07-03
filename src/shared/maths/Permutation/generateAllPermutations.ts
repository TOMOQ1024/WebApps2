import { generatePermutations } from "./generatePermutations";

/** 配列の全順列を生成する（反復可能な実装） */
export function* generateAllPermutations<T>(items: T[]): Generator<T[]> {
  yield* generatePermutations(items);
}
