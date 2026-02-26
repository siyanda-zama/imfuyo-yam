"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import BottomSheet from "@/components/ui/BottomSheet";

const FarmMap = dynamic(() => import("@/components/map/FarmMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-background" />,
});
import AnimalCard, { type Animal } from "@/components/ui/AnimalCard";
import TheftReportModal from "@/components/ui/TheftReportModal";
import FarmSwitcher from "@/components/ui/FarmSwitcher";
import { isOutsideBoundary } from "@/lib/geo";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { ANIMAL_ICONS, ANIMAL_LABELS } from "@/lib/icons";
import { createElement } from "react";
import { AlertTriangle, Menu, X, Locate, Layers, Bug } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Farm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  hectares: number | null;
  _count?: { animals: number };
}

type AnimalType = "COW" | "SHEEP" | "GOAT" | "CHICKEN" | "HORSE" | "PIG";
type FilterOption = "ALL" | AnimalType | "ALERTS";


const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "COW", label: "Cows" },
  { key: "SHEEP", label: "Sheep" },
  { key: "GOAT", label: "Goats" },
  { key: "ALERTS", label: "Alerts" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MapDashboard() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [snapIndex, setSnapIndex] = useState<0 | 1 | 2>(0);
  const [isLive, setIsLive] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("ALL");
  const [theftModalOpen, setTheftModalOpen] = useState(false);
  const [showFarmSwitcher, setShowFarmSwitcher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const [fmdStatus, setFmdStatus] = useState<{ activeReports: number; provincesAffected: number; totalProvinces: number } | null>(null);
  const isOnline = useOnlineStatus();

  /* ---------- Fetch farms + animals on mount ---------- */
  useEffect(() => {
    async function load() {
      try {
        const farmRes = await fetch("/api/farms");
        const farmsData: Farm[] = await farmRes.json();
        setFarms(farmsData);

        // Determine active farm from cookie or use first
        const cookies = document.cookie.split(";").map((c) => c.trim());
        const stored = cookies.find((c) => c.startsWith("activeFarmId="));
        const storedId = stored?.split("=")[1];
        const activeFarm =
          farmsData.find((f) => f.id === storedId) ?? farmsData[0] ?? null;
        setFarm(activeFarm);

        // Fetch animals for active farm
        const url = activeFarm
          ? `/api/animals?farmId=${activeFarm.id}`
          : "/api/animals";
        const animalRes = await fetch(url);
        const animalData: Animal[] = await animalRes.json();
        setAnimals(animalData);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ---------- Switch farm handler ---------- */
  const switchFarm = useCallback(
    async (farmId: string) => {
      document.cookie = `activeFarmId=${farmId};path=/;max-age=31536000`;
      const newFarm = farms.find((f) => f.id === farmId) ?? null;
      setShowFarmSwitcher(false);
      setSelectedAnimalId(null);
      alertedRef.current.clear();

      // Fetch animals first, then update farm + animals together
      try {
        const res = await fetch(`/api/animals?farmId=${farmId}`);
        const newAnimals = await res.json();
        setFarm(newFarm);
        setAnimals(newAnimals);
      } catch (err) {
        console.error(err);
        setFarm(newFarm);
        setAnimals([]);
      }
    },
    [farms]
  );

  /* ---------- Get user initial from session ---------- */
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (session?.user?.name) {
          setUserName(session.user.name);
        }
      } catch {
        // ignore
      }
    }
    loadSession();
  }, []);

  /* ---------- Fetch FMD status ---------- */
  useEffect(() => {
    fetch("/api/fmd/status")
      .then((r) => r.json())
      .then(setFmdStatus)
      .catch(() => {});
  }, []);

  /* ---------- Track which animals already triggered alerts ---------- */
  const alertedRef = useRef<Set<string>>(new Set());
  const farmRef = useRef(farm);
  farmRef.current = farm;

  /* ---------- Simulated GPS movement ---------- */
  useEffect(() => {
    // Request notification permission on mount
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const currentFarm = farmRef.current;
      if (!currentFarm) return;

      const pendingAlerts: { name: string; tagId: string; id: string }[] = [];

      setAnimals((prev) => {
        if (prev.length === 0) return prev;

        return prev.map((animal) => {
          if (animal.latitude == null || animal.longitude == null) return animal;

          // Each animal has a slight bias direction (deterministic from id)
          const seed = animal.id.charCodeAt(0) + animal.id.charCodeAt(animal.id.length - 1);
          const biasAngle = (seed % 360) * (Math.PI / 180);

          // Normal grazing movement + slight directional bias
          const drift = 0.00015;
          const bias = 0.00003;
          const newLat =
            animal.latitude +
            (Math.random() - 0.5) * drift +
            Math.cos(biasAngle) * bias;
          const newLng =
            animal.longitude +
            (Math.random() - 0.5) * drift +
            Math.sin(biasAngle) * bias;

          const outside = isOutsideBoundary(
            newLat,
            newLng,
            currentFarm.latitude,
            currentFarm.longitude,
            currentFarm.radiusMeters
          );

          const wasInside = animal.status !== "ALERT";
          const newStatus = outside ? "ALERT" : "SAFE";

          // Track boundary exit for notifications (collected, dispatched outside setState)
          if (outside && wasInside && !alertedRef.current.has(animal.id)) {
            alertedRef.current.add(animal.id);
            pendingAlerts.push({ name: animal.name, tagId: animal.tagId, id: animal.id });
          }

          // Clear alert tracking when animal comes back inside
          if (!outside && alertedRef.current.has(animal.id)) {
            alertedRef.current.delete(animal.id);
          }

          return {
            ...animal,
            latitude: newLat,
            longitude: newLng,
            status: newStatus,
            lastSeenAt: new Date().toISOString(),
          };
        });
      });

      // Fire notifications outside of setState
      if (pendingAlerts.length > 0) {
        setIsLive(true);
        const alert = pendingAlerts[0];

        // In-app alert banner
        setAlertBanner(`Alert:${alert.name} has left the farm boundary!`);
        setTimeout(() => setAlertBanner(null), 6000);

        // Create alerts in database
        for (const a of pendingAlerts) {
          fetch("/api/alerts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              animalId: a.id,
              type: "BOUNDARY_EXIT",
              message: `${a.name} has left the farm boundary!`,
            }),
          }).catch(() => {});
        }

        // Browser notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(`Alert:${alert.name} left the boundary!`, {
            body: `${alert.name} (${alert.tagId}) has moved outside ${farmRef.current?.name}`,
            icon: "/herdguard-logo.jpeg",
          });
        }
      }

      setIsLive(true);
    }, 5000);

    setIsLive(true);

    return () => clearInterval(interval);
  }, []); // Run once on mount, uses refs for current data

  /* ---------- Derived data ---------- */
  const alertCount = useMemo(
    () => animals.filter((a) => a.status === "ALERT").length,
    [animals]
  );

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<AnimalType, number>> = {};
    animals.forEach((a) => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return counts;
  }, [animals]);

  const filteredAnimals = useMemo(() => {
    if (activeFilter === "ALL") return animals;
    if (activeFilter === "ALERTS")
      return animals.filter((a) => a.status === "ALERT");
    return animals.filter((a) => a.type === activeFilter);
  }, [animals, activeFilter]);

  const selectedAnimal = useMemo(
    () => animals.find((a) => a.id === selectedAnimalId) ?? null,
    [animals, selectedAnimalId]
  );

  /* ---------- Handlers ---------- */
  const handleSelectAnimal = useCallback((id: string | null) => {
    setSelectedAnimalId(id);
  }, []);

  const handleAnimalCardSelect = useCallback((animal: Animal) => {
    setSelectedAnimalId(animal.id);
    setSnapIndex(0);
  }, []);

  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  /* ---------- Loading state ---------- */
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-secondary text-sm">Loading your farm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      {/* ---- Layer 1: Full-screen map (z-0) ---- */}
      <div className="absolute inset-0 z-0">
        <FarmMap
          farm={farm}
          animals={animals}
          selectedAnimalId={selectedAnimalId}
          onSelectAnimal={handleSelectAnimal}
        />
      </div>

      {/* ---- Layer 2: Top bar (z-10) ---- */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="rounded-2xl bg-surface/90 backdrop-blur shadow-sm mx-4 mt-[env(safe-area-inset-top,12px)] p-3 flex justify-between items-center">
          {/* Hamburger — opens farm switcher */}
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center"
            onClick={() => setShowFarmSwitcher(true)}
          >
            <Menu size={20} />
          </button>

          {/* Title */}
          <span className="font-bold text-primary text-lg">HerdGuard</span>

          {/* Avatar */}
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-primary text-sm font-semibold">
              {userInitial}
            </span>
          </div>
        </div>
      </div>

      {/* ---- Layer 3: LIVE / OFFLINE indicator (z-10) ---- */}
      {isOnline && isLive && (
        <div className="absolute top-[calc(env(safe-area-inset-top,12px)+60px)] right-5 z-10 flex items-center gap-1.5 bg-surface/90 backdrop-blur rounded-full px-2.5 py-1 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-semibold text-success">LIVE</span>
        </div>
      )}
      {!isOnline && (
        <div className="absolute top-[calc(env(safe-area-inset-top,12px)+60px)] right-5 z-10 flex items-center gap-1.5 bg-warning/90 backdrop-blur rounded-full px-2.5 py-1 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-background" />
          <span className="text-xs font-semibold text-background">OFFLINE</span>
        </div>
      )}

      {/* ---- FMD Warning Banner (z-14) ---- */}
      {fmdStatus && fmdStatus.activeReports > 0 && (
        <div className="absolute top-[calc(env(safe-area-inset-top,12px)+64px)] left-4 right-4 z-[14]">
          <a
            href="/herd/fmd-report"
            className="bg-danger/90 backdrop-blur text-white rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2 no-underline"
          >
            <Bug size={16} className="shrink-0" />
            <span className="text-xs font-semibold flex-1">
              FMD Alert: {fmdStatus.provincesAffected}/{fmdStatus.totalProvinces} provinces affected
            </span>
            <span className="text-[10px] opacity-80">Report</span>
          </a>
        </div>
      )}

      {/* ---- Alert banner (z-15) ---- */}
      {alertBanner && (
        <div className="absolute top-[calc(env(safe-area-inset-top,12px)+64px)] left-4 right-4 z-[15] animate-in slide-in-from-top-2">
          <div className="bg-danger text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span className="text-sm font-semibold flex-1">{alertBanner}</span>
            <button
              type="button"
              onClick={() => setAlertBanner(null)}
              className="text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ---- Layer 4: Bottom Sheet (z-20) ---- */}
      <div className="z-20">
        <BottomSheet snapIndex={snapIndex} onSnapChange={setSnapIndex}>
          {/* Sheet header */}
          <div className="mb-3">
            <h2 className="font-bold text-lg">
              {farm?.name ?? "My Farm"}{" "}
              <span className="font-sans text-sm text-muted font-normal">
                &middot; {animals.length} animals
              </span>
            </h2>

            {/* Quick stat chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {(Object.entries(typeCounts) as [AnimalType, number][]).map(
                ([type, count]) => (
                  <span
                    key={type}
                    className="bg-surface-light rounded-full px-2.5 py-1 text-xs font-medium text-secondary flex items-center gap-1"
                  >
                    {createElement(ANIMAL_ICONS[type], { size: 12 })}
                    {count} {ANIMAL_LABELS[type]}
                  </span>
                )
              )}
              {alertCount > 0 && (
                <span className="bg-danger/10 rounded-full px-2.5 py-1 text-xs font-medium text-danger flex items-center gap-1">
                  <AlertTriangle size={12} /> {alertCount}
                </span>
              )}
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setActiveFilter(opt.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                  activeFilter === opt.key
                    ? "bg-primary text-background"
                    : "bg-surface-light text-secondary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Animal list */}
          <div className="flex flex-col gap-2 pb-24">
            {filteredAnimals.length === 0 ? (
              <p className="text-center text-muted py-8 text-sm">
                No animals found
              </p>
            ) : (
              filteredAnimals.map((animal) => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  onSelect={handleAnimalCardSelect}
                />
              ))
            )}
          </div>
        </BottomSheet>
      </div>

      {/* ---- Layer 5: Selected animal floating card (z-25) ---- */}
      {selectedAnimal && (
        <div className="absolute bottom-[160px] left-4 right-4 z-[25] animate-in slide-in-from-bottom-4">
          <div className="bg-surface rounded-2xl p-4 shadow-lg border border-primary/20">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedAnimalId(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-surface-light flex items-center justify-center"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-3">
              {/* Animal icon avatar */}
              <div className="w-12 h-12 rounded-xl bg-surface-light flex items-center justify-center shrink-0">
                {createElement(ANIMAL_ICONS[selectedAnimal.type], { size: 24, className: "text-secondary" })}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">{selectedAnimal.name}</p>
                <p className="text-sm text-muted">{selectedAnimal.tagId}</p>
              </div>

              {/* Status badge */}
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    selectedAnimal.status === "SAFE"
                      ? "bg-primary/15 text-primary"
                      : selectedAnimal.status === "WARNING"
                      ? "bg-warning/15 text-warning"
                      : "bg-danger/20 text-danger"
                  }`}
                >
                  {selectedAnimal.status}
                </span>
                <span className="text-xs text-muted">
                  {selectedAnimal.battery}%
                </span>
              </div>
            </div>

            {/* Last seen */}
            {selectedAnimal.lastSeenAt && (
              <p className="text-xs text-muted mt-2">
                Last seen:{" "}
                {new Date(selectedAnimal.lastSeenAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}

            {/* Report Theft button */}
            {selectedAnimal.status === "ALERT" && (
              <button
                type="button"
                onClick={() => setTheftModalOpen(true)}
                className="mt-3 w-full bg-danger text-white font-semibold py-2.5 rounded-xl active:scale-[0.98] transition-transform"
              >
                Report Theft
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---- Layer 6: Theft Report Modal (z-50) ---- */}
      {selectedAnimal && (
        <TheftReportModal
          animal={selectedAnimal}
          isOpen={theftModalOpen}
          onClose={() => setTheftModalOpen(false)}
        />
      )}

      {/* ---- Layer 7: Farm Switcher (z-50) ---- */}
      {showFarmSwitcher && farm && (
        <div className="absolute inset-0 z-50">
          <FarmSwitcher
            farms={farms}
            activeFarmId={farm.id}
            onSelectFarm={switchFarm}
            onClose={() => setShowFarmSwitcher(false)}
          />
        </div>
      )}
    </div>
  );
}
