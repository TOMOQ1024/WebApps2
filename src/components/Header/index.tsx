"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../ThemeToggle";
import styles from "./index.module.scss";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const buildPath = (index: number) => {
    return "/" + pathSegments.slice(0, index + 1).join("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.titleContainer}>
        <Link href="/" className={styles.homeLink}>
          tomoq.net
        </Link>
        {pathSegments.length > 0 && (
          <>
            <span className={styles.pathSeparator}>/</span>
            <div className={styles.pathLinks}>
              {pathSegments.map((segment, index) => (
                <div key={index} className={styles.pathSegment}>
                  <Link href={buildPath(index)} className={styles.pathLink}>
                    {segment}
                  </Link>
                  {index < pathSegments.length - 1 && (
                    <span className={styles.pathSeparator}>/</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className={styles.buttonContainer}>{/* <ThemeToggle /> */}</div>
      {/* <div className={styles.authContainer}>
        {session && (
          <button onClick={() => signOut()} className={styles.signOutButton}>
            Sign out
          </button>
        )}
      </div> */}
    </header>
  );
}
