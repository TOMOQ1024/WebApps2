"use client";

import { Suspense } from "react";
import Main from "./components/Main";

function LoadingFallback() {
  return <div>Loading...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Main />
    </Suspense>
  );
}
