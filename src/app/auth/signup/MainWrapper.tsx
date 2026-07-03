"use client";

import { useState, useTransition } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/components/SupabaseAuthProvider";
import { BorderedButton } from "@/components/BorderedButton";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpWithUsername } from "@/lib/supabase/auth-actions";
import Link from "next/link";

export default function MainWrapper() {
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/";

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // パスワード確認
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    startTransition(async () => {
      const result = await signUpWithUsername(
        username.trim(),
        email.trim(),
        password,
        secretKey,
      );

      if (result.success) {
        setSuccess(true);
        // 成功後，サインインページにリダイレクト
        setTimeout(() => {
          router.push(
            `/auth/signin?redirect=${encodeURIComponent(redirectTo)}`,
          );
        }, 2000);
      } else {
        setError(result.error || "登録に失敗しました");
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

  if (user) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center p-8">
        <div className="w-full max-w-md border-2 border-[var(--border-color)] bg-[var(--background-color)] p-8 text-center">
          <p className="mb-4">既にログインしています</p>
          <Link
            href="/"
            className="text-[var(--text-color)] underline hover:opacity-70"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center p-8">
      <div className="w-full max-w-md border-2 border-[var(--border-color)] bg-[var(--background-color)] p-8">
        <h1 className="text-xl font-bold mb-6 text-center">アカウント登録</h1>

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-3 text-sm text-green-600 bg-green-100 border border-green-300">
              登録が完了しました。サインインページに移動します...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm text-[var(--text-color)] opacity-70 mb-1"
              >
                ユーザーネーム
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="3〜20文字の英数字"
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] focus:outline-none focus:border-[var(--text-color)]"
              />
            </div>

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
                パスワード（確認）
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

            <div>
              <label
                htmlFor="secretKey"
                className="block text-sm text-[var(--text-color)] opacity-70 mb-1"
              >
                登録キー
              </label>
              <input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
                autoComplete="off"
                placeholder="管理者から提供されたキー"
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] focus:outline-none focus:border-[var(--text-color)]"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-100 border border-red-300">
                {error}
              </div>
            )}

            <BorderedButton
              type="submit"
              disabled={isPending}
              className="w-full py-3 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  登録中...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  登録する
                </>
              )}
            </BorderedButton>

            <p className="text-center text-sm text-[var(--text-color)] opacity-70">
              既にアカウントをお持ちの方は{" "}
              <Link
                href={`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`}
                className="underline hover:opacity-70"
              >
                サインイン
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
