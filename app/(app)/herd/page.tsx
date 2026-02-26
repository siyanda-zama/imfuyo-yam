"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Bug } from "lucide-react";
import Image from "next/image";
import AnimalCard, { type Animal } from "@/components/ui/AnimalCard";
import PageTransition from "@/components/ui/PageTransition";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { ANIMAL_ICONS, ANIMAL_LABELS, type AnimalType } from "@/lib/icons";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FilterOption = "ALL" | AnimalType;
type StatusFilter = "ALL" | "SAFE" | "WARNING" | "ALERT";

interface Farm {
  id: string;
  name: string;
}

const ANIMAL_TYPES: AnimalType[] = ["COW", "SHEEP", "GOAT", "CHICKEN", "HORSE", "PIG"];

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
  const router = useRouter();
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

  /* ---------- Count per type ---------- */
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: animals.length };
    for (const t of ANIMAL_TYPES) {
      counts[t] = animals.filter((a) => a.type === t).length;
    }
    return counts;
  }, [animals]);

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

  /* ---------- Select handler (navigate to detail) ---------- */
  const handleSelectAnimal = useCallback((animal: Animal) => {
    router.push(`/herd/${animal.id}`);
  }, [router]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="p-4 pt-6 space-y-3">
        <SkeletonCard count={5} />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 pt-6 pb-24 max-w-5xl mx-auto">
        {/* FMD Warning Card */}
        <a
          href="/herd/fmd-report"
          className="block bg-danger/10 border border-danger/30 rounded-xl p-4 mb-4 no-underline"
        >
          <div className="flex items-center gap-3">
            <Bug size={20} className="text-danger shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-bold text-danger">FMD Alert Active</p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                National State of Disaster. Report suspected cases immediately.
              </p>
            </div>
            <span className="text-xs font-semibold text-danger shrink-0">Report</span>
          </div>
        </a>

        {/* Header */}
        <h1 className="font-bold text-2xl mb-4 text-primary">My Herd</h1>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-[18px] h-[18px]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search animals..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-light rounded-xl text-sm text-primary placeholder-text-secondary outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          <motion.button
            key="ALL"
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setTypeFilter("ALL")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              typeFilter === "ALL"
                ? "bg-primary text-background"
                : "bg-surface-light text-secondary"
            }`}
          >
            All ({typeCounts.ALL})
          </motion.button>
          {ANIMAL_TYPES.map((type) => {
            const Icon = ANIMAL_ICONS[type];
            return (
              <motion.button
                key={type}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setTypeFilter(type)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                  typeFilter === type
                    ? "bg-primary text-background"
                    : "bg-surface-light text-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {ANIMAL_LABELS[type]} ({typeCounts[type]})
              </motion.button>
            );
          })}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {STATUS_OPTIONS.map((opt) => (
            <motion.button
              key={opt.key}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter(opt.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors border ${
                statusFilter === opt.key
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-secondary bg-surface-light"
              }`}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-danger/10 text-danger rounded-xl p-4 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Animal list */}
        {filteredAnimals.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4">
              <Image src="/images/cattle.jpg" alt="Livestock" fill className="object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
            </div>
            <Search className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted text-sm">No animals found</p>
          </div>
        ) : (
          <motion.div
            className="flex flex-col gap-2"
            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
            initial="initial"
            animate="animate"
          >
            {filteredAnimals.map((animal) => (
              <motion.div
                key={animal.id}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                }}
              >
                <AnimalCard
                  animal={animal}
                  onSelect={handleSelectAnimal}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Count summary */}
        <p className="text-center text-muted text-xs mt-4">
          Showing {filteredAnimals.length} of {animals.length} animals
        </p>

        {/* FAB button */}
        <motion.button
          type="button"
          onClick={() => isOnline ? setShowAddModal(true) : null}
          disabled={!isOnline}
          title={!isOnline ? "Cannot add animals while offline" : "Add animal"}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-4 w-14 h-14 rounded-full shadow-lg text-2xl flex items-center justify-center z-30 ${
            isOnline ? "bg-primary text-background" : "bg-border text-secondary opacity-50"
          }`}
        >
          +
        </motion.button>

        {/* Add Animal Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddModal(false);
            }}
          >
            <div className="bg-surface rounded-2xl p-6 w-full max-w-[380px] shadow-xl">
              <h2 className="font-bold text-xl text-center mb-5 text-primary">
                Add Animal
              </h2>

              <form onSubmit={handleAddAnimal} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Bessie"
                    className="w-full bg-background rounded-xl px-4 py-2.5 text-sm text-primary placeholder-text-secondary border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Tag ID */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Tag ID
                  </label>
                  <input
                    type="text"
                    value={formTagId}
                    onChange={(e) => setFormTagId(e.target.value)}
                    placeholder="e.g. TAG-001"
                    className="w-full bg-background rounded-xl px-4 py-2.5 text-sm text-primary placeholder-text-secondary border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="text-xs text-muted mt-1">
                    Scan QR code on the animal&apos;s tag
                  </p>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AnimalType)}
                    className="w-full bg-background rounded-xl px-4 py-2.5 text-sm text-primary border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 appearance-none"
                  >
                    {ANIMAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {ANIMAL_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Farm (auto) */}
                {farms.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Farm
                    </label>
                    <div className="bg-surface-light rounded-xl px-4 py-2.5 text-sm text-muted">
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
                  <p className="text-danger text-sm">{formError}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full bg-primary text-background font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {formSubmitting ? "Adding..." : "Add Animal"}
                </button>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full text-center text-secondary py-2 text-sm"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
