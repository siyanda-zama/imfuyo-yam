"use client";

import { useRouter } from "next/navigation";

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
      className="absolute inset-0 z-50 bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-b-2xl shadow-xl p-4 w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg">My Farms</h2>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
                    : "bg-surface hover:bg-gray-100"
                }`}
              >
                {/* Home icon circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>

                {/* Farm info */}
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="font-semibold text-sm truncate w-full text-left">
                    {farm.name}
                  </span>
                  <span className="text-xs text-muted">
                    {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                  </span>
                </div>

                {/* Animal count badge */}
                <span className="text-xs bg-surface rounded-full px-2 py-0.5 flex-shrink-0">
                  {farm._count?.animals ?? 0} 🐄
                </span>

                {/* Active checkmark */}
                {isActive && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3D7A35"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Farm
        </button>
      </div>
    </div>
  );
}
