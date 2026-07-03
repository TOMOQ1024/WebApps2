import { appList } from "./appList.generated";
import type { AppEntry, AppListEntry } from "./types";

export { appList } from "./appList.generated";
export type {
  AppConfig,
  AppEntry,
  AppList,
  AppListEntry,
  AppStatus,
  AppTag,
} from "./types";

/** 登録済みアプリの全エントリ（sortOrder 順） */
export function getAppEntries(): AppEntry[] {
  return Object.entries(appList)
    .sort(([, a], [, b]) => {
      const orderA = (a as AppListEntry).sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = (b as AppListEntry).sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return 0;
    })
    .map(([path, app]) => ({ path, ...app }));
}

/** 一覧に表示するアプリ（status: published） */
export function getPublishedApps(): AppEntry[] {
  return getAppEntries().filter((app) => app.status === "published");
}
