"use client";

import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** モーダルの最大幅 (tailwind クラス) */
  maxWidth?: string;
  /** 閉じるボタンを表示するか */
  showCloseButton?: boolean;
}

/**
 * HeadlessUI を使用したモーダルコンポーネント
 * - 背景スクロールを自動的に防止
 * - フォーカストラップ
 * - Escape キーで閉じる
 * - アクセシビリティ対応
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-md",
  showCloseButton = true,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* オーバーレイ */}
      <DialogBackdrop className="fixed inset-0 bg-black/50" />

      {/* モーダルコンテナ */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-[var(--background-color)] border-2 border-[var(--border-color)] p-6 relative`}
        >
          {/* 閉じるボタン */}
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 text-xl opacity-70 hover:opacity-100"
              aria-label="閉じる"
            >
              ×
            </button>
          )}

          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
