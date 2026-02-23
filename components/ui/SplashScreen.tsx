"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shown = sessionStorage.getItem("splashShown");
    if (!shown) {
      setVisible(true);
      sessionStorage.setItem("splashShown", "1");
      // Start fade out after 1.4s
      const fadeTimer = setTimeout(() => setFadeOut(true), 1400);
      // Remove from DOM after fade completes
      const removeTimer = setTimeout(() => setVisible(false), 1800);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-400"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      <Image
        src="/herdguard-logo.jpeg"
        alt="HerdGuard"
        width={100}
        height={100}
        className="rounded-2xl"
        priority
      />
      <p className="mt-4 text-xl font-bold text-white">HerdGuard</p>
      <p className="text-sm text-text-secondary mt-1">
        Smart Livestock Protection
      </p>
    </div>
  );
}
