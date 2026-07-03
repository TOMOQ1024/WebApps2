"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/shared/hooks/useTheme";

const getSiteName = () => {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
  switch (env) {
    case "production":
      return "tomoq.net";
    case "preview":
      return "preview.tomoq.net";
    default:
      return "development.tomoq.net";
  }
};

export default function Header() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const { theme, toggleTheme } = useTheme();
  const siteName = getSiteName();

  const buildPath = (index: number) => {
    return `/${pathSegments.slice(0, index + 1).join("/")}`;
  };

  return (
    <header className="fixed inset-x-0 top-0 h-[var(--header-height)] z-[100] border-b-2 border-[var(--border-color)] flex items-center justify-between px-4 md:px-8 bg-transparent">
      {/* テキストコンテンツ */}
      <div className="relative flex items-center gap-2 text-xl whitespace-nowrap">
        <Link
          href="/"
          className="no-underline font-medium transition-transform inline-block hover:scale-105"
          draggable={false}
        >
          {siteName}
        </Link>
        {pathSegments.length > 0 && (
          <>
            <span className="text-gray-500">/</span>
            <div className="flex items-center gap-2">
              {pathSegments.map((segment, index) => (
                <div key={buildPath(index)} className="flex items-center gap-2">
                  <Link
                    href={buildPath(index)}
                    className="no-underline transition-transform inline-block hover:scale-105"
                    draggable={false}
                  >
                    {segment}
                  </Link>
                  {index < pathSegments.length - 1 && (
                    <span className="text-gray-500">/</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* クリック専用ボタン */}
      <button
        type="button"
        onClick={toggleTheme}
        className="relative w-8 h-8 z-[200] bg-transparent cursor-pointer"
        style={{ border: "none" }}
        aria-label={`テーマを切り替え: 現在 ${theme}`}
      />
    </header>
  );
}
