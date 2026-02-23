"use client";

import { ANIMAL_ICONS } from "@/lib/icons";

type AnimalType = "COW" | "SHEEP" | "GOAT" | "CHICKEN" | "HORSE" | "PIG";
type AnimalStatus = "SAFE" | "WARNING" | "ALERT";

export interface Animal {
  id: string;
  name: string;
  tagId: string;
  type: AnimalType;
  status: AnimalStatus;
  battery: number;
  latitude: number;
  longitude: number;
  lastSeenAt: string;
}

interface AnimalCardProps {
  animal: Animal;
  onSelect: (animal: Animal) => void;
}

const statusClasses: Record<AnimalStatus, string> = {
  SAFE: "bg-primary/15 text-primary",
  WARNING: "bg-warning/15 text-warning",
  ALERT: "bg-danger/15 text-danger",
};

const statusBorderClasses: Record<AnimalStatus, string> = {
  SAFE: "border-l-success",
  WARNING: "border-l-warning",
  ALERT: "border-l-danger",
};

const statusLabels: Record<AnimalStatus, string> = {
  SAFE: "Safe",
  WARNING: "Warning",
  ALERT: "Alert",
};

function BatteryIndicator({ level }: { level: number }) {
  const color =
    level > 50
      ? "bg-primary"
      : level > 25
      ? "bg-warning"
      : "bg-danger";

  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="w-6 h-2.5 rounded-sm border border-border relative overflow-hidden">
        <div
          className={`absolute left-0 top-0 bottom-0 rounded-sm ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, level))}%` }}
        />
      </div>
      <span className="text-[10px] text-muted">{level}%</span>
    </div>
  );
}

export default function AnimalCard({ animal, onSelect }: AnimalCardProps) {
  const Icon = ANIMAL_ICONS[animal.type];

  return (
    <button
      type="button"
      onClick={() => onSelect(animal)}
      className={`bg-surface-light rounded-xl p-3 flex items-center gap-3 border border-border border-l-4 ${statusBorderClasses[animal.status]} active:scale-[0.98] transition-transform w-full text-left`}
    >
      {/* Animal icon avatar */}
      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
        <Icon size={20} className="text-secondary" />
      </div>

      {/* Name and tag */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate text-primary">{animal.name}</p>
        <p className="text-sm text-muted truncate">{animal.tagId}</p>
      </div>

      {/* Status and battery */}
      <div className="flex flex-col items-end shrink-0">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[animal.status]}`}
        >
          {statusLabels[animal.status]}
        </span>
        <BatteryIndicator level={animal.battery} />
      </div>
    </button>
  );
}
