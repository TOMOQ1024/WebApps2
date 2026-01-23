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

// [0, 2) の循環する実数値でテーマを管理
// 0-1: light, 1-2: dark
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeValue, setThemeValue] = useState(0); // [0, 2) の連続値
  const [theme, setThemeLabel] = useState<ThemeLabel>("light"); // 目標に基づくテーマラベル
  const targetRef = useRef(0); // 目標値
  const animationRef = useRef<number | null>(null);

  // 目標値からテーマラベルを取得
  const getThemeLabelFromTarget = (target: number): ThemeLabel => {
    const normalized = ((target % 2) + 2) % 2;
    if (normalized < 1) return "light";
    return "dark";
  };

  // localStorage から初期値を読み込み（transition を一時的に無効化）
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 初期読み込み時は transition を無効化
    document.documentElement.classList.add("no-transition");

    const saved = localStorage.getItem("themeValue");
    if (saved) {
      const value = Number.parseFloat(saved);
      if (!Number.isNaN(value)) {
        setThemeValue(value);
        targetRef.current = value;
        setThemeLabel(getThemeLabelFromTarget(value));
      }
    }

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
  }, [theme]);

  // themeValue 変更時に localStorage を更新
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("themeValue", String(themeValue));
  }, [themeValue]);

  // アニメーションループ
  useEffect(() => {
    const animate = () => {
      setThemeValue((current) => {
        const target = targetRef.current;
        const diff = target - current;

        // // 十分近ければ目標値に設定
        // if (Math.abs(diff) < 0.01) {
        //   return target;
        // }

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

  // クリック時に目標値を +1（2 を超えたら循環）し、テーマラベルを即座に切り替え
  const toggleTheme = useCallback(() => {
    targetRef.current = (targetRef.current + 1) % 2;
    setThemeLabel(getThemeLabelFromTarget(targetRef.current));
  }, []);

  // 特定のテーマに直接設定
  const setTheme = useCallback((label: ThemeLabel) => {
    switch (label) {
      case "light":
        targetRef.current = 0.5;
        break;
      case "dark":
        targetRef.current = 1.5;
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
