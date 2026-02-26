'use client';

import { ArrowLeft, Shield, Activity, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50"
    >
      <div className="px-4 lg:px-6 py-3 flex items-center gap-3">
        {/* Mobile: hamburger menu */}
        <button
          onClick={onMenuToggle}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface hover:bg-surface-light transition-colors lg:hidden"
        >
          <Menu size={18} className="text-text-secondary" />
        </button>

        {/* Desktop: back button (sidebar handles nav) */}
        <button
          onClick={() => router.push('/account')}
          className="w-9 h-9 items-center justify-center rounded-xl bg-surface hover:bg-surface-light transition-colors hidden lg:flex"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>

        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center lg:hidden">
            <Shield size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-white leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-[10px] text-text-muted">HerdGuard National Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full">
          <Activity size={12} className="text-primary animate-pulse-live" />
          <span className="text-[10px] font-semibold text-primary">LIVE</span>
        </div>
      </div>
    </motion.header>
  );
}
