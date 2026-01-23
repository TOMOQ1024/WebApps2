"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../ThemeToggle";

export default function Header() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const buildPath = (index: number) => {
    return `/${pathSegments.slice(0, index + 1).join("/")}`;
  };

  return (
    <header className="fixed inset-x-0 top-0 h-[var(--header-height)] z-[1000] bg-[var(--background-color)] border-b-2 border-[var(--border-color)] flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-2 text-xl whitespace-nowrap">
        <Link href="/" className="no-underline font-medium">
          tomoq.net
        </Link>
        {pathSegments.length > 0 && (
          <>
            <span className="text-gray-500">/</span>
            <div className="flex items-center gap-2">
              {pathSegments.map((segment, index) => (
                <div key={buildPath(index)} className="flex items-center gap-2">
                  <Link href={buildPath(index)} className="no-underline">
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
      <ThemeToggle />
    </header>
  );
}
