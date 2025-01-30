"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(false);
  // const src = session && session.user?.image || '';

  function ToggleTheme() {
    console.log("toggle theme");
    setIsDark((d) => !d);
  }

  return (
    <header>
      <Link href="/" className="title">
        tomoq apps
      </Link>
      {/* <input
      type='button'
      value='TOGGLE THEME(does not work)'
      onClick={e=>ToggleTheme()}
      /> */}
      <div>
        {session && (
          <>
            {/* name:{session.user?.name}
            image:
            <Image
              loader={() => src}
              unoptimized
              src={src}
              alt="icon"
              width={100}
              height={100}
            /> */}
            <button onClick={() => signOut()}>Sign out</button>
          </>
        )}
      </div>
    </header>
  );
}
