'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import OverviewCards from '@/components/admin/OverviewCards';
import RegionalMap from '@/components/admin/RegionalMap';
import LivestockAnalytics from '@/components/admin/LivestockAnalytics';
import AlertAnalytics from '@/components/admin/AlertAnalytics';
import FarmPerformance from '@/components/admin/FarmPerformance';
import AIInsights from '@/components/admin/AIInsights';
import type { AdminOverview, AdminFarm, AlertAnalytics as AlertAnalyticsType, AIInsight, RegionRisk } from '@/lib/types';

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [farms, setFarms] = useState<AdminFarm[] | null>(null);
  const [alertData, setAlertData] = useState<AlertAnalyticsType | null>(null);
  const [insights, setInsights] = useState<AIInsight[] | null>(null);
  const [regionRisks, setRegionRisks] = useState<RegionRisk[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, farmsRes, alertsRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/overview'),
          fetch('/api/admin/farms'),
          fetch('/api/admin/alerts'),
          fetch('/api/admin/analytics'),
        ]);

        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (farmsRes.ok) setFarms(await farmsRes.json());
        if (alertsRes.ok) setAlertData(await alertsRes.json());
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setInsights(data.insights);
          setRegionRisks(data.regionRisks);
        }
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

  return (
    <div className="px-4 lg:px-8 py-6 space-y-8 pb-12 max-w-[1400px] mx-auto">
      {/* Overview Stats */}
      <section id="overview">
        <OverviewCards data={overview} />
      </section>

      {/* Two-column layout for map + livestock on desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section id="regional-map">
          <RegionalMap farms={farms} />
        </section>
        <section id="livestock">
          <LivestockAnalytics data={overview} />
        </section>
      </div>

      {/* Alert Analytics */}
      <section id="alerts">
        <AlertAnalytics data={alertData} />
      </section>

      {/* Farm Performance */}
      <section id="farms">
        <FarmPerformance farms={farms} />
      </section>

      {/* AI Insights & Region Risks */}
      <section id="ai-insights">
        <AIInsights insights={insights} regionRisks={regionRisks} />
      </section>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
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
