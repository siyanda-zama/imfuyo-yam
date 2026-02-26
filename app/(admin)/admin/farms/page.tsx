'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Search, ChevronDown, ChevronUp, X, Phone, Beef,
  AlertTriangle, Shield, Ruler, Navigation,
} from 'lucide-react';
import type { AdminFarm } from '@/lib/types';
import { SA_PROVINCES } from '@/lib/provinces';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function HealthBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#00C896' : score >= 60 ? '#FFB020' : '#FF4757';
  const bg = score >= 80 ? 'rgba(0,200,150,0.15)' : score >= 60 ? 'rgba(255,176,32,0.15)' : 'rgba(255,71,87,0.15)';
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: bg }}>
      {score}
    </span>
  );
}

function FarmDetailPanel({ farm, onClose }: { farm: AdminFarm; onClose: () => void }) {
  const healthColor = farm.healthScore >= 80 ? '#00C896' : farm.healthScore >= 60 ? '#FFB020' : '#FF4757';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-surface rounded-xl border border-border/30 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/20 flex items-start justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-white">{farm.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-primary" />
            <span className="text-[11px] text-text-muted">{farm.province}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light transition-colors">
          <X size={16} className="text-text-muted" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-px bg-border/20">
        <div className="bg-surface p-3 text-center">
          <p className="text-lg font-bold text-white">{farm.animalCount}</p>
          <p className="text-[9px] text-text-muted uppercase">Animals</p>
        </div>
        <div className="bg-surface p-3 text-center">
          <p className="text-lg font-bold" style={{ color: healthColor }}>{farm.healthScore}</p>
          <p className="text-[9px] text-text-muted uppercase">Health</p>
        </div>
        <div className="bg-surface p-3 text-center">
          <p className={`text-lg font-bold ${farm.alertCount > 0 ? 'text-danger' : 'text-primary'}`}>
            {farm.alertCount}
          </p>
          <p className="text-[9px] text-text-muted uppercase">Alerts</p>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Owner */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/15 rounded-full flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-[10px]">
              {farm.owner.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{farm.owner.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <Phone size={9} /> {farm.owner.phone}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                farm.owner.plan === 'PRO' ? 'bg-primary/15 text-primary' : 'bg-surface-light text-text-muted'
              }`}>
                {farm.owner.plan}
              </span>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-background rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1"><Navigation size={10} /> Coordinates</span>
            <span className="text-text-secondary font-mono text-[11px]">
              {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1"><Ruler size={10} /> Radius</span>
            <span className="text-text-secondary">{farm.radiusMeters}m</span>
          </div>
          {farm.hectares && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted flex items-center gap-1"><Shield size={10} /> Area</span>
              <span className="text-text-secondary">{farm.hectares} hectares</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function FarmsPage() {
  const [farms, setFarms] = useState<AdminFarm[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [sortBy, setSortBy] = useState<'healthScore' | 'animalCount' | 'alertCount'>('healthScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFarm, setSelectedFarm] = useState<AdminFarm | null>(null);
  const [MapGL, setMapGL] = useState<any>(null);
  const [MarkerGL, setMarkerGL] = useState<any>(null);
  const [PopupGL, setPopupGL] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/admin/farms')
      .then((r) => r.json())
      .then(setFarms)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Dynamically import react-map-gl
    import('react-map-gl').then((mod) => {
      setMapGL(() => mod.default);
      setMarkerGL(() => mod.Marker);
      setPopupGL(() => mod.Popup);
      setMapLoaded(true);
    });
  }, []);

  const getMarkerColor = useCallback((farm: AdminFarm) => {
    if (farm.alertCount >= 3) return '#FF4757';
    if (farm.alertCount >= 1) return '#FFB020';
    return '#00C896';
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const filtered = (farms || [])
    .filter((f) => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.owner.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (province && f.province !== province) return false;
      return true;
    })
    .sort((a, b) => {
      const mul = sortOrder === 'desc' ? -1 : 1;
      return (a[sortBy] - b[sortBy]) * mul;
    });

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <MapPin size={20} className="text-primary" /> Farm Management
          </h1>
          <p className="text-xs text-text-muted mt-0.5">{farms?.length ?? 0} registered farms across South Africa</p>
        </div>
      </div>

      {/* Interactive Map with Pins */}
      <div className="bg-surface rounded-xl border border-primary/10 overflow-hidden">
        <div className="h-[350px] lg:h-[450px] relative">
          {mapLoaded && MapGL ? (
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
              {filtered.map((farm) => {
                const color = getMarkerColor(farm);
                const isSelected = selectedFarm?.id === farm.id;
                return MarkerGL ? (
                  <MarkerGL
                    key={farm.id}
                    latitude={farm.latitude}
                    longitude={farm.longitude}
                    anchor="bottom"
                    onClick={(e: any) => {
                      e.originalEvent.stopPropagation();
                      setSelectedFarm(farm);
                    }}
                  >
                    <div
                      className="cursor-pointer transition-transform"
                      style={{ transform: isSelected ? 'scale(1.3)' : 'scale(1)' }}
                    >
                      {/* Pin shape */}
                      <div className="relative">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2"
                          style={{
                            backgroundColor: color,
                            borderColor: isSelected ? '#fff' : 'rgba(255,255,255,0.3)',
                          }}
                        >
                          <span className="text-white font-bold text-[10px]">{farm.animalCount}</span>
                        </div>
                        {/* Pin point */}
                        <div
                          className="w-0 h-0 mx-auto"
                          style={{
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: `6px solid ${color}`,
                          }}
                        />
                        {/* Pulse ring for selected */}
                        {isSelected && (
                          <div
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ backgroundColor: color, opacity: 0.3 }}
                          />
                        )}
                      </div>
                    </div>
                  </MarkerGL>
                ) : null;
              })}

              {/* Popup for selected farm */}
              {selectedFarm && PopupGL && (
                <PopupGL
                  latitude={selectedFarm.latitude}
                  longitude={selectedFarm.longitude}
                  anchor="bottom"
                  offset={[0, -40]}
                  closeButton={false}
                  closeOnClick={false}
                >
                  <div className="bg-surface rounded-lg p-2 min-w-[180px] shadow-xl border border-border/30">
                    <p className="font-display text-xs font-bold text-white">{selectedFarm.name}</p>
                    <p className="text-[10px] text-text-muted">{selectedFarm.province} · {selectedFarm.owner.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-text-secondary flex items-center gap-1">
                        <Beef size={9} className="text-primary" /> {selectedFarm.animalCount}
                      </span>
                      {selectedFarm.alertCount > 0 && (
                        <span className="text-[10px] text-danger flex items-center gap-1">
                          <AlertTriangle size={9} /> {selectedFarm.alertCount}
                        </span>
                      )}
                      <HealthBadge score={selectedFarm.healthScore} />
                    </div>
                  </div>
                </PopupGL>
              )}
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
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00C896]" /> No alerts</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FFB020]" /> 1-2 alerts</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF4757]" /> 3+ alerts</span>
          <span className="ml-auto">Click a pin to see details</span>
        </div>
      </div>

      {/* Selected Farm Detail Panel */}
      <AnimatePresence>
        {selectedFarm && (
          <FarmDetailPanel
            farm={selectedFarm}
            onClose={() => setSelectedFarm(null)}
          />
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search farms or owners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border/30 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="bg-surface border border-border/30 rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-primary/50"
        >
          <option value="">All Provinces</option>
          {SA_PROVINCES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-surface border border-border/30 rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-primary/50"
        >
          <option value="healthScore">Health</option>
          <option value="animalCount">Animals</option>
          <option value="alertCount">Alerts</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="bg-surface border border-border/30 rounded-xl px-3 py-2.5 text-text-secondary hover:text-white transition-colors"
        >
          {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Farm List */}
      <div className="space-y-2">
        {filtered.map((farm, i) => {
          const isSelected = selectedFarm?.id === farm.id;
          return (
            <motion.button
              key={farm.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              onClick={() => setSelectedFarm(isSelected ? null : farm)}
              className={`w-full bg-surface rounded-xl border overflow-hidden p-4 flex items-center gap-4 text-left hover:bg-surface-light/50 transition-colors ${
                isSelected ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border/30'
              }`}
            >
              <div className="w-8 text-center shrink-0">
                <span className="font-display text-lg font-bold text-primary">#{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-semibold text-white truncate">{farm.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin size={10} className="text-text-muted shrink-0" />
                  <span className="text-[10px] text-text-muted">{farm.province}</span>
                  <span className="text-[10px] text-text-muted">·</span>
                  <span className="text-[10px] text-text-secondary truncate">{farm.owner.name}</span>
                </div>
              </div>
              <div className="text-right mr-2 shrink-0">
                <p className="text-sm font-semibold text-white">{farm.animalCount}</p>
                <p className="text-[10px] text-text-muted">animals</p>
              </div>
              <div className="text-right mr-2 shrink-0">
                <p className={`text-sm font-semibold ${farm.alertCount > 0 ? 'text-danger' : 'text-text-muted'}`}>
                  {farm.alertCount}
                </p>
                <p className="text-[10px] text-text-muted">alerts</p>
              </div>
              <HealthBadge score={farm.healthScore} />
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-text-muted">
        Showing {filtered.length} of {farms?.length ?? 0} farms
      </p>
    </div>
  );
}
