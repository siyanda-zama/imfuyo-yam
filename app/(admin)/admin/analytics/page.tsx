'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import AIInsights from '@/components/admin/AIInsights';
import type { AIInsight, RegionRisk } from '@/lib/types';

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<AIInsight[] | null>(null);
  const [regionRisks, setRegionRisks] = useState<RegionRisk[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((data) => {
        setInsights(data.insights);
        setRegionRisks(data.regionRisks);
      })
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

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 pb-12 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-lg font-bold text-white">AI Analysis & Insights</h1>
        <p className="text-xs text-text-muted mt-0.5">Automated pattern detection and risk assessment</p>
      </div>

      <AIInsights insights={insights} regionRisks={regionRisks} />

      {/* Recommendations */}
      {insights && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-xl border border-primary/10 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} className="text-primary" />
            <h2 className="font-display text-sm font-bold text-white">Recommendations</h2>
          </div>
          <div className="space-y-3">
            {insights.filter((i) => i.type === 'warning' || i.type === 'danger').map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <span className="text-primary font-bold mt-0.5">{idx + 1}.</span>
                <div>
                  <p className="text-white font-medium">{insight.title}</p>
                  <p className="text-text-secondary mt-0.5">{insight.description}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 text-xs">
              <span className="text-primary font-bold mt-0.5">{(insights.filter((i) => i.type === 'warning' || i.type === 'danger').length) + 1}.</span>
              <div>
                <p className="text-white font-medium">Schedule preventive maintenance</p>
                <p className="text-text-secondary mt-0.5">Regular tracker battery checks and firmware updates can prevent 40% of low-battery alerts.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <span className="text-primary font-bold mt-0.5">{(insights.filter((i) => i.type === 'warning' || i.type === 'danger').length) + 2}.</span>
              <div>
                <p className="text-white font-medium">FMD surveillance intensification</p>
                <p className="text-text-secondary mt-0.5">Given the national FMD state of disaster, increase reporting frequency and monitor susceptible species closely.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
