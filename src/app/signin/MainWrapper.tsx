'use client';
import { signIn, useSession } from "next-auth/react";

export default function MainWrapper(){
  const { data: session, status } = useSession();
  const loading = status === "loading";
  console.log('api_base_url: ' + process.env.NEXT_PUBLIC_API_BASE_URL);

  return (
    <div>
      <button onClick={()=>signIn()}>Sign in</button>
    </div>
  )
}
