'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Bug, FileText, MapPin, Clock, AlertTriangle, Check, Shield,
} from 'lucide-react';
import { FMD_SYMPTOMS } from '@/lib/provinces';

interface FmdReport {
  id: string;
  animalType: string;
  affectedCount: number;
  severity: string;
  symptoms: string[];
  notes: string | null;
  vetNotified: boolean;
  vetName: string | null;
  quarantineStarted: boolean;
  reportedAt: string;
  resolvedAt: string | null;
  farm: { name: string };
  animal: { name: string; tagId: string } | null;
}

const severityStyles: Record<string, { bg: string; text: string; border: string }> = {
  SUSPECTED: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  CONFIRMED: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30' },
  RECOVERED: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
  CLEARED: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function FmdReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<FmdReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SUSPECTED' | 'CONFIRMED' | 'RECOVERED' | 'CLEARED'>('ALL');

  useEffect(() => {
    fetch('/api/fmd/reports')
      .then((r) => r.json())
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? reports : reports.filter((r) => r.severity === filter);

  const counts = {
    ALL: reports.length,
    SUSPECTED: reports.filter((r) => r.severity === 'SUSPECTED').length,
    CONFIRMED: reports.filter((r) => r.severity === 'CONFIRMED').length,
    RECOVERED: reports.filter((r) => r.severity === 'RECOVERED').length,
    CLEARED: reports.filter((r) => r.severity === 'CLEARED').length,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-lg border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-text-secondary">
            <ArrowLeft size={20} />
          </button>
          <FileText size={18} className="text-danger" />
          <h1 className="font-display text-sm font-bold text-white flex-1">My FMD Reports</h1>
          <span className="text-[10px] text-text-muted">{reports.length} total</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {(['ALL', 'SUSPECTED', 'CONFIRMED', 'RECOVERED', 'CLEARED'] as const).map((key) => {
            const styles = key === 'ALL'
              ? { bg: 'bg-surface-light', text: 'text-white', border: 'border-border' }
              : severityStyles[key];
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
                  filter === key
                    ? `${styles.bg} ${styles.text} ${styles.border}`
                    : 'bg-surface border-border/30 text-text-muted'
                }`}
              >
                {key === 'ALL' ? 'All' : key.charAt(0) + key.slice(1).toLowerCase()} ({counts[key]})
              </button>
            );
          })}
        </div>

        {/* Quick link to outbreak map */}
        <a
          href="/herd/fmd-map"
          className="flex items-center gap-3 bg-surface rounded-xl border border-border/30 p-3 mb-4 no-underline"
        >
          <MapPin size={16} className="text-danger" />
          <span className="text-xs text-text-secondary flex-1">View outbreak map in your area</span>
          <span className="text-[10px] text-danger font-medium">View Map</span>
        </a>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl animate-shimmer bg-surface" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Bug size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-muted">
              {filter === 'ALL' ? 'No FMD reports filed yet.' : `No ${filter.toLowerCase()} reports.`}
            </p>
            <a
              href="/herd/fmd-report"
              className="inline-block mt-4 bg-danger text-white font-display font-semibold px-5 py-2.5 rounded-xl text-sm no-underline"
            >
              File a Report
            </a>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
            initial="initial"
            animate="animate"
          >
            {filtered.map((report) => {
              const sev = severityStyles[report.severity] || severityStyles.SUSPECTED;
              return (
                <motion.div
                  key={report.id}
                  variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}
                  className={`bg-surface rounded-xl border ${sev.border} p-4 space-y-2`}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bug size={14} className={sev.text} />
                      <span className={`text-xs font-bold ${sev.text}`}>{report.severity}</span>
                    </div>
                    <div className="flex items-center gap-1 text-text-muted">
                      <Clock size={10} />
                      <span className="text-[10px]">{timeAgo(report.reportedAt)}</span>
                    </div>
                  </div>

                  {/* Animal info */}
                  <div className="flex items-center justify-between">
                    <div>
                      {report.animal ? (
                        <p className="text-sm text-white font-medium">
                          {report.animal.name} <span className="text-text-muted text-[10px]">({report.animal.tagId})</span>
                        </p>
                      ) : (
                        <p className="text-sm text-white font-medium">{report.animalType}</p>
                      )}
                      <p className="text-[10px] text-text-muted">{report.farm.name}</p>
                    </div>
                    {report.resolvedAt && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={10} /> Resolved
                      </span>
                    )}
                  </div>

                  {/* Symptoms */}
                  {report.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {report.symptoms.slice(0, 3).map((s) => {
                        const sym = FMD_SYMPTOMS.find((fs) => fs.key === s);
                        return (
                          <span key={s} className="text-[9px] bg-danger/10 text-danger px-1.5 py-0.5 rounded-full">
                            {sym?.label.split(',')[0] || s}
                          </span>
                        );
                      })}
                      {report.symptoms.length > 3 && (
                        <span className="text-[9px] text-text-muted">+{report.symptoms.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Status indicators */}
                  <div className="flex gap-3 text-[10px]">
                    {report.vetNotified && (
                      <span className="text-primary flex items-center gap-1">
                        <Shield size={10} /> Vet {report.vetName || 'notified'}
                      </span>
                    )}
                    {report.quarantineStarted && (
                      <span className="text-warning flex items-center gap-1">
                        <AlertTriangle size={10} /> Quarantined
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
