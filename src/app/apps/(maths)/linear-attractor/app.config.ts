import type { AppConfig } from "@/lib/apps/types";

export const appConfig = {
  appName: "Linear Attractor",
  description: "複数のアフィン変換による3次元アトラクターを観察できるページ",
  status: "published",
  tags: ["maths", "fractal"],
  sortOrder: 8,
} satisfies AppConfig;
