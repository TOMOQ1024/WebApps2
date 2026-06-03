"use client";

import { useState, useTransition } from "react";
import { Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/SupabaseAuthProvider";
import { updatePassword } from "@/lib/supabase/auth-actions";

export default function MainWrapper() {
  const { user, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(password);

      if (result.success) {
        router.push("/apps/signin");
        router.refresh();
      } else {
        setError(result.error || "パスワードの更新に失敗しました");
      }
    });
  };

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

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center p-8">
        <div className="w-full max-w-md border-2 border-[var(--border-color)] bg-[var(--background-color)] p-8 text-center">
          <h1 className="text-xl font-bold mb-4">新しいパスワードの設定</h1>
          <p className="text-sm text-[var(--text-color)] opacity-70 mb-6">
            メールに記載されたリンクからアクセスしてください．
          </p>
          <Link
            href="/apps/forgot-password"
            className="text-[var(--text-color)] underline hover:opacity-70"
          >
            パスワードリセットメールを送信
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center p-8">
      <div className="w-full max-w-md border-2 border-[var(--border-color)] bg-[var(--background-color)] p-8">
        <h1 className="text-xl font-bold mb-6 text-center">新しいパスワードの設定</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-[var(--text-color)] opacity-70 mb-1"
            >
              新しいパスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="6文字以上"
              className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] focus:outline-none focus:border-[var(--text-color)]"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm text-[var(--text-color)] opacity-70 mb-1"
            >
              新しいパスワード（確認）
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] focus:outline-none focus:border-[var(--text-color)]"
            />
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
                更新中...
              </>
            ) : (
              <>
                <KeyRound size={16} />
                パスワードを更新
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
