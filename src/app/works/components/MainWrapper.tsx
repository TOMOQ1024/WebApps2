"use client";

import { useAuth } from "@/components/SupabaseAuthProvider";
import React from "react";
import TimeLine from "./TimeLine";

export default function MainWrapper() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <main id="main-wrapper">
      <p>セッション：{user ? "有効" : "無効"}</p>
      {user && <p>ユーザー: {user.email}</p>}
      <p style={{ color: "gray" }}>
        注: CompDynamPost 関連の機能は廃止されました．
      </p>
      <TimeLine />
    </main>
  );
}
