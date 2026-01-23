"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/hooks/useTheme";
import BodyShaderBackground from "./BodyShaderBackground";
import { IsClientCtxProvider } from "./IsClientCtx";
import { SharedCanvasProvider } from "./SharedCanvas";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <IsClientCtxProvider>
      <ThemeProvider>
        <SharedCanvasProvider>
          <BodyShaderBackground />
          {children}
        </SharedCanvasProvider>
      </ThemeProvider>
    </IsClientCtxProvider>
  );
}
