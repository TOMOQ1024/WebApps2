import { appList } from "./appList";
import { galleryList } from "./galleryList";

/**
 * サイト内の全ての有効なパスを生成する
 */
export function getAllPaths(): string[] {
  const paths: string[] = ["/", "/apps", "/galleries", "/works"];

  // appList からパスを生成
  for (const path of Object.keys(appList)) {
    paths.push(`/apps/${path}`);
  }

  // galleryList からパスを生成
  for (const path of Object.keys(galleryList)) {
    paths.push(`/galleries/${path}`);
  }

  return paths;
}
