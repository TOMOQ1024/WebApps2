'use client';
import preventDefault from "@/src/preventDefault";
import { useEffect } from "react";

export const FullHeightProvider = () => {
  useEffect(() => {
    const handleResize = () => {
      document.body.style.setProperty('--full-height',`${document.documentElement.offsetHeight}px`);
    }

    handleResize();

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