import type { AppConfig } from "@/shared/apps/types";

export const appConfig = {
  appName: "GLSL Filter",
  description: "GLSL シェーダーフィルタの実験ページ",
  status: "published",
  tags: ["utility", "shader"],
  sortOrder: 10,
} satisfies AppConfig;
