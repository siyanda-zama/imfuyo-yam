'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Bug, AlertTriangle, Shield, X, Clock,
  Droplets, Thermometer, ShieldCheck,
} from 'lucide-react';
import { FMD_SYMPTOMS } from '@/lib/provinces';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface NearbyReport {
  id: string;
  severity: string;
  animalType: string;
  symptoms: string[];
  latitude: number;
  longitude: number;
  farmName: string;
  animalName: string | null;
  province: string;
  reportedAt: string;
  quarantineStarted: boolean;
}

const MITIGATION_STEPS = [
  {
    icon: Shield,
    title: 'Quarantine immediately',
    desc: 'Isolate all suspected animals. No movement in or out of the farm.',
  },
  {
    icon: Droplets,
    title: 'Disinfect everything',
    desc: 'Clean boots, vehicles, equipment with approved disinfectant before and after contact.',
  },
  {
    icon: Thermometer,
    title: 'Monitor your herd daily',
    desc: 'Check for blisters, drooling, lameness, fever. Report any new symptoms immediately.',
  },
  {
    icon: ShieldCheck,
    title: 'Contact your state vet',
    desc: 'Call DALRRD or your provincial vet office. FMD is a controlled disease under the Animal Diseases Act.',
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function FmdMapPage() {
  const router = useRouter();
  const [reports, setReports] = useState<NearbyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NearbyReport | null>(null);

  // Map components (dynamic import)
  const [MapGL, setMapGL] = useState<any>(null);
  const [MarkerGL, setMarkerGL] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/fmd/nearby')
      .then((r) => r.json())
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));

    import('react-map-gl').then((mod) => {
      setMapGL(() => mod.default);
      setMarkerGL(() => mod.Marker);
      setMapLoaded(true);
    });
  }, []);

  const getMarkerColor = useCallback((severity: string) => {
    return severity === 'CONFIRMED' ? '#FF4757' : '#FFB020';
  }, []);

  const confirmedCount = reports.filter((r) => r.severity === 'CONFIRMED').length;
  const suspectedCount = reports.filter((r) => r.severity === 'SUSPECTED').length;
  const provinces = new Set(reports.map((r) => r.province).filter(Boolean));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-lg border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-text-secondary">
            <ArrowLeft size={20} />
          </button>
          <MapPin size={18} className="text-danger" />
          <h1 className="font-display text-sm font-bold text-white flex-1">FMD Outbreak Map</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-danger">{confirmedCount}</p>
            <p className="text-[9px] text-text-muted uppercase">Confirmed</p>
          </div>
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-warning">{suspectedCount}</p>
            <p className="text-[9px] text-text-muted uppercase">Suspected</p>
          </div>
          <div className="bg-surface border border-border/30 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{provinces.size}</p>
            <p className="text-[9px] text-text-muted uppercase">Provinces</p>
          </div>
        </div>

        {/* Map */}
        <div className="bg-surface rounded-xl border border-border/30 overflow-hidden">
          <div className="h-[300px] relative">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : mapLoaded && MapGL ? (
              <MapGL
                initialViewState={{
                  latitude: -28.5,
                  longitude: 28.5,
                  zoom: 5,
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
                interactive={true}
                attributionControl={false}
              >
                {reports.map((report) => {
                  const color = getMarkerColor(report.severity);
                  const isSelected = selected?.id === report.id;
                  return MarkerGL ? (
                    <MarkerGL
                      key={report.id}
                      latitude={report.latitude}
                      longitude={report.longitude}
                      anchor="bottom"
                      onClick={(e: any) => {
                        e.originalEvent.stopPropagation();
                        setSelected(report);
                      }}
                    >
                      <div
                        className="cursor-pointer transition-transform"
                        style={{ transform: isSelected ? 'scale(1.4)' : 'scale(1)' }}
                      >
                        <div className="relative">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2"
                            style={{
                              backgroundColor: color,
                              borderColor: isSelected ? '#fff' : 'rgba(255,255,255,0.3)',
                            }}
                          >
                            <Bug size={12} className="text-white" />
                          </div>
                          <div
                            className="w-2 h-2 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </MarkerGL>
                  ) : null;
                })}
              </MapGL>
            ) : (
              <div className="w-full h-full bg-surface-light flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={24} className="text-text-muted mx-auto mb-2" />
                  <p className="text-xs text-text-muted">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="px-3 py-2 border-t border-border/20 flex items-center gap-4 text-[10px] text-text-muted">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF4757]" /> Confirmed</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FFB020]" /> Suspected</span>
            <span className="ml-auto">Tap a pin for details</span>
          </div>
        </div>

        {/* Selected report detail */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className={`bg-surface rounded-xl border p-4 space-y-2 ${
                selected.severity === 'CONFIRMED' ? 'border-danger/30' : 'border-warning/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug size={14} className={selected.severity === 'CONFIRMED' ? 'text-danger' : 'text-warning'} />
                  <span className={`text-xs font-bold ${selected.severity === 'CONFIRMED' ? 'text-danger' : 'text-warning'}`}>
                    {selected.severity}
                  </span>
                  <span className="text-[10px] text-text-muted">{selected.animalType}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-text-muted">
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-white font-medium">{selected.farmName}</p>
              <div className="flex items-center gap-3 text-[10px] text-text-muted">
                <span className="flex items-center gap-1"><MapPin size={10} /> {selected.province || 'Unknown'}</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(selected.reportedAt)}</span>
                {selected.quarantineStarted && (
                  <span className="flex items-center gap-1 text-warning"><AlertTriangle size={10} /> Quarantined</span>
                )}
              </div>
              {selected.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selected.symptoms.map((s) => {
                    const sym = FMD_SYMPTOMS.find((fs) => fs.key === s);
                    return (
                      <span key={s} className="text-[9px] bg-danger/10 text-danger px-1.5 py-0.5 rounded-full">
                        {sym?.label.split(',')[0] || s}
                      </span>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mitigation steps */}
        <div>
          <h2 className="font-display text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Shield size={16} className="text-primary" /> Protect Your Herd
          </h2>
          <div className="space-y-2">
            {MITIGATION_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-surface rounded-xl border border-border/30 p-3.5 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <step.icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{step.title}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
          <h3 className="font-display text-xs font-bold text-danger mb-2">Emergency Contacts</h3>
          <div className="space-y-1.5 text-xs text-text-secondary">
            <p>DALRRD Disease Hotline: <span className="text-white font-medium">012 319 7456</span></p>
            <p>State Vet (24hr): <span className="text-white font-medium">0800 00 1011</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
