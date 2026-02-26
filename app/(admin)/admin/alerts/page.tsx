'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShieldAlert, Search, CheckCircle } from 'lucide-react';
import BarChart from '@/components/admin/charts/BarChart';
import ProgressRing from '@/components/admin/charts/ProgressRing';
import SparkLine from '@/components/admin/charts/SparkLine';
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

interface AlertItem {
  id: string;
  type: string;
  message: string;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  animal: { name: string; tagId: string; farm: { name: string } };
}

export default function AlertsPage() {
  const [analytics, setAnalytics] = useState<AlertAnalyticsType | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/alerts').then((r) => r.json()),
      fetch('/api/admin/alerts?list=true').then((r) => r.json()),
    ])
      .then(([a, list]) => { setAnalytics(a); setAlerts(list.alerts || []); })
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

  const typeBarData = analytics
    ? Object.entries(analytics.byType).map(([key, value]) => ({
        label: ALERT_TYPE_LABELS[key] || key,
        value,
        color: ALERT_TYPE_COLORS[key] || '#8899AA',
      }))
    : [];

  const trendValues = analytics?.recentTrend.map((t) => t.count) || [];
  const trendLabels = analytics?.recentTrend.map((t) => {
    const date = new Date(t.date);
    return date.toLocaleDateString('en-ZA', { weekday: 'short' }).slice(0, 3);
  }) || [];

  const filteredAlerts = alerts.filter((a) => {
    if (search && !a.message.toLowerCase().includes(search.toLowerCase()) && !a.animal.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && a.type !== typeFilter) return false;
    if (statusFilter === 'active' && a.resolved) return false;
    if (statusFilter === 'resolved' && !a.resolved) return false;
    return true;
  });

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 pb-12 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-lg font-bold text-white">Alert Center</h1>
        <p className="text-xs text-text-muted mt-0.5">{alerts.length} total alerts</p>
      </div>

      {/* Stats Row */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-xl border border-primary/10 p-4 flex flex-col items-center"
          >
            <ProgressRing value={analytics.resolutionRate} size={80} strokeWidth={8} color="#00C896" label="Resolved" />
            <p className="text-[10px] text-text-muted mt-2">Resolution Rate</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-surface rounded-xl border border-primary/10 p-4 flex flex-col items-center justify-center"
          >
            <p className="font-display text-3xl font-bold text-white">{analytics.avgResolutionTimeHours}h</p>
            <p className="text-[10px] text-text-muted mt-1">Avg Resolution Time</p>
            <div className="flex items-center gap-1 mt-2">
              <ShieldAlert size={12} className="text-danger" />
              <span className="text-xs text-text-secondary">{alerts.filter((a) => !a.resolved).length} active</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-xl border border-primary/10 p-4 col-span-2"
          >
            <h3 className="text-xs text-text-secondary font-medium mb-3">Alerts by Type</h3>
            <BarChart data={typeBarData} />
          </motion.div>
        </div>
      )}

      {/* 7-day Trend */}
      {trendValues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface rounded-xl border border-primary/10 p-5"
        >
          <h3 className="text-xs text-text-secondary font-medium mb-3">7-Day Alert Trend</h3>
          <SparkLine data={trendValues} labels={trendLabels} color="#FF4757" height={80} />
        </motion.div>
      )}

      {/* Alert Feed */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bell size={16} className="text-danger" />
          <h2 className="font-display text-sm font-bold text-white">All Alerts</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border/30 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-surface border border-border/30 rounded-xl px-4 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-primary/50"
          >
            <option value="">All Types</option>
            <option value="BOUNDARY_EXIT">Boundary Exit</option>
            <option value="LOW_BATTERY">Low Battery</option>
            <option value="INACTIVITY">Inactivity</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-border/30 rounded-xl px-4 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-primary/50"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Alert List */}
        <div className="space-y-2">
          {filteredAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="bg-surface rounded-xl border border-border/30 p-4 flex items-start gap-3"
            >
              <div
                className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: ALERT_TYPE_COLORS[alert.type] || '#8899AA' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                    style={{
                      color: ALERT_TYPE_COLORS[alert.type],
                      backgroundColor: `${ALERT_TYPE_COLORS[alert.type]}15`,
                    }}
                  >
                    {ALERT_TYPE_LABELS[alert.type] || alert.type}
                  </span>
                  {alert.resolved && (
                    <span className="text-[10px] text-primary flex items-center gap-1">
                      <CheckCircle size={10} /> Resolved
                    </span>
                  )}
                </div>
                <p className="text-xs text-white">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-text-muted">{alert.animal.name}</span>
                  <span className="text-[10px] text-text-muted">·</span>
                  <span className="text-[10px] text-text-muted">{alert.animal.farm.name}</span>
                </div>
              </div>
              <span className="text-[10px] text-text-muted shrink-0">
                {new Date(alert.createdAt).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
              </span>
            </motion.div>
          ))}
          {filteredAlerts.length === 0 && (
            <div className="text-center py-12 text-text-muted text-sm">No alerts match your filters</div>
          )}
        </div>
      </div>
    </div>
  );
}
