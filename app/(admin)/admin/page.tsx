'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bug } from 'lucide-react';
import OverviewCards from '@/components/admin/OverviewCards';
import AdminQuickLinks from '@/components/admin/AdminQuickLinks';
import SparkLine from '@/components/admin/charts/SparkLine';
import DonutChart from '@/components/admin/charts/DonutChart';
import ProgressRing from '@/components/admin/charts/ProgressRing';
import type { AdminOverview, AlertAnalytics as AlertAnalyticsType, FmdOverview } from '@/lib/types';

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [alertData, setAlertData] = useState<AlertAnalyticsType | null>(null);
  const [fmdOverview, setFmdOverview] = useState<FmdOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, alertsRes, fmdRes] = await Promise.all([
          fetch('/api/admin/overview'),
          fetch('/api/admin/alerts'),
          fetch('/api/admin/fmd/overview'),
        ]);

        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (alertsRes.ok) setAlertData(await alertsRes.json());
        if (fmdRes.ok) setFmdOverview(await fmdRes.json());
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-secondary font-display">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const typeData = overview?.animalsByType
    ? Object.entries(overview.animalsByType).map(([label, value]) => ({
        label,
        value,
        color: { COW: '#00C896', SHEEP: '#3B82F6', GOAT: '#FFB020', CHICKEN: '#FF4757', HORSE: '#A855F7', PIG: '#F97316' }[label] || '#8899AA',
      }))
    : [];

  const trendValues = alertData?.recentTrend.map((t) => t.count) || [];
  const trendLabels = alertData?.recentTrend.map((t) => {
    const date = new Date(t.date);
    return date.toLocaleDateString('en-ZA', { weekday: 'short' }).slice(0, 3);
  }) || [];

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 pb-12 max-w-[1400px] mx-auto">
      {/* FMD Alert Banner */}
      {fmdOverview && fmdOverview.confirmed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-center gap-3"
        >
          <Bug size={20} className="text-danger shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold text-danger">FMD National Alert</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {fmdOverview.confirmed} confirmed cases across {fmdOverview.provincesAffected} provinces.
              {fmdOverview.quarantinedFarms > 0 && ` ${fmdOverview.quarantinedFarms} farms quarantined.`}
            </p>
          </div>
          <a
            href="/admin/fmd"
            className="text-xs font-semibold text-danger hover:underline shrink-0"
          >
            View Details
          </a>
        </motion.div>
      )}

      {/* Overview Stats */}
      <OverviewCards data={overview} />

      {/* Mini Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Livestock Donut Mini */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-xl border border-primary/10 p-4"
        >
          <h3 className="text-xs text-text-secondary font-medium mb-3">Livestock by Type</h3>
          <div className="flex items-center gap-4">
            <DonutChart
              data={typeData}
              size={100}
              strokeWidth={16}
              centerValue={String(overview?.totalAnimals ?? 0)}
              centerLabel="Total"
            />
            <div className="flex-1 space-y-1">
              {typeData.slice(0, 4).map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-text-secondary flex-1">{item.label}</span>
                  <span className="text-[10px] font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Alert Trend Mini */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-surface rounded-xl border border-primary/10 p-4"
        >
          <h3 className="text-xs text-text-secondary font-medium mb-3">7-Day Alert Trend</h3>
          {trendValues.length > 0 && (
            <SparkLine data={trendValues} labels={trendLabels} color="#FF4757" height={70} />
          )}
        </motion.div>

        {/* Resolution Rate Mini */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-xl border border-primary/10 p-4 flex flex-col items-center justify-center"
        >
          <ProgressRing
            value={alertData?.resolutionRate ?? 0}
            size={80}
            strokeWidth={8}
            color="#00C896"
            label="Resolved"
          />
          <p className="text-[10px] text-text-muted mt-2">Alert Resolution Rate</p>
          <p className="text-xs text-text-secondary mt-1">
            Avg {alertData?.avgResolutionTimeHours ?? 0}h resolution
          </p>
        </motion.div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="font-display text-sm font-bold text-white mb-3">Quick Navigation</h2>
        <AdminQuickLinks />
      </div>

      {/* Recent Alerts Feed (compact) */}
      {alertData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-danger" />
            <h2 className="font-display text-sm font-bold text-white">Active Alerts</h2>
            <a href="/admin/alerts" className="text-[10px] text-primary ml-auto hover:underline">
              View All
            </a>
          </div>
          <div className="bg-surface rounded-xl border border-border/30 divide-y divide-border/20">
            {Object.entries(alertData.byType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      type === 'BOUNDARY_EXIT' ? '#FF4757' : type === 'LOW_BATTERY' ? '#FFB020' : '#3B82F6',
                  }}
                />
                <span className="text-xs text-text-secondary flex-1">
                  {type === 'BOUNDARY_EXIT' ? 'Boundary Exit' : type === 'LOW_BATTERY' ? 'Low Battery' : 'Inactivity'}
                </span>
                <span className="text-sm font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center pt-4 pb-8"
      >
        <p className="text-[10px] text-text-muted">
          HerdGuard Admin Dashboard · Data refreshed in real-time
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">
          Department of Agriculture, Land Reform and Rural Development
        </p>
      </motion.div>
    </div>
  );
}
