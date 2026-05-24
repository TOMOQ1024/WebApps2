"use client";

import Link from "next/link";
import { useAuth } from "@/components/SupabaseAuthProvider";

interface BlogPostEditLinkProps {
  slug: string;
  createdBy: string | null;
}

export default function BlogPostEditLink({
  slug,
  createdBy,
}: BlogPostEditLinkProps) {
  const { user, loading } = useAuth();

  if (loading || !user || !createdBy || user.id !== createdBy) {
    return null;
  }

  return (
    <div className="mt-4">
      <Link href={`/blogs/${slug}/edit`} className="text-sm text-[var(--text-color)]">
        編集する
      </Link>
    </div>
  );
}
