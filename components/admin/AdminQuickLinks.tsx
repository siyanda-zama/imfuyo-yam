'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Activity, Bell, Brain, Bug, Award } from 'lucide-react';

const LINKS = [
  { label: 'Farm Management', description: 'View all farms, search & filter', icon: MapPin, href: '/admin/farms', color: '#00C896' },
  { label: 'Livestock Analytics', description: 'Type distribution & battery health', icon: Activity, href: '/admin/livestock', color: '#3B82F6' },
  { label: 'Alert Center', description: 'Active alerts & resolution metrics', icon: Bell, href: '/admin/alerts', color: '#FF4757' },
  { label: 'AI Analysis', description: 'Insights, risks & recommendations', icon: Brain, href: '/admin/analytics', color: '#A855F7' },
  { label: 'FMD Tracker', description: 'National FMD disease monitoring', icon: Bug, href: '/admin/fmd', color: '#FF4757' },
  { label: 'Farm Rankings', description: 'Health scores & performance', icon: Award, href: '/admin/farms', color: '#FFB020' },
];

export default function AdminQuickLinks() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {LINKS.map((link, i) => {
        const Icon = link.icon;
        return (
          <motion.button
            key={link.href + link.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
            onClick={() => router.push(link.href)}
            className="bg-surface rounded-xl border border-border/30 p-4 text-left hover:border-primary/30 transition-colors group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${link.color}15` }}
            >
              <Icon size={20} style={{ color: link.color }} />
            </div>
            <p className="font-display text-sm font-semibold text-white group-hover:text-primary transition-colors">
              {link.label}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">{link.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
