"use client";

interface SkeletonCardProps {
  count?: number;
}

export default function SkeletonCard({ count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-light rounded-xl p-3 flex items-center gap-3 border border-border animate-pulse"
        >
          <div className="w-10 h-10 rounded-full animate-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded animate-shimmer" />
            <div className="h-3 w-16 rounded animate-shimmer" />
          </div>
          <div className="h-5 w-14 rounded-full animate-shimmer" />
        </div>
      ))}
    </>
  );
}
