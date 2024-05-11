'use client';
import preventDefault from "@/src/preventDefault";
import { useEffect } from "react";

export const FullHeightProvider = () => {
  useEffect(() => {
    document.body.style.setProperty('--full-height',`${document.documentElement.offsetHeight}px`);

    const handleResize = (e: Event) => {
      document.body.style.setProperty('--full-height',`${document.documentElement.offsetHeight}px`);
    }

    document.documentElement.addEventListener('resize', handleResize);
    window.addEventListener("orientationchange", preventDefault, { passive: false });
    return () => {
      window.removeEventListener("orientationchange", handleResize);
      document.documentElement.removeEventListener('resize', preventDefault);
    }
  });

  return (
    <></>
  )
};