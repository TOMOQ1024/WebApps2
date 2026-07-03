import { appList } from "@/shared/apps";

/**
 * サイト内の有効なパスを生成する
 * @param galleryPaths Supabase の galleries.path（サーバー側で取得）
 */
export function getAllPaths(galleryPaths: string[] = []): string[] {
  const paths: string[] = ["/", "/apps", "/galleries", "/blogs"];

  for (const path of Object.keys(appList)) {
    paths.push(`/apps/${path}`);
  }

  for (const path of galleryPaths) {
    paths.push(`/galleries/${path}`);
  }

  // Note: ブログのパスは fs モジュールを使用するため、
  // クライアントコンポーネントからは取得できない

  return paths;
}
