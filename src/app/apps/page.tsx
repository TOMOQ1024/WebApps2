import { getPublishedApps } from "@/lib/appList";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import styles from "./page.module.scss";

export const metadata = {
  title: "tomoq apps",
};

export default function Home() {
  const apps = getPublishedApps();

  return (
    <main className={styles.appsPage}>
      <section className={styles.heroSection}>
        <h1>Apps</h1>
        {/* <p>私のみたいものと，私のみたいものをつくるものをつくります．</p> */}
      </section>

      <section className={styles.appsGrid}>
        {apps.map((app) => (
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
                alt={`App icon of ${app.appName}`}
                priority={false}
              />
            </div>
            <div className={styles.appName}>{app.appName}</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
