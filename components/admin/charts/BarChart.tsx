'use client';

import { motion } from 'framer-motion';

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarData[];
  showValues?: boolean;
}

export default function BarChart({ data, showValues = true }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-text-secondary">{item.label}</span>
            {showValues && <span className="text-white font-medium">{item.value}</span>}
          </div>
          <div className="h-2.5 bg-border/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
