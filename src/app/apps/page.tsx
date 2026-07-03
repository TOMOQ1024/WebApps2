import {
  filterPublishedAppsByTag,
  getPublishedAppTags,
  parseAppTag,
} from "@/shared/apps";
import AppsGrid from "./components/AppsGrid";
import TagFilter from "./components/TagFilter";
import styles from "./page.module.scss";

export const metadata = {
  title: "tomoq apps",
};

type AppsPageProps = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function AppsPage({ searchParams }: AppsPageProps) {
  const { tag: tagParam } = await searchParams;
  const activeTag = parseAppTag(tagParam);
  const tags = getPublishedAppTags();
  const apps = filterPublishedAppsByTag(activeTag);

  return (
    <main className={styles.appsPage}>
      <section className={styles.heroSection}>
        <h1>Apps</h1>
      </section>

      <TagFilter tags={tags} activeTag={activeTag} />
      <AppsGrid apps={apps} />
    </main>
  );
}
