import { BorderedButtonLink } from "@/components/BorderedButton";
import { createClient } from "@/shared/supabase/server";

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
      <BorderedButtonLink href="/blogs/new">記事を投稿</BorderedButtonLink>
      <BorderedButtonLink href="/blogs/manage">自分の記事</BorderedButtonLink>
    </nav>
  );
}
