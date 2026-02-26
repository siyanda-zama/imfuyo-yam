'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, PieChart, BarChart3, Battery, TrendingDown } from 'lucide-react';
import DonutChart from '@/components/admin/charts/DonutChart';
import BarChart from '@/components/admin/charts/BarChart';
import VerticalBarChart from '@/components/admin/charts/VerticalBarChart';
import type { AdminOverview, AdminFarm } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  COW: '#00C896', SHEEP: '#3B82F6', GOAT: '#FFB020', CHICKEN: '#FF4757', HORSE: '#A855F7', PIG: '#F97316',
};

const STATUS_COLORS: Record<string, string> = {
  SAFE: '#00C896', WARNING: '#FFB020', ALERT: '#FF4757',
};

const LIVESTOCK_VALUES: Record<string, number> = {
  COW: 18000, SHEEP: 3500, GOAT: 2800, CHICKEN: 120, HORSE: 25000, PIG: 4500,
};

export default function LivestockPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [farms, setFarms] = useState<AdminFarm[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/overview').then((r) => r.json()),
      fetch('/api/admin/farms').then((r) => r.json()),
    ])
      .then(([o, f]) => { setOverview(o); setFarms(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !overview) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const typeData = Object.entries(overview.animalsByType).map(([label, value]) => ({
    label, value, color: TYPE_COLORS[label] || '#8899AA',
  }));

  const statusData = Object.entries(overview.animalsByStatus).map(([label, value]) => ({
    label, value, color: STATUS_COLORS[label] || '#8899AA',
  }));

  const batteryData = [
    { label: '70-100%', value: overview.batteryDistribution.healthy, color: '#00C896' },
    { label: '40-69%', value: overview.batteryDistribution.medium, color: '#FFB020' },
    { label: '20-39%', value: overview.batteryDistribution.low, color: '#F97316' },
    { label: '0-19%', value: overview.batteryDistribution.critical, color: '#FF4757' },
  ];

  const valueData = Object.entries(overview.animalsByType).map(([type, count]) => ({
    label: type,
    value: count * (LIVESTOCK_VALUES[type] || 0),
    color: TYPE_COLORS[type] || '#8899AA',
  })).sort((a, b) => b.value - a.value);

  const farmDensity = (farms || [])
    .map((f) => ({ name: f.name, count: f.animalCount, province: f.province }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 pb-12 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-lg font-bold text-white">Livestock Analytics</h1>
        <p className="text-xs text-text-muted mt-0.5">{overview.totalAnimals} animals across {overview.totalFarms} farms</p>
      </div>

      {/* Full-size Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-xl border border-primary/10 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <PieChart size={16} className="text-primary" />
          <h2 className="font-display text-sm font-bold text-white">Distribution by Type</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <DonutChart
            data={typeData}
            size={200}
            strokeWidth={28}
            centerValue={String(overview.totalAnimals)}
            centerLabel="Total"
          />
          <div className="flex-1 space-y-2 w-full md:w-auto">
            {typeData.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-text-secondary flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-white">{item.value}</span>
                <span className="text-xs text-text-muted w-12 text-right">
                  {((item.value / overview.totalAnimals) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Status + Battery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-xl border border-primary/10 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-primary" />
            <h2 className="font-display text-sm font-bold text-white">Status Breakdown</h2>
          </div>
          <BarChart data={statusData} />
          <div className="mt-4 space-y-2">
            {statusData.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-text-secondary">{item.label}</span>
                </div>
                <span className="font-semibold text-white">{item.value} ({((item.value / overview.totalAnimals) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface rounded-xl border border-primary/10 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Battery size={16} className="text-primary" />
            <h2 className="font-display text-sm font-bold text-white">Tracker Battery Health</h2>
          </div>
          <VerticalBarChart data={batteryData} height={140} />
          <div className="mt-4 space-y-2">
            {batteryData.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-text-secondary">{item.label}</span>
                </div>
                <span className="font-semibold text-white">{item.value} trackers</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Livestock Value by Type */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface rounded-xl border border-primary/10 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown size={16} className="text-warning" />
          <h2 className="font-display text-sm font-bold text-white">Estimated Livestock Value</h2>
          <span className="text-xs text-text-muted ml-auto">
            Total: R{(valueData.reduce((sum, v) => sum + v.value, 0) / 1000).toFixed(0)}k
          </span>
        </div>
        <div className="space-y-3">
          {valueData.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-text-secondary w-16">{item.label}</span>
              <div className="flex-1 h-6 bg-surface-light rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / valueData[0].value) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <span className="text-xs font-semibold text-white w-16 text-right">
                R{(item.value / 1000).toFixed(0)}k
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Animal Density per Farm */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-surface rounded-xl border border-primary/10 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-info" />
          <h2 className="font-display text-sm font-bold text-white">Animal Density per Farm</h2>
        </div>
        <div className="space-y-2">
          {farmDensity.map((farm, i) => (
            <div key={farm.name} className="flex items-center gap-3">
              <span className="font-display text-sm font-bold text-primary w-6 text-center">#{i + 1}</span>
              <span className="text-xs text-white flex-1 truncate">{farm.name}</span>
              <span className="text-[10px] text-text-muted">{farm.province}</span>
              <div className="w-24 h-4 bg-surface-light rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(farm.count / farmDensity[0].count) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <span className="text-xs font-semibold text-white w-8 text-right">{farm.count}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
