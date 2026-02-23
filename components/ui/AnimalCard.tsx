"use client";

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

const animalEmoji: Record<AnimalType, string> = {
  COW: "\uD83D\uDC04",
  SHEEP: "\uD83D\uDC11",
  GOAT: "\uD83D\uDC10",
  CHICKEN: "\uD83D\uDC14",
  HORSE: "\uD83D\uDC34",
  PIG: "\uD83D\uDC37",
};

const statusClasses: Record<AnimalStatus, string> = {
  SAFE: "bg-cyan/15 text-cyan",
  WARNING: "bg-alert-orange/15 text-alert-orange",
  ALERT: "bg-alert-red/15 text-alert-red",
};

const statusLabels: Record<AnimalStatus, string> = {
  SAFE: "Safe",
  WARNING: "Warning",
  ALERT: "Alert",
};

function BatteryIndicator({ level }: { level: number }) {
  const color =
    level > 50
      ? "bg-cyan"
      : level > 25
      ? "bg-alert-orange"
      : "bg-alert-red";

  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="w-6 h-2.5 rounded-sm border border-slate-dark relative overflow-hidden">
        <div
          className={`absolute left-0 top-0 bottom-0 rounded-sm ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, level))}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-light">{level}%</span>
    </div>
  );
}

export default function AnimalCard({ animal, onSelect }: AnimalCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(animal)}
      className="bg-surface-card rounded-xl p-3 flex items-center gap-3 border border-cyan/10 active:scale-[0.98] transition-transform w-full text-left"
    >
      {/* Animal emoji avatar */}
      <div className="w-[44px] h-[44px] rounded-xl bg-navy flex items-center justify-center text-2xl shrink-0">
        {animalEmoji[animal.type]}
      </div>

      {/* Name and tag */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate text-white">{animal.name}</p>
        <p className="text-sm text-slate-light truncate">{animal.tagId}</p>
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
