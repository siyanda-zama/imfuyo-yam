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
      </div>
    </PageTransition>
  );
}
