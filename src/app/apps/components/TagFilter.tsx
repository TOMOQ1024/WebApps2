import type { AppTag } from "@/shared/apps/types";
import { BorderedButtonLink } from "@/components/BorderedButton";

type TagFilterProps = {
  tags: AppTag[];
  activeTag?: AppTag;
};

export default function TagFilter({ tags, activeTag }: TagFilterProps) {
  return (
    <nav
      className="flex flex-wrap gap-2 justify-center max-w-[1200px] mx-auto mb-8"
      aria-label="タグで絞り込み"
    >
      <BorderedButtonLink href="/apps" active={activeTag === undefined}>
        All
      </BorderedButtonLink>
      {tags.map((tag) => (
        <BorderedButtonLink
          key={tag}
          href={`/apps?tag=${tag}`}
          active={activeTag === tag}
        >
          {tag}
        </BorderedButtonLink>
      ))}
    </nav>
  );
}
