import { appList } from "./appList.generated";
import type { AppEntry, AppListEntry } from "./types";
import type { AppTag } from "./types";

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

const TAG_DISPLAY_ORDER: AppTag[] = [
  "maths",
  "fractal",
  "geometry",
  "utility",
  "shader",
  "game",
  "experimental",
];

/** 公開アプリで使われているタグ（表示順） */
export function getPublishedAppTags(): AppTag[] {
  const used = new Set<AppTag>();
  for (const app of getPublishedApps()) {
    for (const tag of app.tags) {
      used.add(tag);
    }
  }
  return TAG_DISPLAY_ORDER.filter((tag) => used.has(tag));
}

/** 指定タグを持つ公開アプリを返す（tag 未指定時は全件） */
export function filterPublishedAppsByTag(tag?: AppTag): AppEntry[] {
  const apps = getPublishedApps();
  if (!tag) {
    return apps;
  }
  return apps.filter((app) => app.tags.includes(tag));
}

/** URL パラメータ等から有効な AppTag を取得 */
export function parseAppTag(value: string | undefined): AppTag | undefined {
  if (!value) {
    return undefined;
  }
  return TAG_DISPLAY_ORDER.includes(value as AppTag)
    ? (value as AppTag)
    : undefined;
}
