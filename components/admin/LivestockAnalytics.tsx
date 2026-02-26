'use client';

import { motion } from 'framer-motion';
import { PieChart, BarChart3, Battery } from 'lucide-react';
import DonutChart from './charts/DonutChart';
import BarChart from './charts/BarChart';
import VerticalBarChart from './charts/VerticalBarChart';
import type { AdminOverview } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  COW: '#00C896',
  SHEEP: '#3B82F6',
  GOAT: '#FFB020',
  CHICKEN: '#FF4757',
  HORSE: '#A855F7',
  PIG: '#F97316',
};

const STATUS_COLORS: Record<string, string> = {
  SAFE: '#00C896',
  WARNING: '#FFB020',
  ALERT: '#FF4757',
};

interface LivestockAnalyticsProps {
  data: AdminOverview | null;
}

export default function LivestockAnalytics({ data }: LivestockAnalyticsProps) {
  if (!data) return null;

  const typeData = Object.entries(data.animalsByType).map(([label, value]) => ({
    label,
    value,
    color: TYPE_COLORS[label] || '#8899AA',
  }));

  const statusData = Object.entries(data.animalsByStatus).map(([label, value]) => ({
    label,
    value,
    color: STATUS_COLORS[label] || '#8899AA',
  }));

  const batteryData = [
    { label: '70-100%', value: data.batteryDistribution.healthy, color: '#00C896' },
    { label: '40-69%', value: data.batteryDistribution.medium, color: '#FFB020' },
    { label: '20-39%', value: data.batteryDistribution.low, color: '#F97316' },
    { label: '0-19%', value: data.batteryDistribution.critical, color: '#FF4757' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <PieChart size={16} className="text-primary" />
        <h2 className="font-display text-sm font-bold text-white">Livestock Analytics</h2>
      </div>

      <div className="space-y-3">
        {/* Animal Type Distribution */}
        <div className="bg-surface rounded-xl border border-primary/10 p-4">
          <h3 className="text-xs text-text-secondary font-medium mb-3">Distribution by Type</h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <DonutChart
              data={typeData}
              size={140}
              strokeWidth={20}
              centerValue={String(data.totalAnimals)}
              centerLabel="Total"
            />
            <div className="flex-1 space-y-1.5 w-full sm:w-auto">
              {typeData.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-text-secondary flex-1">{item.label}</span>
                  <span className="text-xs font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status + Battery side by side on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-surface rounded-xl border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-primary" />
              <h3 className="text-xs text-text-secondary font-medium">Status Breakdown</h3>
            </div>
            <BarChart data={statusData} />
          </div>

          <div className="bg-surface rounded-xl border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Battery size={14} className="text-primary" />
              <h3 className="text-xs text-text-secondary font-medium">Tracker Battery Health</h3>
            </div>
            <VerticalBarChart data={batteryData} height={100} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
