import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/features/blog/blogPosts";
import { MDXRemote } from "next-mdx-remote/rsc";
import { blogMdxOptions } from "@/features/blog/mdxOptions";
import components from "../components/MDXComponents";
import TableOfContents from "../components/TableOfContents";
import BlogPostEditLink from "../components/BlogPostEditLink";
import { BorderedButtonLink } from "@/components/BorderedButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

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
  const post = await getBlogPostBySlug(slug);

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
          {post.status === "draft" && (
            <span className="text-xs border border-[var(--border-color)] px-2 py-1">
              下書き
            </span>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <BorderedButtonLink
                  key={tag}
                  href={`/blogs/tags/${encodeURIComponent(tag)}`}
                  size="sm"
                >
                  {tag}
                </BorderedButtonLink>
              ))}
            </div>
          )}
        </div>
        <BlogPostEditLink
          slug={post.slug}
          createdBy={post.created_by ?? null}
        />
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
              mdxOptions: blogMdxOptions,
            }}
          />
        </div>
      </div>

      <footer className="mt-12 pt-6 border-t border-[var(--border-color)]">
        <BorderedButtonLink href="/blogs" size="sm">
          ← ブログ一覧に戻る
        </BorderedButtonLink>
      </footer>
    </article>
  );
}
