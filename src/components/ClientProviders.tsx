"use client";

import type { ReactNode } from "react";
import { IsClientCtxProvider } from "./IsClientCtx";
import { SharedCanvasProvider } from "./SharedCanvas";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <IsClientCtxProvider>
      <SharedCanvasProvider>{children}</SharedCanvasProvider>
    </IsClientCtxProvider>
  );
}
