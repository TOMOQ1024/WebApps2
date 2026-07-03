"use server";

import { createClient } from "./server";
import { getSiteUrl, isLocalSupabase, MAILPIT_URL } from "./site-url";

/**
 * メールアドレスのバリデーション
 */
function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim();

  if (!trimmed) {
    return { valid: false, error: "メールアドレスを入力してください" };
  }

  // 簡易的なメールアドレスチェック
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { valid: false, error: "有効なメールアドレスを入力してください" };
  }

  return { valid: true };
}

/**
 * ユーザーネームのバリデーション
 */
function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = username.trim();

  if (!trimmed) {
    return { valid: false, error: "ユーザーネームを入力してください" };
  }

  if (trimmed.length < 3) {
    return {
      valid: false,
      error: "ユーザーネームは3文字以上で入力してください",
    };
  }

  if (trimmed.length > 20) {
    return {
      valid: false,
      error: "ユーザーネームは20文字以下で入力してください",
    };
  }

  // 英数字とアンダースコア，ハイフンのみ許可
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: "ユーザーネームは英数字，アンダースコア，ハイフンのみ使用できます",
    };
  }

  return { valid: true };
}

/**
 * パスワードのバリデーション
 */
function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password) {
    return { valid: false, error: "パスワードを入力してください" };
  }

  if (password.length < 6) {
    return { valid: false, error: "パスワードは6文字以上で入力してください" };
  }

  return { valid: true };
}

/**
 * ユーザー登録
 * - 登録用秘密鍵の照合
 * - ユーザーネームの重複チェック
 * - Supabase Auth でユーザー作成
 */
export async function signUpWithUsername(
  username: string,
  email: string,
  password: string,
  secretKey: string,
): Promise<{ success: boolean; error?: string }> {
  // 秘密鍵の照合
  const expectedSecretKey = process.env.SIGNUP_SECRET_KEY;
  if (!expectedSecretKey) {
    console.error("SIGNUP_SECRET_KEY is not configured");
    return { success: false, error: "サーバー設定に問題があります" };
  }

  if (secretKey !== expectedSecretKey) {
    return { success: false, error: "登録用キーが正しくありません" };
  }

  // ユーザーネームのバリデーション
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return { success: false, error: usernameValidation.error };
  }

  // メールアドレスのバリデーション
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { success: false, error: emailValidation.error };
  }

  // パスワードのバリデーション
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error };
  }

  const trimmedUsername = username.trim().toLowerCase();
  const trimmedEmail = email.trim().toLowerCase();

  const supabase = await createClient();

  // ユーザー作成
  const { error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: {
        username: trimmedUsername,
      },
    },
  });

  if (error) {
    // Supabase のエラーメッセージを変換
    if (error.message.includes("already registered")) {
      return {
        success: false,
        error: "このメールアドレスは既に使用されています",
      };
    }
    console.error("Signup error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * メールアドレスでサインイン
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  // メールアドレスのバリデーション
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { success: false, error: emailValidation.error };
  }

  // パスワードのバリデーション
  if (!password) {
    return { success: false, error: "パスワードを入力してください" };
  }

  const trimmedEmail = email.trim().toLowerCase();

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) {
    // エラーメッセージをユーザーフレンドリーに
    if (error.message.includes("Invalid login credentials")) {
      return {
        success: false,
        error: "メールアドレスまたはパスワードが正しくありません",
      };
    }
    console.error("Signin error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * パスワードリセットメールを送信
 */
export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; error?: string; mailpitUrl?: string }> {
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { success: false, error: emailValidation.error };
  }

  const trimmedEmail = email.trim().toLowerCase();
  const siteUrl = getSiteUrl();
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
    redirectTo: `${siteUrl}/auth/confirm?next=/auth/reset-password`,
  });

  if (error) {
    console.error("Password reset request error:", error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    ...(isLocalSupabase() ? { mailpitUrl: MAILPIT_URL } : {}),
  };
}

/**
 * 新しいパスワードを設定（リセットリンク経由でセッション確立後）
 */
export async function updatePassword(
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "セッションが無効です．メールのリンクから再度アクセスしてください",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("Password update error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
