import { getApps } from "@/lib/supabase/actions";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import styles from "./page.module.scss";

export const metadata = {
  title: "tomoq apps",
};

export default async function Home() {
  const apps = await getApps();

  return (
    <main className={styles.appsPage}>
      <section className={styles.heroSection}>
        <h1>Apps</h1>
        {/* <p>私のみたいものと，私のみたいものをつくるものをつくります．</p> */}
      </section>

      <section className={styles.appsGrid}>
        {apps.map((app) => {
          const hasWipTag = app.tags.some((tag) => tag.name === "wip");
          if (hasWipTag) {
            return null;
          }
          return (
            <Link
              key={app.path}
              href={`/apps/${app.path}`}
              className={styles.appCard}
              draggable={false}
            >
              <div className={styles.appIcon}>
                <ImageWithFallback
                  src={`/app-icons/${app.path}.png`}
                  width={128}
                  height={128}
                  alt={`App icon of ${app.app_name}`}
                  priority={false}
                />
              </div>
              <div className={styles.appName}>{app.app_name}</div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
