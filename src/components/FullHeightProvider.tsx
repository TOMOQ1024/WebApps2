'use client';
import { useEffect } from "react";

export const FullHeightProvider = () => {
  useEffect(() => {
    console.log(document.body.style.getPropertyValue('--full-height'));
    document.body.style.setProperty('--full-height',`${window.innerHeight}px`);
  });

  return (
    <></>
  )
};