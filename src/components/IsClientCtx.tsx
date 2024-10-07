"use client";
import { createContext, useContext, useEffect, useState } from "react";

// https://stackoverflow.com/questions/75692116/next-js-13-window-is-not-defined
const IsClientCtx = createContext(false);

export const IsClientCtxProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return (
    <IsClientCtx.Provider value={isClient}>{children}</IsClientCtx.Provider>
  );
};

export function useIsClient() {
  return useContext(IsClientCtx);
}
