"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Map, Ruler, Globe } from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";

interface AppSettings {
  mapStyle: string;
  distanceUnit: string;
  language: string;
}

const MAP_STYLES = [
  { value: "satellite", label: "Satellite" },
  { value: "streets", label: "Streets" },
  { value: "dark", label: "Dark" },
];

const DISTANCE_UNITS = [
  { value: "km", label: "Kilometers" },
  { value: "miles", label: "Miles" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "zu", label: "isiZulu" },
  { value: "xh", label: "isiXhosa" },
  { value: "af", label: "Afrikaans" },
];

function OptionGroup({
  label,
  icon: Icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: any;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-secondary" />
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
              value === opt.value
                ? "bg-primary text-background"
                : "bg-surface-light text-secondary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AppSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({
    mapStyle: "satellite",
    distanceUnit: "km",
    language: "en",
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
            mapStyle: data.mapStyle,
            distanceUnit: data.distanceUnit,
            language: data.language,
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

  const updateSetting = async (key: keyof AppSettings, value: string) => {
    const prev = settings[key];
    setSettings((s) => ({ ...s, [key]: value }));
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {
      setSettings((s) => ({ ...s, [key]: prev }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 pt-6 space-y-4">
        <div className="h-10 w-32 rounded-lg animate-shimmer" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl animate-shimmer" />
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
          <h1 className="font-bold text-xl text-white">App Settings</h1>
          {saving && <span className="text-xs text-primary ml-auto">Saving...</span>}
        </div>

        <motion.div
          className="bg-surface rounded-xl border border-border divide-y divide-border"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OptionGroup
            label="Map Style"
            icon={Map}
            options={MAP_STYLES}
            value={settings.mapStyle}
            onChange={(v) => updateSetting("mapStyle", v)}
          />
          <OptionGroup
            label="Distance Unit"
            icon={Ruler}
            options={DISTANCE_UNITS}
            value={settings.distanceUnit}
            onChange={(v) => updateSetting("distanceUnit", v)}
          />
          <OptionGroup
            label="Language"
            icon={Globe}
            options={LANGUAGES}
            value={settings.language}
            onChange={(v) => updateSetting("language", v)}
          />
        </motion.div>
      </div>
    </PageTransition>
  );
}
