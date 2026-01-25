import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import components from "../components/MDXComponents";
import TableOfContents from "../components/TableOfContents";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8 pb-6 border-b border-[var(--border-color)]">
        <h1 className="text-3xl font-bold m-0 mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          {formattedDate && (
            <time className="text-sm text-[var(--text-color)]">
              {formattedDate}
            </time>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blogs/tags/${encodeURIComponent(tag)}`}
                  className="px-3 py-1 text-xs border border-[var(--border-color)] no-underline hover:scale-105"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="flex gap-8 max-md:flex-col">
        <aside className="shrink-0 w-56 sticky top-20 self-start max-h-[calc(100vh-100px)] overflow-y-auto max-md:w-full max-md:static max-md:max-h-none max-md:p-4 max-md:border max-md:border-[var(--border-color)] max-md:mb-6">
          <TableOfContents content={post.content} />
        </aside>

        <div className="flex-1 min-w-0 leading-relaxed blog-content">
          <MDXRemote
            source={post.content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkMath],
                rehypePlugins: [
                  rehypeKatex,
                  rehypeSlug,
                  [rehypeAutolinkHeadings, { behavior: "wrap" }],
                ],
              },
            }}
          />
        </div>
      </div>

      <footer className="mt-12 pt-6 border-t border-[var(--border-color)]">
        <Link href="/blogs" className="text-sm text-[var(--text-color)]">
          ← ブログ一覧に戻る
        </Link>
      </footer>
    </article>
  );
}
