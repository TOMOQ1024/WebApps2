"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ThemeLabel = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeLabel;
  themeValue: number;
  toggleTheme: () => void;
  setTheme: (label: ThemeLabel) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// [0, 1] の連続値でテーマを管理
// 0: light, 1: dark
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeValue, setThemeValue] = useState(0); // [0, 1] の連続値
  const [theme, setThemeLabel] = useState<ThemeLabel>("light"); // 目標に基づくテーマラベル
  const targetRef = useRef(0); // 目標値
  const animationRef = useRef<number | null>(null);

  // 目標値からテーマラベルを取得
  const getThemeLabelFromTarget = (target: number): ThemeLabel => {
    const normalized = ((target % 2) + 2) % 2;
    if (normalized < 0.5) return "light";
    return "dark";
  };

  // 初期値を読み込み（transition を一時的に無効化）
  // blocking script で既に data-theme 属性が設定されているため，それを読み取る
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 初期読み込み時は transition を無効化
    document.documentElement.classList.add("no-transition");

    // blocking script で設定された data-theme 属性を読み取る
    const currentTheme = document.documentElement.getAttribute("data-theme");
    let theme: ThemeLabel;

    if (currentTheme === "dark" || currentTheme === "light") {
      theme = currentTheme;
    } else {
      // フォールバック: localStorage または prefers-color-scheme
      const saved = localStorage.getItem("theme") as ThemeLabel | null;
      if (saved === "dark" || saved === "light") {
        theme = saved;
      } else {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
    }

    const value = theme === "dark" ? 1 : 0;
    setThemeValue(value);
    targetRef.current = value;
    setThemeLabel(theme);

    // 次のフレームで transition を有効化
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("no-transition");
      });
    });
  }, []);

  // テーマ変更時に data-theme 属性と localStorage を更新
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // アニメーションループ
  useEffect(() => {
    const animate = () => {
      setThemeValue((current) => {
        const target = targetRef.current;
        const diff = target - current;

        // スムーズに補間（lerp）
        const speed = 0.01;
        return current + diff * speed;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // クリック時に目標値を +1 し、テーマラベルを即座に切り替え
  const toggleTheme = useCallback(() => {
    targetRef.current = targetRef.current === 0 ? 1 : 0;
    setThemeLabel(getThemeLabelFromTarget(targetRef.current));
  }, []);

  // 特定のテーマに直接設定
  const setTheme = useCallback((label: ThemeLabel) => {
    switch (label) {
      case "light":
        targetRef.current = 0;
        break;
      case "dark":
        targetRef.current = 1;
        break;
    }
    setThemeLabel(label);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeValue,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
