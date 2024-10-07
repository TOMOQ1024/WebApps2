'use client';
import { signIn, useSession } from "next-auth/react";

export default function MainWrapper(){
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <div>
      <button onClick={()=>signIn()}>Sign in</button>
    </div>
  )
}
