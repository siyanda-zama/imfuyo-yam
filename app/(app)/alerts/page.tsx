"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { motion } from "framer-motion";
import PageTransition from "@/components/ui/PageTransition";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { ALERT_ICONS, ALERT_LABELS } from "@/lib/icons";
import { ShieldAlert, BatteryLow, Moon, ShieldCheck, type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AlertType = "BOUNDARY_EXIT" | "LOW_BATTERY" | "INACTIVITY";

interface AlertAnimal {
  id: string;
  name: string;
  tagId: string;
  type: string;
}

interface Alert {
  id: string;
  animalId: string;
  animal: AlertAnimal;
  type: AlertType;
  message: string;
  resolved: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  return new Date(dateStr).toLocaleDateString();
}

function getDateGroup(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This Week";
  return "Earlier";
}

const ALERT_CONFIG: Record<
  AlertType,
  { icon: LucideIcon; borderColor: string; label: string }
> = {
  BOUNDARY_EXIT: {
    icon: ShieldAlert,
    borderColor: "border-l-danger",
    label: "Boundary Exit",
  },
  LOW_BATTERY: {
    icon: BatteryLow,
    borderColor: "border-l-warning",
    label: "Low Battery",
  },
  INACTIVITY: {
    icon: Moon,
    borderColor: "border-l-yellow-400",
    label: "Inactivity",
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AlertsPage() {
  const isOnline = useOnlineStatus();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  /* ---------- Fetch alerts ---------- */
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data: Alert[] = await res.json();
      setAlerts(data);
    } catch (err) {
      setError("Could not load alerts.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  /* ---------- Toggle resolved ---------- */
  const toggleResolved = async (alert: Alert) => {
    setTogglingId(alert.id);
    try {
      const res = await fetch("/api/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: alert.id,
          resolved: !alert.resolved,
        }),
      });

      if (!res.ok) throw new Error("Failed to update alert");

      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alert.id ? { ...a, resolved: !a.resolved } : a
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  /* ---------- Group alerts by date ---------- */
  const groupedAlerts = useMemo(() => {
    const groups: { label: string; alerts: Alert[] }[] = [];
    const groupMap = new Map<string, Alert[]>();
    const order: string[] = [];

    for (const alert of alerts) {
      const group = getDateGroup(alert.createdAt);
      if (!groupMap.has(group)) {
        groupMap.set(group, []);
        order.push(group);
      }
      groupMap.get(group)!.push(alert);
    }

    for (const label of order) {
      groups.push({ label, alerts: groupMap.get(label)! });
    }

    return groups;
  }, [alerts]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="p-4 pt-6 space-y-3">
        <div className="h-8 w-24 bg-surface rounded-lg animate-pulse" />
        <SkeletonCard count={4} />
      </div>
    );
  }

  /* ---------- Counts ---------- */
  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <PageTransition>
      <div className="p-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          {unresolvedCount > 0 && (
            <span className="bg-danger/10 text-danger text-xs font-semibold rounded-full px-3 py-1">
              {unresolvedCount} active
            </span>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-danger/10 text-danger rounded-xl p-4 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {alerts.length === 0 && !error && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={40} className="text-primary" />
            </div>
            <p className="text-lg font-semibold mb-1 text-white">All Clear</p>
            <p className="text-text-muted text-sm">
              No alerts at the moment
            </p>
          </motion.div>
        )}

        {/* Alert timeline grouped by date */}
        <div className="flex flex-col gap-3">
          {groupedAlerts.map((group) => (
            <div key={group.label}>
              {/* Date group header */}
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 mt-2">
                {group.label}
              </p>

              <div className="flex flex-col gap-3">
                {group.alerts.map((alert) => {
                  const config = ALERT_CONFIG[alert.type];
                  const isToggling = togglingId === alert.id;
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={alert.id}
                      className={`bg-surface rounded-xl border-l-4 ${config.borderColor} p-4 border border-border/30 transition-opacity ${
                        alert.resolved ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="mt-0.5 shrink-0 text-muted">
                          <IconComponent size={20} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Type label */}
                          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                            {config.label}
                          </p>

                          {/* Message */}
                          <p
                            className={`text-sm font-medium ${
                              alert.resolved
                                ? "line-through text-muted"
                                : "text-white"
                            }`}
                          >
                            {alert.message}
                          </p>

                          {/* Animal name + time */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted">
                              {alert.animal.name}
                            </span>
                            <span className="text-xs text-muted">
                              &middot;
                            </span>
                            <span className="text-xs text-muted">
                              {timeAgo(alert.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Resolve toggle */}
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => isOnline && toggleResolved(alert)}
                          disabled={isToggling || !isOnline}
                          className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${
                            alert.resolved ? "bg-primary" : "bg-border"
                          } ${isToggling ? "opacity-50" : ""}`}
                          title={
                            alert.resolved
                              ? "Mark unresolved"
                              : "Mark resolved"
                          }
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                              alert.resolved
                                ? "translate-x-[22px]"
                                : "translate-x-0.5"
                            }`}
                          />
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
