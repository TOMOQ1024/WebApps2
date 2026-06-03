"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match: RegExpExecArray | null;

  // biome-ignore lint/suspicious/noAssignInExpressions: intentional regex exec loop
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2]
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .trim();

    const id = text
      .toLowerCase()
      .replace(/[^\w\s\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    headings.push({ id, text, level });
  }

  return headings;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = extractHeadings(content);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    const headingElements = document.querySelectorAll("h1, h2, h3, h4");
    for (const element of headingElements) {
      observer.observe(element);
    }

    return () => {
      for (const element of headingElements) {
        observer.unobserve(element);
      }
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  const getLevelPadding = (level: number) => {
    if (level === 2) return "pl-4";
    if (level === 3) return "pl-8";
    if (level === 4) return "pl-12";
    return "";
  };

  return (
    <nav aria-label="目次" className="text-sm">
      <h2 className="text-sm font-semibold mb-3 text-[var(--text-color)]">
        目次
      </h2>
      <ul className="list-none m-0 p-0">
        {headings.map((heading) => (
          <li key={heading.id} className={getLevelPadding(heading.level)}>
            <a
              href={`#${heading.id}`}
              className={`block py-1 no-underline border-l-2 pl-3 -ml-3 transition-opacity ${
                activeId === heading.id
                  ? "opacity-100 border-[var(--border-color)] font-medium"
                  : "opacity-60 border-transparent hover:opacity-100"
              }`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(heading.id);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                  window.history.pushState(null, "", `#${heading.id}`);
                }
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
