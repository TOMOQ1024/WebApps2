import { notFound, redirect } from "next/navigation";
import ArticleEditor from "../../components/ArticleEditor";
import { getArticleBySlug } from "@/lib/supabase/articles";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Not Found" };
  }

  return {
    title: `${article.title} を編集`,
  };
}

export default async function EditBlogPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/apps/signin?redirect=${encodeURIComponent(`/blogs/${slug}/edit`)}`,
    );
  }

  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  if (article.created_by !== user.id) {
    notFound();
  }

  return <ArticleEditor mode="edit" article={article} />;
}
