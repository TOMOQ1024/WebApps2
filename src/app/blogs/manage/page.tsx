import Link from "next/link";
import { redirect } from "next/navigation";
import BlogCard from "../components/BlogCard";
import { createClient } from "@/lib/supabase/server";
import { articleToBlogMeta, getMyArticles } from "@/lib/supabase/articles";

export const metadata = {
  title: "自分の記事",
  description: "投稿した記事の管理",
};

export default async function ManageBlogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/apps/signin?redirect=/blogs/manage");
  }

  const articles = await getMyArticles();
  const posts = articles.map(articleToBlogMeta);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/blogs" className="text-sm text-[var(--text-color)]">
          ← ブログ一覧
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">自分の記事</h1>
        <p className="text-sm text-[var(--text-color)] m-0">
          下書きと公開済みの記事を管理できます．
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-[var(--text-color)] py-12">
          まだ記事がありません．
        </p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <div key={post.id} className="grid gap-2">
              <BlogCard post={post} />
              <div className="flex flex-wrap gap-3 px-1">
                <span className="text-xs border border-[var(--border-color)] px-2 py-1">
                  {post.status === "published" ? "公開中" : "下書き"}
                </span>
                <Link
                  href={`/blogs/${post.slug}/edit`}
                  className="text-sm text-[var(--text-color)]"
                >
                  編集
                </Link>
                {post.status === "published" && (
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="text-sm text-[var(--text-color)]"
                  >
                    表示
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
