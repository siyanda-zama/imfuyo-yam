'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, AlertTriangle, Shield, CheckCircle, MapPin, Activity } from 'lucide-react';
import DonutChart from '@/components/admin/charts/DonutChart';
import SparkLine from '@/components/admin/charts/SparkLine';
import type { FmdOverview, FmdProvinceStatus, FmdReport } from '@/lib/types';
import { FMD_SEVERITY_COLORS } from '@/lib/icons';

const RISK_COLORS: Record<string, { text: string; bg: string }> = {
  low: { text: '#00C896', bg: 'rgba(0,200,150,0.15)' },
  medium: { text: '#FFB020', bg: 'rgba(255,176,32,0.15)' },
  high: { text: '#FF4757', bg: 'rgba(255,71,87,0.15)' },
  critical: { text: '#FF4757', bg: 'rgba(255,71,87,0.25)' },
};

const ANIMAL_TYPE_COLORS: Record<string, string> = {
  COW: '#00C896', SHEEP: '#3B82F6', GOAT: '#FFB020', PIG: '#F97316',
};

export default function FmdDashboard() {
  const [overview, setOverview] = useState<FmdOverview | null>(null);
  const [provinces, setProvinces] = useState<FmdProvinceStatus[] | null>(null);
  const [reports, setReports] = useState<FmdReport[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/fmd/overview').then((r) => r.json()),
      fetch('/api/admin/fmd/provinces').then((r) => r.json()),
      fetch('/api/admin/fmd/reports').then((r) => r.json()),
    ])
      .then(([o, p, r]) => { setOverview(o); setProvinces(p); setReports(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Donut data by animal type
  const typeGroups: Record<string, number> = {};
  if (reports) {
    for (const r of reports) {
      typeGroups[r.animalType] = (typeGroups[r.animalType] || 0) + r.affectedCount;
    }
  }
  const typeDonutData = Object.entries(typeGroups).map(([label, value]) => ({
    label, value, color: ANIMAL_TYPE_COLORS[label] || '#8899AA',
  }));

  // Timeline data (last 30 days)
  const timelineData: number[] = [];
  const timelineLabels: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = (reports || []).filter((r) => {
      const rDate = new Date(r.reportedAt).toISOString().split('T')[0];
      return rDate === dateStr;
    }).length;
    timelineData.push(count);
    if (i % 7 === 0) {
      timelineLabels.push(date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }));
    } else {
      timelineLabels.push('');
    }
  }

  const statCards = [
    { label: 'Total Reports', value: overview?.totalReports ?? 0, color: '#3B82F6', icon: Bug },
    { label: 'Confirmed', value: overview?.confirmed ?? 0, color: '#FF4757', icon: AlertTriangle },
    { label: 'Suspected', value: overview?.suspected ?? 0, color: '#FFB020', icon: Activity },
    { label: 'Recovered', value: overview?.recovered ?? 0, color: '#00C896', icon: Shield },
    { label: 'Quarantined Farms', value: overview?.quarantinedFarms ?? 0, color: '#A855F7', icon: MapPin },
    { label: 'Provinces Affected', value: `${overview?.provincesAffected ?? 0}/9`, color: '#FF4757', icon: MapPin },
  ];

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 pb-12 max-w-[1400px] mx-auto">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-danger/10 border border-danger/30 rounded-xl p-5"
      >
        <div className="flex items-center gap-3">
          <Bug size={24} className="text-danger" />
          <div>
            <h1 className="font-display text-lg font-bold text-danger">FMD National Tracker</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              National State of Disaster declared Feb 2026 · Foot-and-Mouth Disease surveillance
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface rounded-xl border border-primary/10 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: card.color }} />
                <span className="text-[10px] text-text-muted uppercase tracking-wider">{card.label}</span>
              </div>
              <p className="font-display text-2xl font-bold text-white">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Province Status + Animal Type Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Province Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-surface rounded-xl border border-primary/10 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-danger" />
            <h2 className="font-display text-sm font-bold text-white">Province Status</h2>
          </div>
          {provinces && provinces.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left text-text-muted font-medium py-2 pr-4">Province</th>
                    <th className="text-center text-text-muted font-medium py-2 px-2">Risk</th>
                    <th className="text-center text-text-muted font-medium py-2 px-2">Reports</th>
                    <th className="text-center text-text-muted font-medium py-2 px-2">Confirmed</th>
                    <th className="text-center text-text-muted font-medium py-2 px-2">Suspected</th>
                    <th className="text-center text-text-muted font-medium py-2 px-2">Farms</th>
                    <th className="text-center text-text-muted font-medium py-2 px-2">Animals</th>
                  </tr>
                </thead>
                <tbody>
                  {provinces.map((p) => {
                    const riskStyle = RISK_COLORS[p.riskLevel] || RISK_COLORS.low;
                    return (
                      <tr key={p.province} className="border-b border-border/10">
                        <td className="py-2.5 pr-4 font-medium text-white">{p.province}</td>
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                            style={{ color: riskStyle.text, backgroundColor: riskStyle.bg }}
                          >
                            {p.riskLevel}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-text-secondary">{p.totalReports}</td>
                        <td className="py-2.5 px-2 text-center font-semibold text-danger">{p.confirmed}</td>
                        <td className="py-2.5 px-2 text-center text-warning">{p.suspected}</td>
                        <td className="py-2.5 px-2 text-center text-text-secondary">{p.affectedFarms}</td>
                        <td className="py-2.5 px-2 text-center text-text-secondary">{p.affectedAnimals}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-muted text-sm">No province data available</p>
          )}
        </motion.div>

        {/* Cases by Animal Type */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-xl border border-primary/10 p-5"
        >
          <h2 className="font-display text-sm font-bold text-white mb-4">Cases by Animal Type</h2>
          <div className="flex flex-col items-center gap-4">
            <DonutChart
              data={typeDonutData}
              size={160}
              strokeWidth={22}
              centerValue={String(overview?.totalAffectedAnimals ?? 0)}
              centerLabel="Affected"
            />
            <div className="w-full space-y-2">
              {typeDonutData.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-text-secondary flex-1">{item.label}</span>
                  <span className="text-xs font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Case Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-surface rounded-xl border border-primary/10 p-5"
      >
        <h2 className="font-display text-sm font-bold text-white mb-4">30-Day Case Timeline</h2>
        <SparkLine data={timelineData} labels={timelineLabels} color="#FF4757" height={80} />
      </motion.div>

      {/* Reports List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Bug size={16} className="text-danger" />
          <h2 className="font-display text-sm font-bold text-white">All FMD Reports</h2>
          <span className="text-[10px] text-text-muted ml-auto">{reports?.length ?? 0} reports</span>
        </div>
        <div className="space-y-2">
          {(reports || []).map((report, i) => {
            const sevStyle = FMD_SEVERITY_COLORS[report.severity] || FMD_SEVERITY_COLORS.SUSPECTED;
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.3 + i * 0.03 }}
                className="bg-surface rounded-xl border border-border/30 p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: sevStyle.text }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-display text-sm font-semibold text-white">{report.farm.name}</span>
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                        style={{ color: sevStyle.text, backgroundColor: sevStyle.bg }}
                      >
                        {report.severity}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-light text-text-secondary">
                        {report.animalType}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{report.notes}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted flex-wrap">
                      <span>{report.affectedCount} affected</span>
                      <span>·</span>
                      <span>Reported by {report.reportedBy.name}</span>
                      <span>·</span>
                      <span>{new Date(report.reportedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {report.vetNotified && (
                        <>
                          <span>·</span>
                          <span className="text-primary">Vet: {report.vetName}</span>
                        </>
                      )}
                      {report.quarantineStarted && (
                        <>
                          <span>·</span>
                          <span className="text-warning">Quarantined</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
