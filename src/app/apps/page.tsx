import { appList } from "@/lib/appList";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.scss";

export const metadata = {
  title: "tomoq apps",
};

export default function Home() {
  return (
    <main className={styles.appsPage}>
      <section className={styles.heroSection}>
        <h1>Apps</h1>
        {/* <p>私のみたいものと，私のみたいものをつくるものをつくります．</p> */}
      </section>

      <section className={styles.appsGrid}>
        {Array.from(Object.entries(appList)).map(
          ([path, { appName, tags }]) => {
            if (tags.has("wip")) {
              return null;
            }
            return (
              <Link
                key={path}
                href={`/apps/${path}`}
                className={styles.appCard}
              >
                <div className={styles.appIcon}>
                  <Image
                    src={`/app-icons/${path}.png`}
                    width={128}
                    height={128}
                    alt={`App icon of ${appName}`}
                    priority={false}
                  />
                </div>
                <div className={styles.appName}>{appName}</div>
              </Link>
            );
          }
        )}
      </section>
    </main>
  );
}
