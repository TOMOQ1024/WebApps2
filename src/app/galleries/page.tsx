import { galleryList } from "@/lib/galleryList";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.scss";

export const metadata = {
  title: "tomoq galleries",
};

export default function Home() {
  return (
    <main className={styles.galleriesPage}>
      <section className={styles.heroSection}>
        <h1>Galleries</h1>
        {/* <p>私のみたいものと，私のみたいものをつくるものをつくります．</p> */}
      </section>

      <section className={styles.appsGrid}>
        {Array.from(Object.entries(galleryList)).map(
          ([path, { galleryName, tags }]) => {
            return (
              <Link
                key={path}
                href={`/galleries/${path}`}
                className={styles.galleryCard}
              >
                <div className={styles.galleryIcon}>
                  <Image
                    src={`/gallery-icons/${path}.png`}
                    width={128}
                    height={128}
                    alt={`Gallery icon of ${galleryName}`}
                    priority={false}
                  />
                </div>
                <div className={styles.galleryName}>{galleryName}</div>
              </Link>
            );
          }
        )}
      </section>
    </main>
  );
}
