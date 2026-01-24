import { Suspense } from "react";

export const metadata = {
  title: "Graph 3D",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
