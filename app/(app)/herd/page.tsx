"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import AnimalCard, { type Animal } from "@/components/ui/AnimalCard";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AnimalType = "COW" | "SHEEP" | "GOAT" | "CHICKEN" | "HORSE" | "PIG";
type FilterOption = "ALL" | AnimalType;
type StatusFilter = "ALL" | "SAFE" | "WARNING" | "ALERT";

interface Farm {
  id: string;
  name: string;
}

const TYPE_OPTIONS: { key: FilterOption; label: string; emoji: string }[] = [
  { key: "ALL", label: "All", emoji: "" },
  { key: "COW", label: "Cow", emoji: "\uD83D\uDC04" },
  { key: "SHEEP", label: "Sheep", emoji: "\uD83D\uDC11" },
  { key: "GOAT", label: "Goat", emoji: "\uD83D\uDC10" },
  { key: "CHICKEN", label: "Chicken", emoji: "\uD83D\uDC14" },
  { key: "HORSE", label: "Horse", emoji: "\uD83D\uDC34" },
  { key: "PIG", label: "Pig", emoji: "\uD83D\uDC37" },
];

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "Any Status" },
  { key: "SAFE", label: "Safe" },
  { key: "WARNING", label: "Warning" },
  { key: "ALERT", label: "Alert" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HerdPage() {
  const isOnline = useOnlineStatus();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterOption>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  /* ---------- Form state ---------- */
  const [formName, setFormName] = useState("");
  const [formTagId, setFormTagId] = useState("");
  const [formType, setFormType] = useState<AnimalType>("COW");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  /* ---------- Fetch ---------- */
  const fetchAnimals = useCallback(async () => {
    try {
      const res = await fetch("/api/animals");
      if (!res.ok) throw new Error("Failed to fetch animals");
      const data: Animal[] = await res.json();
      setAnimals(data);
    } catch (err) {
      setError("Could not load animals. Pull down to retry.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function load() {
      const [, farmRes] = await Promise.all([
        fetchAnimals(),
        fetch("/api/farms"),
      ]);
      if (farmRes.ok) {
        const farmData = await farmRes.json();
        setFarms(farmData);
      }
    }
    load();
  }, [fetchAnimals]);

  /* ---------- Filtered animals ---------- */
  const filteredAnimals = useMemo(() => {
    let result = animals;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tagId.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== "ALL") {
      result = result.filter((a) => a.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((a) => a.status === statusFilter);
    }

    return result;
  }, [animals, search, typeFilter, statusFilter]);

  /* ---------- Add animal handler ---------- */
  const handleAddAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTagId.trim()) {
      setFormError("Name and Tag ID are required.");
      return;
    }
    if (farms.length === 0) {
      setFormError("No farm found. Create a farm first.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    try {
      // Use active farm from cookie, or fall back to first farm
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const stored = cookies.find((c) => c.startsWith("activeFarmId="));
      const activeFarmId = stored?.split("=")[1] || farms[0]?.id;

      const res = await fetch("/api/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          tagId: formTagId.trim(),
          type: formType,
          farmId: activeFarmId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add animal");
      }

      // Reset form and close
      setFormName("");
      setFormTagId("");
      setFormType("COW");
      setShowAddModal(false);
      await fetchAnimals();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setFormSubmitting(false);
    }
  };

  /* ---------- Select handler (navigate or detail) ---------- */
  const handleSelectAnimal = useCallback((_animal: Animal) => {
    // For now, just navigate to the map with the animal selected
    // Could open a detail sheet in the future
  }, []);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="p-4 pt-6 space-y-3">
        <div className="h-8 w-32 bg-surface-card rounded-lg animate-pulse" />
        <div className="h-11 w-full bg-surface-card rounded-xl animate-pulse" />
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 bg-surface-card rounded-full animate-pulse shrink-0" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full bg-surface-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 pb-24">
      {/* Header */}
      <h1 className="font-heading text-2xl font-bold mb-4 text-white">My Herd</h1>

      {/* Search bar */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search animals..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface-card rounded-xl text-sm text-white placeholder-slate-light outline-none focus:ring-2 focus:ring-cyan/30"
        />
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setTypeFilter(opt.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              typeFilter === opt.key
                ? "bg-cyan text-navy"
                : "bg-surface-card text-slate-light"
            }`}
          >
            {opt.emoji ? `${opt.emoji} ` : ""}
            {opt.label}
          </button>
        ))}
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setStatusFilter(opt.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors border ${
              statusFilter === opt.key
                ? "border-cyan text-cyan bg-cyan/10"
                : "border-slate-dark text-slate-light bg-surface-card"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-alert-red/10 text-alert-red rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Animal list */}
      <div className="flex flex-col gap-2">
        {filteredAnimals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{"\uD83D\uDC04"}</p>
            <p className="text-muted text-sm">No animals found</p>
          </div>
        ) : (
          filteredAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onSelect={handleSelectAnimal}
            />
          ))
        )}
      </div>

      {/* Count summary */}
      <p className="text-center text-muted text-xs mt-4">
        Showing {filteredAnimals.length} of {animals.length} animals
      </p>

      {/* FAB button */}
      <button
        type="button"
        onClick={() => isOnline ? setShowAddModal(true) : null}
        disabled={!isOnline}
        title={!isOnline ? "Cannot add animals while offline" : "Add animal"}
        className={`fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-4 w-14 h-14 rounded-full shadow-lg text-2xl flex items-center justify-center active:scale-95 transition-transform z-30 ${
          isOnline ? "bg-cyan text-navy" : "bg-slate-dark text-slate-light opacity-50"
        }`}
      >
        +
      </button>

      {/* Add Animal Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="bg-navy-light rounded-2xl p-6 w-full max-w-[380px] shadow-xl">
            <h2 className="font-heading text-xl font-bold text-center mb-5 text-white">
              Add Animal
            </h2>

            <form onSubmit={handleAddAnimal} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-light mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Bessie"
                  className="w-full bg-navy rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-light border border-slate-dark outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/30"
                />
              </div>

              {/* Tag ID */}
              <div>
                <label className="block text-sm font-medium text-slate-light mb-1">
                  Tag ID
                </label>
                <input
                  type="text"
                  value={formTagId}
                  onChange={(e) => setFormTagId(e.target.value)}
                  placeholder="e.g. TAG-001"
                  className="w-full bg-navy rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-light border border-slate-dark outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/30"
                />
                <p className="text-xs text-muted mt-1">
                  Scan QR code on the animal&apos;s tag
                </p>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-light mb-1">
                  Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as AnimalType)}
                  className="w-full bg-navy rounded-xl px-4 py-2.5 text-sm text-white border border-slate-dark outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/30 appearance-none"
                >
                  <option value="COW">{"\uD83D\uDC04"} Cow</option>
                  <option value="SHEEP">{"\uD83D\uDC11"} Sheep</option>
                  <option value="GOAT">{"\uD83D\uDC10"} Goat</option>
                  <option value="CHICKEN">{"\uD83D\uDC14"} Chicken</option>
                  <option value="HORSE">{"\uD83D\uDC34"} Horse</option>
                  <option value="PIG">{"\uD83D\uDC37"} Pig</option>
                </select>
              </div>

              {/* Farm (auto) */}
              {farms.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-light mb-1">
                    Farm
                  </label>
                  <div className="bg-surface-card rounded-xl px-4 py-2.5 text-sm text-muted">
                    {(() => {
                      const cookies = document.cookie.split(";").map((c) => c.trim());
                      const stored = cookies.find((c) => c.startsWith("activeFarmId="));
                      const activeFarmId = stored?.split("=")[1];
                      const activeFarm = farms.find((f) => f.id === activeFarmId) ?? farms[0];
                      return activeFarm?.name;
                    })()} (active farm)
                  </div>
                </div>
              )}

              {/* Error */}
              {formError && (
                <p className="text-alert-red text-sm">{formError}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full bg-cyan text-navy font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {formSubmitting ? "Adding..." : "Add Animal"}
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-full text-center text-slate-light py-2 text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
