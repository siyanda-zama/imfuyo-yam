'use client';

import { motion } from 'framer-motion';
import { Award, MapPin } from 'lucide-react';
import type { AdminFarm } from '@/lib/types';

interface FarmPerformanceProps {
  farms: AdminFarm[] | null;
}

function HealthBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#00C896' : score >= 60 ? '#FFB020' : '#FF4757';
  const bg = score >= 80 ? 'rgba(0,200,150,0.15)' : score >= 60 ? 'rgba(255,176,32,0.15)' : 'rgba(255,71,87,0.15)';

  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ color, backgroundColor: bg }}
    >
      {score}
    </span>
  );
}

export default function FarmPerformance({ farms }: FarmPerformanceProps) {
  if (!farms || farms.length === 0) return null;

  const sorted = [...farms].sort((a, b) => b.healthScore - a.healthScore);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Award size={16} className="text-warning" />
        <h2 className="font-display text-sm font-bold text-white">Farm Performance</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {sorted.map((farm, i) => (
          <motion.div
            key={farm.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
            className="bg-surface rounded-xl border border-border/30 p-3 flex items-center gap-3"
          >
            <span className="font-display text-lg font-bold text-primary w-7 text-center shrink-0">
              #{i + 1}
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-semibold text-white truncate">{farm.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-text-muted shrink-0" />
                <span className="text-[10px] text-text-muted">{farm.province}</span>
                <span className="text-[10px] text-text-muted mx-1">·</span>
                <span className="text-[10px] text-text-secondary truncate">{farm.owner.name}</span>
              </div>
            </div>

            <div className="text-right mr-1 shrink-0">
              <p className="text-sm font-semibold text-white">{farm.animalCount}</p>
              <p className="text-[10px] text-text-muted">animals</p>
            </div>

            <HealthBadge score={farm.healthScore} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
