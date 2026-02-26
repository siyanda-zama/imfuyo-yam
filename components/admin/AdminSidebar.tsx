'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import {
  Shield,
  LayoutDashboard,
  MapPin,
  Activity,
  Bell,
  Brain,
  Bug,
  LogOut,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { label: 'Farms', icon: MapPin, href: '/admin/farms' },
  { label: 'Livestock', icon: Activity, href: '/admin/livestock' },
  { label: 'Alerts', icon: Bell, href: '/admin/alerts' },
  { label: 'Analytics', icon: Brain, href: '/admin/analytics' },
  { label: 'FMD Tracker', icon: Bug, href: '/admin/fmd', danger: true },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
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
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group ${
                active
                  ? 'bg-primary/10 text-white'
                  : 'text-text-secondary hover:text-white hover:bg-surface-light'
              }`}
            >
              <Icon
                size={18}
                className={`transition-colors ${
                  active
                    ? item.danger ? 'text-danger' : 'text-primary'
                    : item.danger ? 'text-danger/60 group-hover:text-danger' : 'text-text-muted group-hover:text-primary'
                }`}
              />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {item.danger && (
                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-danger/15 text-danger">
                  Alert
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-danger/80 hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
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
