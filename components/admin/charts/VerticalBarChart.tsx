'use client';

import { motion } from 'framer-motion';

interface VerticalBarData {
  label: string;
  value: number;
  color: string;
}

interface VerticalBarChartProps {
  data: VerticalBarData[];
  height?: number;
}

export default function VerticalBarChart({ data, height = 120 }: VerticalBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.value / maxValue) * (height - 24);
        return (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-secondary font-medium">{item.value}</span>
            <motion.div
              className="w-full rounded-t-md min-h-[4px]"
              style={{ backgroundColor: item.color }}
              initial={{ height: 0 }}
              animate={{ height: barHeight }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
            />
            <span className="text-[9px] text-text-muted truncate w-full text-center">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
