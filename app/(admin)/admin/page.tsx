'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminHeader from '@/components/admin/AdminHeader';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-secondary font-display">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-6 pb-12">
        {/* Overview Stats */}
        <OverviewCards data={overview} />

        {/* Regional Map */}
        <RegionalMap farms={farms} />

        {/* Livestock Analytics */}
        <LivestockAnalytics data={overview} />

        {/* Alert Analytics */}
        <AlertAnalytics data={alertData} />

        {/* Farm Performance */}
        <FarmPerformance farms={farms} />

        {/* AI Insights & Region Risks */}
        <AIInsights insights={insights} regionRisks={regionRisks} />

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
    </div>
  );
}
