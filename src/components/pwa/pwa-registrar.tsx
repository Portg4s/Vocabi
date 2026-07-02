"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return;
    }

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const swUrl = `${basePath}/sw.js`;

    navigator.serviceWorker.register(swUrl).catch((error) => {
      console.warn("Vocabi service worker registration failed", error);
    });
  }, []);

  return null;
}
