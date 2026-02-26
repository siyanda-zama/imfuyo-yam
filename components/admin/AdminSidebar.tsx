'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  MapPin,
  Bell,
  Brain,
  Award,
  ArrowLeft,
  X,
  Activity,
} from 'lucide-react';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, section: 'overview' },
  { label: 'Regional Map', icon: MapPin, section: 'regional-map' },
  { label: 'Livestock', icon: Activity, section: 'livestock' },
  { label: 'Alerts', icon: Bell, section: 'alerts' },
  { label: 'Farm Rankings', icon: Award, section: 'farms' },
  { label: 'AI Analysis', icon: Brain, section: 'ai-insights' },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const router = useRouter();

  const scrollTo = (section: string) => {
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold text-white">HerdGuard</h1>
            <p className="text-[10px] text-text-muted">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold px-3 mb-2">
          Dashboard
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.section}
              onClick={() => scrollTo(item.section)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-text-secondary hover:text-white hover:bg-surface-light transition-colors group"
            >
              <Icon size={18} className="text-text-muted group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <button
          onClick={() => router.push('/account')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-white hover:bg-surface-light transition-colors"
        >
          <ArrowLeft size={18} className="text-text-muted" />
          <span className="text-sm font-medium">Back to App</span>
        </button>
        <p className="text-[9px] text-text-muted text-center mt-3">
          Dept. of Agriculture, Land Reform
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex flex-col w-[260px] min-h-screen bg-surface border-r border-border/50 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-surface z-50 lg:hidden flex flex-col"
            >
              <div className="absolute top-3 right-3">
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-light"
                >
                  <X size={16} className="text-text-secondary" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
