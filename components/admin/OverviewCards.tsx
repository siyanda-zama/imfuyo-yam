'use client';

import { motion } from 'framer-motion';
import { MapPin, Beef, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import type { AdminOverview } from '@/lib/types';

interface OverviewCardsProps {
  data: AdminOverview | null;
}

export default function OverviewCards({ data }: OverviewCardsProps) {
  const cards = [
    {
      label: 'Total Farms',
      value: data?.totalFarms ?? 0,
      icon: MapPin,
      color: '#00C896',
    },
    {
      label: 'Total Animals',
      value: data?.totalAnimals ?? 0,
      icon: Beef,
      color: '#3B82F6',
    },
    {
      label: 'Active Alerts',
      value: data?.activeAlerts ?? 0,
      icon: AlertTriangle,
      color: '#FF4757',
    },
    {
      label: 'Registered Farmers',
      value: data?.totalFarmers ?? 0,
      icon: Users,
      color: '#FFB020',
    },
    {
      label: 'Livestock Value',
      value: data?.estimatedLivestockValue ?? 0,
      icon: TrendingUp,
      color: '#00C896',
      format: 'currency',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const displayValue = card.format === 'currency'
          ? `R${(card.value / 1000).toFixed(0)}k`
          : card.value.toLocaleString();

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className={`bg-surface rounded-xl border border-primary/10 p-4 ${i === cards.length - 1 ? 'col-span-2' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <Icon size={20} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                  {card.label}
                </p>
                <p className="font-display text-xl font-bold text-white">{displayValue}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
