"use client";

import { useState, useTransition } from "react";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { requestPasswordReset } from "@/lib/supabase/auth-actions";
import { BorderedButton } from "@/components/BorderedButton";

export default function MainWrapper() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mailpitUrl, setMailpitUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const linkError = searchParams.get("error");
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await requestPasswordReset(email.trim());

      if (result.success) {
        setSuccess(true);
        setMailpitUrl(result.mailpitUrl ?? null);
      } else {
        setError(result.error || "送信に失敗しました");
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center p-8">
      <div className="w-full max-w-md border-2 border-[var(--border-color)] bg-[var(--background-color)] p-8">
        <h1 className="text-xl font-bold mb-6 text-center">
          パスワードリセット
        </h1>

        {linkError === "invalid_link" && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 border border-red-300">
            リセットリンクが無効か期限切れです．再度メールを送信してください．
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-3 text-sm text-green-600 bg-green-100 border border-green-300">
              登録されているメールアドレスの場合，パスワードリセット用のメールを送信しました．
            </div>
            {mailpitUrl && (
              <div className="p-3 text-sm border border-[var(--border-color)]">
                <p className="mb-2 opacity-70">
                  ローカル環境ではメールは実際には送信されません．Mailpit
                  で確認してください．
                </p>
                <a
                  href={mailpitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-70 break-all"
                >
                  {mailpitUrl}
                </a>
              </div>
            )}
            <p className="text-center text-sm text-[var(--text-color)] opacity-70">
              <Link
                href={`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`}
                className="underline hover:opacity-70"
              >
                サインインに戻る
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-[var(--text-color)] opacity-70">
              登録済みのメールアドレスを入力してください．パスワードリセット用のリンクを送信します．
            </p>

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
                  送信中...
                </>
              ) : (
                <>
                  <Mail size={16} />
                  リセットメールを送信
                </>
              )}
            </BorderedButton>

            <p className="text-center text-sm text-[var(--text-color)] opacity-70">
              <Link
                href={`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`}
                className="underline hover:opacity-70"
              >
                サインインに戻る
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
