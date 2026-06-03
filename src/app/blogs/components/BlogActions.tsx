import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function BlogActions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <nav className="flex flex-wrap gap-3 mb-8" aria-label="ブログ操作">
      <Link
        href="/blogs/new"
        className="px-4 py-2 border-2 border-[var(--text-color)] no-underline hover:opacity-80"
      >
        記事を投稿
      </Link>
      <Link
        href="/blogs/manage"
        className="px-4 py-2 border-2 border-[var(--border-color)] no-underline hover:opacity-80"
      >
        自分の記事
      </Link>
    </nav>
  );
}
