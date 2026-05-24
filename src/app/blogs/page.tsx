import Link from "next/link";
import { getAllUnifiedPosts, getAllUnifiedTags } from "@/lib/blogPosts";
import BlogActions from "./components/BlogActions";
import BlogCard from "./components/BlogCard";

export const metadata = {
  title: "Blog",
  description: "ブログ記事一覧",
};

export default async function BlogsPage() {
  const posts = await getAllUnifiedPosts();
  const tags = await getAllUnifiedTags();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      <BlogActions />

      {tags.length > 0 && (
        <nav className="flex flex-wrap items-center gap-2 mb-8 p-4 border-2 border-[var(--border-color)]">
          <span className="text-sm text-[var(--text-color)] mr-2">タグ:</span>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blogs/tags/${encodeURIComponent(tag)}`}
              className="px-3 py-1 text-sm border border-[var(--border-color)] no-underline hover:scale-105"
            >
              {tag}
            </Link>
          ))}
        </nav>
      )}

      {posts.length === 0 ? (
        <p className="text-center text-[var(--text-color)] py-12">
          記事がありません．
        </p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <BlogCard key={`${post.source ?? "mdx"}-${post.slug}`} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
