import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import type { AppEntry } from "@/shared/apps/types";
import styles from "../page.module.scss";

type AppsGridProps = {
  apps: AppEntry[];
};

export default function AppsGrid({ apps }: AppsGridProps) {
  if (apps.length === 0) {
    return (
      <p className="text-center text-lg max-w-[1200px] mx-auto">
        該当するアプリはありません．
      </p>
    );
  }

  return (
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
  );
}
