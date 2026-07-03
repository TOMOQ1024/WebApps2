import { Levenshtein } from "@/shared/Levenshtein";
import { getAllPaths } from "./allPaths";

export type SimilarPath = {
  path: string;
  distance: number;
};

/**
 * 入力されたパスに類似したパスを見つける
 * @param inputPath 入力されたパス
 * @param maxResults 最大結果数
 * @param maxDistance 最大距離（これより遠いパスは除外）
 */
export function findSimilarPaths(
  inputPath: string,
  maxResults = 3,
  maxDistance = 10,
  galleryPaths: string[] = [],
): SimilarPath[] {
  const allPaths = getAllPaths(galleryPaths);
  const normalizedInput = inputPath.toLowerCase();

  const results: SimilarPath[] = allPaths
    .map((path) => ({
      path,
      distance: Levenshtein(normalizedInput, path.toLowerCase()),
    }))
    .filter((item) => item.distance <= maxDistance && item.distance > 0)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);

  return results;
}
