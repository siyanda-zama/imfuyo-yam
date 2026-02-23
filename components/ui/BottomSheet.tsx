"use client";

import { useRef, useCallback, useEffect, useState, type ReactNode } from "react";

const BOTTOM_NAV_HEIGHT = 56;

interface BottomSheetProps {
  children: ReactNode;
  snapIndex: 0 | 1 | 2;
  onSnapChange: (index: 0 | 1 | 2) => void;
}

function getSnapPoints() {
  if (typeof window === "undefined") return [140, 380, 720];
  const maxH = window.innerHeight * 0.9 - BOTTOM_NAV_HEIGHT;
  return [140, 380, maxH];
}

export default function BottomSheet({
  children,
  snapIndex,
  onSnapChange,
}: BottomSheetProps) {
  const startY = useRef(0);
  const startTranslate = useRef(0);
  const currentTranslate = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [, forceUpdate] = useState(0);

  // Recalculate on resize
  useEffect(() => {
    const onResize = () => forceUpdate((n) => n + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getTranslateY = useCallback(() => {
    const snaps = getSnapPoints();
    const maxHeight = snaps[2];
    return maxHeight - snaps[snapIndex];
  }, [snapIndex]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isDragging.current = true;
      startY.current = e.touches[0].clientY;
      startTranslate.current = getTranslateY();

      if (sheetRef.current) {
        sheetRef.current.style.transition = "none";
      }
    },
    [getTranslateY]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const deltaY = e.touches[0].clientY - startY.current;
    const newTranslate = Math.max(0, startTranslate.current + deltaY);
    currentTranslate.current = newTranslate;

    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${newTranslate}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const snaps = getSnapPoints();
    const maxHeight = snaps[2];

    const currentHeight = maxHeight - currentTranslate.current;

    let closestIndex = 0;
    let closestDistance = Infinity;
    snaps.forEach((snap, index) => {
      const distance = Math.abs(currentHeight - snap);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (sheetRef.current) {
      sheetRef.current.style.transition =
        "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)";
      const targetTranslate = maxHeight - snaps[closestIndex];
      sheetRef.current.style.transform = `translateY(${targetTranslate}px)`;
    }

    onSnapChange(closestIndex as 0 | 1 | 2);
  }, [onSnapChange]);

  const snaps = getSnapPoints();
  const maxHeight = snaps[2];
  const translateY = maxHeight - snaps[snapIndex];

  return (
    <div
      ref={sheetRef}
      className="absolute left-0 right-0 w-full bg-surface rounded-t-2xl shadow-2xl z-30 border-t border-primary/15"
      style={{
        bottom: `${BOTTOM_NAV_HEIGHT}px`,
        height: `${maxHeight}px`,
        transform: `translateY(${translateY}px)`,
        transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag handle */}
      <div className="pt-3 pb-1 cursor-grab active:cursor-grabbing">
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-2" />
      </div>

      {/* Content */}
      <div
        className={`px-4 ${
          snapIndex === 2 ? "overflow-y-auto" : "overflow-hidden"
        }`}
        style={{ height: `calc(100% - 28px)` }}
      >
        {children}
      </div>
    </div>
  );
}
