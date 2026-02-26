'use client';

import { motion } from 'framer-motion';
import { Brain, TrendingUp, Battery, AlertTriangle, Sun, Shield, MapPin } from 'lucide-react';
import type { AIInsight, RegionRisk } from '@/lib/types';

const INSIGHT_CONFIG: Record<string, { icon: typeof TrendingUp; bg: string }> = {
  warning: { icon: AlertTriangle, bg: 'rgba(255,176,32,0.15)' },
  danger: { icon: AlertTriangle, bg: 'rgba(255,71,87,0.15)' },
  success: { icon: Shield, bg: 'rgba(0,200,150,0.15)' },
  info: { icon: Sun, bg: 'rgba(59,130,246,0.15)' },
};

const INSIGHT_COLORS: Record<string, string> = {
  warning: '#FFB020',
  danger: '#FF4757',
  success: '#00C896',
  info: '#3B82F6',
};

const RISK_COLORS: Record<string, { text: string; bg: string }> = {
  low: { text: '#00C896', bg: 'rgba(0,200,150,0.15)' },
  medium: { text: '#FFB020', bg: 'rgba(255,176,32,0.15)' },
  high: { text: '#FF4757', bg: 'rgba(255,71,87,0.15)' },
};

interface AIInsightsProps {
  insights: AIInsight[] | null;
  regionRisks: RegionRisk[] | null;
}

export default function AIInsights({ insights, regionRisks }: AIInsightsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      {/* AI Insights */}
      <div className="flex items-center gap-2 mb-3">
        <Brain size={16} className="text-primary" />
        <h2 className="font-display text-sm font-bold text-white">AI Analysis</h2>
        <span className="text-[9px] px-1.5 py-0.5 bg-primary/15 text-primary rounded-full font-semibold">
          AUTO
        </span>
      </div>

      {insights && insights.length > 0 && (
        <div className="space-y-2 mb-4">
          {insights.map((insight, i) => {
            const config = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.info;
            const Icon = config.icon;
            const color = INSIGHT_COLORS[insight.type] || '#3B82F6';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.06 }}
                className="bg-surface rounded-xl border border-primary/10 p-3.5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: config.bg }}
                  >
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xs font-semibold text-white leading-snug">
                      {insight.title}
                    </p>
                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                      {insight.description}
                    </p>
                    {insight.metric && (
                      <span
                        className="inline-block mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color, backgroundColor: config.bg }}
                      >
                        {insight.metric}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Region Risks */}
      {regionRisks && regionRisks.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-info" />
            <h2 className="font-display text-sm font-bold text-white">Regional Risk Assessment</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {regionRisks.map((region, i) => {
              const riskStyle = RISK_COLORS[region.riskLevel] || RISK_COLORS.low;
              return (
                <motion.div
                  key={region.province}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
                  className="bg-surface rounded-xl border border-border/30 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white truncate">{region.province}</span>
                    <span
                      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                      style={{ color: riskStyle.text, backgroundColor: riskStyle.bg }}
                    >
                      {region.riskLevel}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-text-muted">Farms</span>
                      <span className="text-text-secondary">{region.farmCount}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-text-muted">Animals</span>
                      <span className="text-text-secondary">{region.animalCount}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-text-muted">Alerts</span>
                      <span className="font-semibold" style={{ color: riskStyle.text }}>
                        {region.alertCount}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </motion.section>
  );
}
