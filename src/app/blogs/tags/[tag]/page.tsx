import { notFound } from "next/navigation";
import { getAllBlogTags, getBlogPostsByTag } from "@/features/blog/blogPosts";
import BlogCard from "../../components/BlogCard";
import BlogTagNav from "../../components/BlogTagNav";
import { BorderedButtonLink } from "@/components/BorderedButton";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `${decodedTag} の記事一覧`,
    description: `タグ「${decodedTag}」が付いた記事一覧`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = await getBlogPostsByTag(decodedTag);
  const allTags = await getAllBlogTags();

  if (posts.length === 0 && !allTags.includes(decodedTag)) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <BorderedButtonLink href="/blogs" size="sm" className="mb-4">
          ← ブログ一覧
        </BorderedButtonLink>
        <h1 className="flex items-center gap-2 text-2xl font-bold m-0 mb-2">
          <span className="font-normal text-[var(--text-color)]">タグ:</span>
          <span className="px-3 py-1 border border-[var(--border-color)]">
            {decodedTag}
          </span>
        </h1>
        <p className="m-0 text-sm text-[var(--text-color)]">
          {posts.length} 件の記事
        </p>
      </div>

      <BlogTagNav tags={allTags} activeTag={decodedTag} />

      {posts.length === 0 ? (
        <p className="text-center text-[var(--text-color)] py-12">
          このタグの記事はありません．
        </p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id ?? post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
