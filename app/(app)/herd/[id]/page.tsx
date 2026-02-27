"use client";

import { useState, useEffect, createElement } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Battery,
  Clock,
  Tag,
  MapPin,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { ANIMAL_ICONS, ANIMAL_LABELS, type AnimalType } from "@/lib/icons";
import PageTransition from "@/components/ui/PageTransition";

interface AnimalDetail {
  id: string;
  name: string;
  tagId: string;
  type: AnimalType;
  status: "SAFE" | "WARNING" | "ALERT";
  battery: number;
  latitude: number | null;
  longitude: number | null;
  lastSeenAt: string | null;
  createdAt: string;
  farm: {
    id: string;
    name: string;
  };
  alerts: {
    id: string;
    type: string;
    message: string;
    resolved: boolean;
    createdAt: string;
  }[];
}

const ANIMAL_TYPES: AnimalType[] = ["COW", "SHEEP", "GOAT", "CHICKEN", "HORSE", "PIG"];

const statusClasses: Record<string, string> = {
  SAFE: "bg-primary/15 text-primary",
  WARNING: "bg-warning/15 text-warning",
  ALERT: "bg-danger/15 text-danger",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [animal, setAnimal] = useState<AnimalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTagId, setEditTagId] = useState("");
  const [editType, setEditType] = useState<AnimalType>("COW");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/animals/${params.id}`);
        if (!res.ok) throw new Error("Failed to load animal");
        const data = await res.json();
        setAnimal(data);
      } catch (err) {
        setError("Could not load animal details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const startEditing = () => {
    if (!animal) return;
    setEditName(animal.name);
    setEditTagId(animal.tagId);
    setEditType(animal.type);
    setEditError("");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim() || !editTagId.trim()) {
      setEditError("Name and Tag ID are required.");
      return;
    }
    setSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/animals/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), tagId: editTagId.trim(), type: editType }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      const updated = await res.json();
      setAnimal((prev) => prev ? { ...prev, name: updated.name, tagId: updated.tagId, type: updated.type } : prev);
      setEditing(false);
    } catch (err: any) {
      setEditError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/animals/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.replace("/herd");
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 pt-6 space-y-4">
        <div className="h-8 w-20 rounded-lg animate-shimmer" />
        <div className="h-24 w-full rounded-xl animate-shimmer" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="p-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-secondary mb-4 min-h-[44px]"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="bg-danger/10 text-danger rounded-xl p-4 text-sm">
          {error || "Animal not found"}
        </div>
      </div>
    );
  }

  const Icon = ANIMAL_ICONS[animal.type];
  const recentAlerts = animal.alerts
    .filter((a) => !a.resolved)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <PageTransition>
      <div className="p-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-secondary" />
          </button>
          <h1 className="font-bold text-xl text-white flex-1">Animal Detail</h1>
          <button
            onClick={startEditing}
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center"
            aria-label="Edit animal"
          >
            <Pencil size={16} className="text-primary" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center"
            aria-label="Delete animal"
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>

        {/* Animal card */}
        <motion.div
          className="bg-surface rounded-xl p-5 border border-border mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center shrink-0">
              {createElement(Icon, { size: 32, className: "text-secondary" })}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white">{animal.name}</h2>
              <p className="text-secondary text-sm">{ANIMAL_LABELS[animal.type]}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[animal.status]}`}>
              {animal.status}
            </span>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="bg-surface rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Battery size={16} className="text-secondary" />
              <span className="text-xs text-secondary">Battery</span>
            </div>
            <p className="text-lg font-bold text-white">{animal.battery}%</p>
          </div>

          <div className="bg-surface rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-secondary" />
              <span className="text-xs text-secondary">Last Seen</span>
            </div>
            <p className="text-lg font-bold text-white">
              {animal.lastSeenAt ? timeAgo(animal.lastSeenAt) : "N/A"}
            </p>
          </div>

          <div className="bg-surface rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-secondary" />
              <span className="text-xs text-secondary">Tag ID</span>
            </div>
            <p className="text-sm font-bold text-white truncate">{animal.tagId}</p>
          </div>

          <div className="bg-surface rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-secondary" />
              <span className="text-xs text-secondary">Farm</span>
            </div>
            <p className="text-sm font-bold text-white truncate">{animal.farm.name}</p>
          </div>
        </motion.div>

        {/* Location */}
        {animal.latitude && animal.longitude && (
          <motion.div
            className="bg-surface rounded-xl p-4 border border-border mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Current Location
            </h3>
            <p className="text-sm text-secondary">
              {animal.latitude.toFixed(6)}, {animal.longitude.toFixed(6)}
            </p>
          </motion.div>
        )}

        {/* Recent alerts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" /> Recent Alerts
          </h3>
          {recentAlerts.length === 0 ? (
            <div className="bg-surface rounded-xl p-4 border border-border text-center">
              <p className="text-secondary text-sm">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-surface rounded-xl p-3 border border-border flex items-center gap-3"
                >
                  <AlertTriangle size={16} className="text-danger shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{alert.message}</p>
                    <p className="text-xs text-secondary">{timeAgo(alert.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Report theft button for alert status */}
        {animal.status === "ALERT" && (
          <motion.button
            className="mt-6 w-full bg-danger text-white font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            whileTap={{ scale: 0.98 }}
          >
            Report Theft
          </motion.button>
        )}

        {/* Edit Modal */}
        {editing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setEditing(false); }}
          >
            <div className="bg-surface rounded-2xl p-6 w-full max-w-[380px] shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-xl text-primary">Edit Animal</h2>
                <button onClick={() => setEditing(false)} className="text-secondary">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-background rounded-xl px-4 py-2.5 text-sm text-primary border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Tag ID</label>
                  <input
                    type="text"
                    value={editTagId}
                    onChange={(e) => setEditTagId(e.target.value)}
                    className="w-full bg-background rounded-xl px-4 py-2.5 text-sm text-primary border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as AnimalType)}
                    className="w-full bg-background rounded-xl px-4 py-2.5 text-sm text-primary border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 appearance-none"
                  >
                    {ANIMAL_TYPES.map((type) => (
                      <option key={type} value={type}>{ANIMAL_LABELS[type]}</option>
                    ))}
                  </select>
                </div>

                {editError && <p className="text-danger text-sm">{editError}</p>}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary text-background font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Check size={16} /> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}
          >
            <div className="bg-surface rounded-2xl p-6 w-full max-w-[340px] shadow-xl text-center">
              <div className="w-14 h-14 bg-danger/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-danger" />
              </div>
              <h2 className="font-bold text-lg text-white mb-2">Delete {animal.name}?</h2>
              <p className="text-sm text-secondary mb-6">
                This will permanently remove this animal and all its alerts. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-surface-light text-secondary font-semibold py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-danger text-white font-semibold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center"
                >
                  {deleting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
