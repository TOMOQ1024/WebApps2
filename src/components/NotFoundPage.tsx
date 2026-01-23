"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { findSimilarPaths } from "@/lib/findSimilarPaths";

const mainLinks = [
  { href: "/apps", label: "Apps" },
  { href: "/galleries", label: "Galleries" },
  { href: "/works", label: "Works" },
];

export default function NotFoundPage() {
  const pathname = usePathname();

  const similarPaths = useMemo(() => {
    return findSimilarPaths(pathname, 3, 8);
  }, [pathname]);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: "1.25rem",
          color: "var(--text-color)",
          opacity: 0.8,
          marginBottom: "2rem",
        }}
      >
        ページが見つかりません
      </p>

      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--text-color)",
          opacity: 0.6,
          marginBottom: "1.5rem",
          fontFamily: "monospace",
        }}
      >
        {pathname}
      </p>

      {similarPaths.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-color)",
              opacity: 0.7,
              marginBottom: "0.75rem",
            }}
          >
            もしかして:
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {similarPaths.map(({ path }) => (
              <Link
                key={path}
                href={path}
                style={{
                  color: "var(--link-color, #0070f3)",
                  textDecoration: "none",
                  fontFamily: "monospace",
                }}
              >
                → {path}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-color)",
            opacity: 0.7,
            marginBottom: "0.75rem",
          }}
        >
          主要なページ:
        </p>
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
          }}
        >
          {mainLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                color: "var(--link-color, #0070f3)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
