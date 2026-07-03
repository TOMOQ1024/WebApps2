"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { findSimilarPaths } from "@/shared/routing/findSimilarPaths";

const mainLinks = [
  { href: "/apps", label: "Apps" },
  { href: "/galleries", label: "Galleries" },
  { href: "/blogs", label: "Blogs" },
];

export default function NotFoundPage({
  galleryPaths = [],
}: {
  galleryPaths?: string[];
}) {
  const pathname = usePathname();

  const similarPaths = useMemo(() => {
    return findSimilarPaths(pathname, 3, 8, galleryPaths);
  }, [pathname, galleryPaths]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <h1 className="text-5xl font-bold mb-2">404</h1>
      <p className="text-xl text-[var(--text-color)] opacity-80 mb-8">
        ページが見つかりません
      </p>

      <p className="text-sm text-[var(--text-color)] opacity-60 mb-6 font-mono">
        {pathname}
      </p>

      {similarPaths.length > 0 && (
        <div className="mb-8">
          <p className="text-sm text-[var(--text-color)] opacity-70 mb-3">
            もしかして:
          </p>
          <div className="flex flex-col gap-2">
            {similarPaths.map(({ path }) => (
              <Link
                key={path}
                href={path}
                className="no-underline font-mono font-semibold"
                draggable={false}
              >
                → {path}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm text-[var(--text-color)] opacity-70 mb-3">
          主要なページ:
        </p>
        <div className="flex gap-6 justify-center">
          {mainLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="no-underline font-semibold"
              draggable={false}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
