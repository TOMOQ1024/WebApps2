import { getAllBlogPosts, getAllBlogTags } from "@/features/blog/blogPosts";
import BlogActions from "./components/BlogActions";
import BlogCard from "./components/BlogCard";
import BlogTagNav from "./components/BlogTagNav";

export const metadata = {
  title: "Blog",
  description: "ブログ記事一覧",
};

export default async function BlogsPage() {
  const posts = await getAllBlogPosts();
  const tags = await getAllBlogTags();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      <BlogActions />

      {tags.length > 0 && <BlogTagNav tags={tags} />}

      {posts.length === 0 ? (
        <p className="text-center text-[var(--text-color)] py-12">
          記事がありません．
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
