"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/SupabaseAuthProvider";
import { useRouter } from "next/navigation";

export default function MainWrapper() {
  const { user, loading, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (user) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>ログイン中: {user.email}</p>
        <button onClick={handleSignOut}>サインアウト</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>サインイン</h1>
      <form onSubmit={handleSignIn}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        {error && (
          <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
        )}
        <button type="submit" disabled={isLoading} style={{ width: "100%" }}>
          {isLoading ? "サインイン中..." : "サインイン"}
        </button>
      </form>
    </div>
  );
}

