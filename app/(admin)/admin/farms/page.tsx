'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import RegionalMap from '@/components/admin/RegionalMap';
import type { AdminFarm } from '@/lib/types';
import { SA_PROVINCES } from '@/lib/provinces';

function HealthBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#00C896' : score >= 60 ? '#FFB020' : '#FF4757';
  const bg = score >= 80 ? 'rgba(0,200,150,0.15)' : score >= 60 ? 'rgba(255,176,32,0.15)' : 'rgba(255,71,87,0.15)';
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: bg }}>
      {score}
    </span>
  );
}

export default function FarmsPage() {
  const [farms, setFarms] = useState<AdminFarm[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [sortBy, setSortBy] = useState<'healthScore' | 'animalCount' | 'alertCount'>('healthScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedFarm, setExpandedFarm] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/farms')
      .then((r) => r.json())
      .then(setFarms)
      .catch(console.error)
      .finally(() => setLoading(false));
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
    <div className="px-4 lg:px-8 py-6 space-y-6 pb-12 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-white">Farm Management</h1>
          <p className="text-xs text-text-muted mt-0.5">{farms?.length ?? 0} registered farms</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
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
          className="bg-surface border border-border/30 rounded-xl px-4 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-primary/50"
        >
          <option value="">All Provinces</option>
          {SA_PROVINCES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-surface border border-border/30 rounded-xl px-4 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-primary/50"
        >
          <option value="healthScore">Health Score</option>
          <option value="animalCount">Animal Count</option>
          <option value="alertCount">Alert Count</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="bg-surface border border-border/30 rounded-xl px-3 py-2.5 text-text-secondary hover:text-white transition-colors"
        >
          {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Farm Cards */}
      <div className="space-y-2">
        {filtered.map((farm, i) => (
          <motion.div
            key={farm.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="bg-surface rounded-xl border border-border/30 overflow-hidden"
          >
            <button
              onClick={() => setExpandedFarm(expandedFarm === farm.id ? null : farm.id)}
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-surface-light/50 transition-colors"
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
              <ChevronDown
                size={14}
                className={`text-text-muted transition-transform ${expandedFarm === farm.id ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedFarm === farm.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/20 px-4 py-3 bg-surface-light/30"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-text-muted mb-1">Owner</p>
                    <p className="text-white font-medium">{farm.owner.name}</p>
                    <p className="text-text-secondary">{farm.owner.phone}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                      farm.owner.plan === 'PRO' ? 'bg-primary/15 text-primary' : 'bg-surface text-text-muted'
                    }`}>
                      {farm.owner.plan}
                    </span>
                  </div>
                  <div>
                    <p className="text-text-muted mb-1">Location</p>
                    <p className="text-text-secondary">{farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}</p>
                    <p className="text-text-secondary">{farm.hectares ? `${farm.hectares} ha` : 'N/A'}</p>
                    <p className="text-text-secondary">Radius: {farm.radiusMeters}m</p>
                  </div>
                  <div>
                    <p className="text-text-muted mb-1">Livestock</p>
                    <p className="text-white font-medium">{farm.animalCount} animals</p>
                    <p className="text-text-secondary">Health Score: {farm.healthScore}</p>
                  </div>
                  <div>
                    <p className="text-text-muted mb-1">Alerts</p>
                    <p className={`font-medium ${farm.alertCount > 0 ? 'text-danger' : 'text-primary'}`}>
                      {farm.alertCount > 0 ? `${farm.alertCount} active` : 'No active alerts'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Regional Map */}
      <RegionalMap farms={farms} />
    </div>
  );
}
