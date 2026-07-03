import type { AppConfig } from "@/lib/apps/types";

export const appConfig = {
  appName: "Linear Attractor 2D",
  description: "複数のアフィン変換による2次元アトラクターを観察できるページ",
  status: "published",
  tags: ["maths", "fractal"],
  sortOrder: 5,
} satisfies AppConfig;
