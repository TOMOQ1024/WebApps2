"use client";

import { useState, useTransition } from "react";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/SupabaseAuthProvider";
import { signInWithEmail } from "@/lib/supabase/auth-actions";
import Link from "next/link";

export default function MainWrapper() {
  const { user, loading, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  // リダイレクト先を取得（指定がなければホームに）
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signInWithEmail(email.trim(), password);

      if (result.success) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(result.error || "サインインに失敗しました");
      }
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  // ユーザーネームを取得（user_metadata から）
  const displayName = user?.user_metadata?.username || user?.email?.split("@")[0] || "ユーザー";

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[var(--text-color)] opacity-70">
          <Loader2 size={20} className="animate-spin" />
          読み込み中...
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center p-8">
        <div className="w-full max-w-md border-2 border-[var(--border-color)] bg-[var(--background-color)] p-8">
          <h1 className="text-xl font-bold mb-6 text-center">アカウント</h1>

          <div className="mb-6 p-4 border border-[var(--border-color)]">
            <p className="text-sm text-[var(--text-color)] opacity-70 mb-1">
              ログイン中
            </p>
            <p className="font-medium break-all">{displayName}</p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full py-3 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] hover:scale-[0.98] active:invert flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            サインアウト
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center p-8">
      <div className="w-full max-w-md border-2 border-[var(--border-color)] bg-[var(--background-color)] p-8">
        <h1 className="text-xl font-bold mb-6 text-center">サインイン</h1>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-[var(--text-color)] opacity-70 mb-1"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] focus:outline-none focus:border-[var(--text-color)]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-[var(--text-color)] opacity-70 mb-1"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] focus:outline-none focus:border-[var(--text-color)]"
            />
            <p className="mt-2 text-right text-sm">
              <Link
                href={`/apps/forgot-password?redirect=${encodeURIComponent(redirectTo)}`}
                className="text-[var(--text-color)] opacity-70 underline hover:opacity-100"
              >
                パスワードを忘れた方
              </Link>
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-100 border border-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] hover:scale-[0.98] active:invert disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                サインイン中...
              </>
            ) : (
              <>
                <LogIn size={16} />
                サインイン
              </>
            )}
          </button>

          <p className="text-center text-sm text-[var(--text-color)] opacity-70">
            アカウントをお持ちでない方は{" "}
            <Link
              href={`/apps/signup?redirect=${encodeURIComponent(redirectTo)}`}
              className="underline hover:opacity-70"
            >
              登録
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
