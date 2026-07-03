import Link from "next/link";
import { redirect } from "next/navigation";
import ArticleEditor from "../components/ArticleEditor";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "記事を投稿",
  description: "新しいブログ記事を投稿",
};

export default async function NewBlogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/blogs/new");
  }

  return <ArticleEditor mode="create" />;
}
