import { BorderedButtonLink } from "@/components/BorderedButton";

type BlogTagNavProps = {
  tags: string[];
  activeTag?: string;
};

export default function BlogTagNav({ tags, activeTag }: BlogTagNavProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <nav
      className="flex flex-wrap items-center gap-2 mb-8 p-4 border-2 border-[var(--border-color)]"
      aria-label="タグで絞り込み"
    >
      <span className="text-sm text-[var(--text-color)] mr-2">タグ:</span>
      {tags.map((tag) => (
        <BorderedButtonLink
          key={tag}
          href={`/blogs/tags/${encodeURIComponent(tag)}`}
          size="sm"
          active={activeTag === tag}
        >
          {tag}
        </BorderedButtonLink>
      ))}
    </nav>
  );
}
