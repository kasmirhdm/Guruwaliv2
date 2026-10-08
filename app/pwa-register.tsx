"use client";
import { useEffect } from "react";

// Mendaftarkan service worker PWA (hanya production & browser mendukung).
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
