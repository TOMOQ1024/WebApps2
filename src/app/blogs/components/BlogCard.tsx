import Link from "next/link";
import type { BlogPostMeta } from "@/features/blog/types";

interface BlogCardProps {
  post: BlogPostMeta;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className="border-2 border-[var(--border-color)] hover:scale-105">
      <Link href={`/blogs/${post.slug}`} className="block p-6 no-underline">
        <h2 className="m-0 mb-2 text-xl font-semibold text-[var(--text-color)]">
          {post.title}
        </h2>
        {post.description && (
          <p className="m-0 mb-4 text-sm text-[var(--text-color)] leading-relaxed">
            {post.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {formattedDate && (
            <time className="text-[var(--text-color)]">{formattedDate}</time>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs border border-[var(--border-color)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
