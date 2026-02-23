"use client";

import { useState, useEffect, useCallback } from "react";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

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

const ALERT_CONFIG: Record<
  AlertType,
  { icon: string; borderColor: string; label: string }
> = {
  BOUNDARY_EXIT: {
    icon: "\uD83D\uDEA8",
    borderColor: "border-l-alert-red",
    label: "Boundary Exit",
  },
  LOW_BATTERY: {
    icon: "\uD83D\uDD0B",
    borderColor: "border-l-alert-orange",
    label: "Low Battery",
  },
  INACTIVITY: {
    icon: "\uD83D\uDCA4",
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

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="p-4 pt-6 space-y-3">
        <div className="h-8 w-24 bg-surface-card rounded-lg animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 w-full bg-surface-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  /* ---------- Counts ---------- */
  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="p-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-heading text-2xl font-bold">Alerts</h1>
        {unresolvedCount > 0 && (
          <span className="bg-alert-red/10 text-alert-red text-xs font-semibold rounded-full px-3 py-1">
            {unresolvedCount} active
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-alert-red/10 text-alert-red rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {alerts.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-cyan/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyan"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-1">All animals are safe {"\uD83D\uDC04"}</p>
          <p className="text-muted text-sm">No alerts at the moment</p>
        </div>
      )}

      {/* Alert timeline */}
      <div className="flex flex-col gap-3">
        {alerts.map((alert) => {
          const config = ALERT_CONFIG[alert.type];
          const isToggling = togglingId === alert.id;

          return (
            <div
              key={alert.id}
              className={`bg-navy-light rounded-xl border-l-4 ${config.borderColor} p-4 border border-slate-dark/30 transition-opacity ${
                alert.resolved ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-xl mt-0.5 shrink-0">{config.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Type label */}
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                    {config.label}
                  </p>

                  {/* Message */}
                  <p
                    className={`text-sm font-medium ${
                      alert.resolved ? "line-through text-muted" : "text-white"
                    }`}
                  >
                    {alert.message}
                  </p>

                  {/* Animal name + time */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted">
                      {alert.animal.name}
                    </span>
                    <span className="text-xs text-muted">&middot;</span>
                    <span className="text-xs text-muted">
                      {timeAgo(alert.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Resolve toggle */}
                <button
                  type="button"
                  onClick={() => isOnline && toggleResolved(alert)}
                  disabled={isToggling || !isOnline}
                  className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${
                    alert.resolved ? "bg-cyan" : "bg-slate-dark"
                  } ${isToggling ? "opacity-50" : ""}`}
                  title={alert.resolved ? "Mark unresolved" : "Mark resolved"}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      alert.resolved ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
