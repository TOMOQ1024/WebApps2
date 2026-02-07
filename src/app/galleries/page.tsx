import { getGalleries } from "@/lib/supabase/actions";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import styles from "./page.module.scss";

export const metadata = {
  title: "tomoq galleries",
};

export default async function Home() {
  const galleries = await getGalleries();

  return (
    <main className={styles.galleriesPage}>
      <section className={styles.heroSection}>
        <h1>Galleries</h1>
        {/* <p>私のみたいものと，私のみたいものをつくるものをつくります．</p> */}
      </section>

      <section className={styles.appsGrid}>
        {galleries.map((gallery) => (
          <Link
            key={gallery.path}
            href={`/galleries/${gallery.path}`}
            className={styles.galleryCard}
            draggable={false}
          >
            <div className={styles.galleryIcon}>
              <ImageWithFallback
                src={`/gallery-icons/${gallery.path}.png`}
                width={128}
                height={128}
                alt={`Gallery icon of ${gallery.gallery_name}`}
                priority={false}
              />
            </div>
            <div className={styles.galleryName}>{gallery.gallery_name}</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
