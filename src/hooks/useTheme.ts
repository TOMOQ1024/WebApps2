import { useCallback, useEffect, useRef, useState } from "react";

type ThemeLabel = "light" | "dark";

// [0, 2) の循環する実数値でテーマを管理
// 0-1: light, 1-2: dark
export const useTheme = () => {
  const [themeValue, setThemeValue] = useState(0); // [0, 2) の連続値
  const targetRef = useRef(0); // 目標値
  const animationRef = useRef<number | null>(null);

  // themeValue から離散的なテーマラベルを取得
  const getThemeLabel = (value: number): ThemeLabel => {
    const normalized = ((value % 2) + 2) % 2; // 負の値も対応
    if (normalized < 1) return "light";
    return "dark";
  };

  const theme = getThemeLabel(themeValue);

  // localStorage から初期値を読み込み
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("themeValue");
    if (saved) {
      const value = Number.parseFloat(saved);
      if (!Number.isNaN(value)) {
        setThemeValue(value);
        targetRef.current = value;
      }
    }
  }, []);

  // テーマ変更時に data-theme 属性と localStorage を更新
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("themeValue", String(themeValue));
  }, [theme, themeValue]);

  // アニメーションループ
  useEffect(() => {
    const animate = () => {
      setThemeValue((current) => {
        const target = targetRef.current;
        const diff = target - current;

        // 十分近ければ目標値に設定
        if (Math.abs(diff) < 0.01) {
          return target;
        }

        // スムーズに補間（lerp）
        const speed = 0.1;
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

  // クリック時に目標値を +1（2 を超えたら循環）
  const toggleTheme = useCallback(() => {
    targetRef.current = (targetRef.current + 1) % 2;
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
  }, []);

  return {
    theme, // 離散的なテーマラベル ("light" | "dark")
    themeValue, // [0, 2) の連続値
    toggleTheme,
    setTheme,
  };
};
