"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import styles from "./index.module.scss";

export default function Header() {
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(false);
  // const src = session && session.user?.image || '';

  function ToggleTheme() {
    console.log("toggle theme");
    setIsDark((d) => !d);
  }

  return (
    <header className={styles.header}>
      <Link href="/" className="title">
        tomoq.net
      </Link>
      <div>
        {session && (
          <>
            <button onClick={() => signOut()}>Sign out</button>
          </>
        )}
      </div>
    </header>
  );
}
