"use client";

interface AlertBadgeProps {
  count: number;
}

export default function AlertBadge({ count }: AlertBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 animate-shake">
      {count > 99 ? "99+" : count}
    </span>
  );
}
