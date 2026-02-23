"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Volume2, ShieldAlert, BatteryLow, Moon } from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";

interface NotificationSettings {
  pushNotifications: boolean;
  alertSounds: boolean;
  boundaryAlerts: boolean;
  batteryAlerts: boolean;
  inactivityAlerts: boolean;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-border"
      }`}
    >
      <motion.div
        className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
        animate={{ left: enabled ? "calc(100% - 1.625rem)" : "0.125rem" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    alertSounds: true,
    boundaryAlerts: true,
    batteryAlerts: true,
    inactivityAlerts: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            pushNotifications: data.pushNotifications,
            alertSounds: data.alertSounds,
            boundaryAlerts: data.boundaryAlerts,
            batteryAlerts: data.batteryAlerts,
            inactivityAlerts: data.inactivityAlerts,
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleSetting = async (key: keyof NotificationSettings) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });
    } catch (err) {
      // Revert on failure
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const items = [
    { key: "pushNotifications" as const, icon: Bell, label: "Push Notifications", desc: "Receive alerts on your device" },
    { key: "alertSounds" as const, icon: Volume2, label: "Alert Sounds", desc: "Play sound for new alerts" },
    { key: "boundaryAlerts" as const, icon: ShieldAlert, label: "Boundary Alerts", desc: "When animals leave the farm" },
    { key: "batteryAlerts" as const, icon: BatteryLow, label: "Low Battery Alerts", desc: "When tracker battery is low" },
    { key: "inactivityAlerts" as const, icon: Moon, label: "Inactivity Alerts", desc: "When no movement is detected" },
  ];

  if (loading) {
    return (
      <div className="p-4 pt-6 space-y-4">
        <div className="h-10 w-32 rounded-lg animate-shimmer" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-secondary" />
          </button>
          <h1 className="font-bold text-xl text-white">Notification Settings</h1>
          {saving && <span className="text-xs text-primary ml-auto">Saving...</span>}
        </div>

        <div className="bg-surface rounded-xl border border-border divide-y divide-border">
          {items.map((item, i) => (
            <motion.div
              key={item.key}
              className="flex items-center justify-between p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-secondary" />
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-secondary">{item.desc}</p>
                </div>
              </div>
              <Toggle enabled={settings[item.key]} onToggle={() => toggleSetting(item.key)} />
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
