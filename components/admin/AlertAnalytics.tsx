'use client';

import { motion } from 'framer-motion';
import { Bell, ShieldAlert } from 'lucide-react';
import BarChart from './charts/BarChart';
import ProgressRing from './charts/ProgressRing';
import SparkLine from './charts/SparkLine';
import type { AlertAnalytics as AlertAnalyticsType } from '@/lib/types';

const ALERT_TYPE_LABELS: Record<string, string> = {
  BOUNDARY_EXIT: 'Boundary Exit',
  LOW_BATTERY: 'Low Battery',
  INACTIVITY: 'Inactivity',
};

const ALERT_TYPE_COLORS: Record<string, string> = {
  BOUNDARY_EXIT: '#FF4757',
  LOW_BATTERY: '#FFB020',
  INACTIVITY: '#3B82F6',
};

interface AlertAnalyticsProps {
  data: AlertAnalyticsType | null;
}

export default function AlertAnalytics({ data }: AlertAnalyticsProps) {
  if (!data) return null;

  const typeBarData = Object.entries(data.byType).map(([key, value]) => ({
    label: ALERT_TYPE_LABELS[key] || key,
    value,
    color: ALERT_TYPE_COLORS[key] || '#8899AA',
  }));

  const trendValues = data.recentTrend.map((t) => t.count);
  const trendLabels = data.recentTrend.map((t) => {
    const date = new Date(t.date);
    return date.toLocaleDateString('en-ZA', { weekday: 'short' }).slice(0, 3);
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Bell size={16} className="text-danger" />
        <h2 className="font-display text-sm font-bold text-white">Alert Analytics</h2>
      </div>

      {/* Metrics row — responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div className="bg-surface rounded-xl border border-primary/10 p-4 flex flex-col items-center">
          <ProgressRing
            value={data.resolutionRate}
            size={80}
            strokeWidth={8}
            color="#00C896"
            label="Resolved"
          />
          <p className="text-[10px] text-text-muted mt-2">Resolution Rate</p>
        </div>
        <div className="bg-surface rounded-xl border border-primary/10 p-4 flex flex-col items-center justify-center">
          <p className="font-display text-2xl font-bold text-white">
            {data.avgResolutionTimeHours}h
          </p>
          <p className="text-[10px] text-text-muted mt-1">Avg Resolution Time</p>
          <div className="flex items-center gap-1 mt-2">
            <ShieldAlert size={12} className="text-danger" />
            <span className="text-xs text-text-secondary">
              {(data as any).activeAlerts || 0} active
            </span>
          </div>
        </div>

        {/* Alert types breakdown */}
        <div className="bg-surface rounded-xl border border-primary/10 p-4 col-span-2">
          <h3 className="text-xs text-text-secondary font-medium mb-3">Alerts by Type</h3>
          <BarChart data={typeBarData} />
        </div>
      </div>

      {/* 7-day trend — full width */}
      <div className="bg-surface rounded-xl border border-primary/10 p-4">
        <h3 className="text-xs text-text-secondary font-medium mb-3">7-Day Alert Trend</h3>
        <SparkLine data={trendValues} labels={trendLabels} color="#FF4757" height={70} />
      </div>
    </motion.section>
  );
}
