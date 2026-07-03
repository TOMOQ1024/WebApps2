export type AppStatus = "published" | "lab" | "archived";

export type AppTag =
  | "utility"
  | "game"
  | "maths"
  | "experimental"
  | "shader"
  | "fractal"
  | "geometry";

export type AppConfig = {
  appName: string;
  description?: string;
  status: AppStatus;
  tags: readonly AppTag[];
  /** 一覧表示順（小さいほど先．未指定は末尾） */
  sortOrder?: number;
};

export type AppListEntry = AppConfig;

export type AppList = Record<string, AppListEntry>;

export type AppEntry = AppListEntry & {
  path: string;
};
