"use client";

import { useRouter } from "next/navigation";
import { Home, X, Check, Plus } from "lucide-react";

interface Farm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  _count?: { animals: number };
}

interface FarmSwitcherProps {
  farms: Farm[];
  activeFarmId: string;
  onSelectFarm: (farmId: string) => void;
  onClose: () => void;
}

export default function FarmSwitcher({
  farms,
  activeFarmId,
  onSelectFarm,
  onClose,
}: FarmSwitcherProps) {
  const router = useRouter();

  return (
    <div
      className="absolute inset-0 z-50 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-b-2xl shadow-xl p-4 w-full relative border-b border-primary/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-white">My Farms</h2>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-secondary"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Farm list */}
        <div className="flex flex-col gap-2 mt-3">
          {farms.map((farm) => {
            const isActive = farm.id === activeFarmId;
            return (
              <button
                key={farm.id}
                onClick={() => onSelectFarm(farm.id)}
                className={`rounded-xl p-3 flex items-center gap-3 w-full transition-colors min-h-[44px] ${
                  isActive
                    ? "bg-primary/10 border border-primary"
                    : "bg-surface-light hover:bg-surface-light"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive ? "bg-primary" : "bg-border"
                  }`}
                >
                  <Home size={18} className={isActive ? "text-background" : "text-white"} />
                </div>

                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="font-semibold text-sm truncate w-full text-left text-white">
                    {farm.name}
                  </span>
                  <span className="text-xs text-secondary">
                    {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                  </span>
                </div>

                <span className="text-xs bg-surface-light rounded-full px-2 py-0.5 flex-shrink-0 text-secondary">
                  {farm._count?.animals ?? 0} animals
                </span>

                {isActive && (
                  <Check size={20} strokeWidth={2.5} className="flex-shrink-0 text-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Add Farm button */}
        <button
          onClick={() => {
            router.push("/setup-farm");
            onClose();
          }}
          className="mt-3 rounded-xl border-2 border-dashed border-primary/30 p-3 w-full flex items-center justify-center gap-2 text-primary text-sm font-semibold min-h-[44px] transition-colors hover:bg-primary/5"
        >
          <Plus size={18} />
          Add Farm
        </button>
      </div>
    </div>
  );
}
