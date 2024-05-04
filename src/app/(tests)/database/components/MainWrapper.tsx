'use client';

import axios from "axios";
import { useSession } from "next-auth/react";

export default function MainWrapper() {
  const { data: session, status } = useSession();
  
  const get = async () => {
    const response = await axios.get("/api/dbtest/get");
    console.log(response);
  }

  const cre = async () => {
    const response = await axios.post(
      "/api/dbtest/create",
      { expression: prompt('expression?') || '' }
    );
    console.log(response);
  }

  const del = async () => {
    const response = await axios.post(
      "/api/dbtest/delete",
      { id: prompt('id?') || '' }
    );
    console.log(response);
  }
  
  return (
    <main id='main-wrapper'>
      <p>セッション：{session ? '有効': '無効'}</p>
      <button onClick={get}>GET</button>
      <button onClick={cre}>CREATE</button>
      <button onClick={del}>DELETE</button>
    </main>
  );
}
