export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  id?: string;
  status?: "draft" | "published";
  created_by?: string | null;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}
