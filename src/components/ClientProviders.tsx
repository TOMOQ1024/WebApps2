"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/hooks/useTheme";
import { IsClientCtxProvider } from "./IsClientCtx";
import { SharedCanvasProvider } from "./SharedCanvas";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <IsClientCtxProvider>
      <ThemeProvider>
        <SharedCanvasProvider>{children}</SharedCanvasProvider>
      </ThemeProvider>
    </IsClientCtxProvider>
  );
}
