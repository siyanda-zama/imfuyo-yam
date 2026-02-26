'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, ChevronDown, ChevronUp, MapPin, Bug,
  Phone, Calendar, Shield, Beef, AlertTriangle,
} from 'lucide-react';
import { FMD_SEVERITY_COLORS } from '@/lib/icons';

interface UserFarm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  hectares: number | null;
  province: string;
  animalCount: number;
  fmdReportCount: number;
}

interface UserFmdReport {
  id: string;
  severity: string;
  animalType: string;
  affectedCount: number;
  reportedAt: string;
  symptomsCount: number;
  resolved: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  plan: string;
  createdAt: string;
  farms: UserFarm[];
  totalAnimals: number;
  typeBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  activeAlerts: number;
  fmdReports: UserFmdReport[];
  fmdSeverity: Record<string, number>;
  totalFmdReports: number;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function PlanBadge({ plan }: { plan: string }) {
  const isPro = plan === 'PRO';
  return (
    <span
      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
      style={{
        color: isPro ? '#00C896' : '#8B95A5',
        backgroundColor: isPro ? 'rgba(0,200,150,0.15)' : 'rgba(139,149,165,0.15)',
      }}
    >
      {plan}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors = FMD_SEVERITY_COLORS[severity as keyof typeof FMD_SEVERITY_COLORS] || { text: '#8B95A5', bg: 'rgba(139,149,165,0.15)' };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color: colors.text, backgroundColor: colors.bg }}
    >
      {severity}
    </span>
  );
}

function TypeBar({ breakdown }: { breakdown: Record<string, number> }) {
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  if (total === 0) return <span className="text-xs text-text-muted">No animals</span>;
  const typeColors: Record<string, string> = {
    COW: '#00C896', SHEEP: '#3B82F6', GOAT: '#FFB020', CHICKEN: '#FF4757',
    HORSE: '#A855F7', PIG: '#EC4899',
  };
  return (
    <div className="space-y-1">
      {Object.entries(breakdown).map(([type, count]) => (
        <div key={type} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeColors[type] || '#8B95A5' }} />
          <span className="text-text-secondary w-16">{type}</span>
          <div className="flex-1 bg-surface-light rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(count / total) * 100}%`, backgroundColor: typeColors[type] || '#8B95A5' }}
            />
          </div>
          <span className="text-white font-medium w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

function FarmMap({ farms }: { farms: UserFarm[] }) {
  if (!MAPBOX_TOKEN || farms.length === 0) return null;
  const lats = farms.map((f) => f.latitude);
  const lngs = farms.map((f) => f.longitude);
  const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
  const markers = farms.map((f) => `pin-s+00C896(${f.longitude},${f.latitude})`).join(',');
  const zoom = farms.length === 1 ? 12 : 6;
  const url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${markers}/${centerLng},${centerLat},${zoom},0/400x200@2x?access_token=${MAPBOX_TOKEN}`;

  return (
    <div className="rounded-xl overflow-hidden border border-border/30">
      <img src={url} alt="Farm locations" className="w-full h-[200px] object-cover" />
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = (users || []).filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.phone.includes(search)) return false;
    if (planFilter && u.plan !== planFilter) return false;
    return true;
  });

  const totalUsers = users?.length || 0;
  const basicCount = users?.filter((u) => u.plan === 'BASIC').length || 0;
  const proCount = users?.filter((u) => u.plan === 'PRO').length || 0;
  const fmdUsersCount = users?.filter((u) => u.totalFmdReports > 0).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Users size={22} className="text-primary" /> Registered Users
        </h1>
        <p className="text-xs text-text-muted mt-1">All farmer accounts with farms, livestock & FMD data</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: totalUsers, color: '#00C896' },
          { label: 'Basic Plan', value: basicCount, color: '#8B95A5' },
          { label: 'Pro Plan', value: proCount, color: '#3B82F6' },
          { label: 'FMD Reporters', value: fmdUsersCount, color: '#FF4757' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border/30 p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border/30 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="bg-surface border border-border/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
        >
          <option value="">All Plans</option>
          <option value="BASIC">Basic</option>
          <option value="PRO">Pro</option>
        </select>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm">No users found</div>
        ) : (
          filtered.map((user) => {
            const isExpanded = expandedUser === user.id;
            return (
              <motion.div
                key={user.id}
                layout
                className="bg-surface rounded-xl border border-border/30 overflow-hidden"
              >
                {/* User Summary Row */}
                <button
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  className="w-full text-left p-4 flex items-start gap-3 hover:bg-surface-light/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">
                      {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-white truncate">{user.name}</span>
                      <PlanBadge plan={user.plan} />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted mt-1">
                      <span className="flex items-center gap-1"><Phone size={10} /> {user.phone}</span>
                      <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px]">
                      <span className="flex items-center gap-1 text-text-secondary">
                        <MapPin size={10} className="text-primary" /> {user.farms.length} farm{user.farms.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1 text-text-secondary">
                        <Beef size={10} className="text-primary" /> {user.totalAnimals} animals
                      </span>
                      {user.activeAlerts > 0 && (
                        <span className="flex items-center gap-1 text-danger">
                          <AlertTriangle size={10} /> {user.activeAlerts} alerts
                        </span>
                      )}
                      {user.totalFmdReports > 0 && (
                        <span className="flex items-center gap-1 text-danger">
                          <Bug size={10} /> {user.totalFmdReports} FMD
                        </span>
                      )}
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp size={16} className="text-text-muted shrink-0 mt-1" />
                  ) : (
                    <ChevronDown size={16} className="text-text-muted shrink-0 mt-1" />
                  )}
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-4">
                        {/* Farm Map */}
                        <FarmMap farms={user.farms} />

                        {/* Farms */}
                        <div>
                          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            Farms ({user.farms.length})
                          </p>
                          <div className="space-y-2">
                            {user.farms.map((farm) => (
                              <div key={farm.id} className="bg-background rounded-lg p-3 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-white">{farm.name}</p>
                                  <p className="text-[10px] text-text-muted">
                                    {farm.province} &middot; {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                                    {farm.hectares ? ` · ${farm.hectares} ha` : ''}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-white">{farm.animalCount}</p>
                                  <p className="text-[10px] text-text-muted">animals</p>
                                </div>
                              </div>
                            ))}
                            {user.farms.length === 0 && (
                              <p className="text-xs text-text-muted italic">No farms registered</p>
                            )}
                          </div>
                        </div>

                        {/* Animal Breakdown */}
                        {user.totalAnimals > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                              Livestock ({user.totalAnimals})
                            </p>
                            <div className="bg-background rounded-lg p-3">
                              <TypeBar breakdown={user.typeBreakdown} />
                            </div>
                          </div>
                        )}

                        {/* Status Breakdown */}
                        {user.totalAnimals > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                              Animal Status
                            </p>
                            <div className="flex gap-2">
                              {Object.entries(user.statusBreakdown).map(([status, count]) => {
                                const statusColors: Record<string, string> = { SAFE: '#00C896', WARNING: '#FFB020', ALERT: '#FF4757' };
                                return (
                                  <div key={status} className="bg-background rounded-lg p-2 flex-1 text-center">
                                    <p className="text-lg font-bold" style={{ color: statusColors[status] || '#fff' }}>{count}</p>
                                    <p className="text-[9px] text-text-muted uppercase">{status}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* FMD Reports */}
                        {user.fmdReports.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                              <Bug size={12} className="inline text-danger mr-1" />
                              FMD Reports ({user.fmdReports.length})
                            </p>
                            <div className="space-y-2">
                              {user.fmdReports.map((report) => (
                                <div key={report.id} className="bg-background rounded-lg p-3 flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <SeverityBadge severity={report.severity} />
                                      <span className="text-xs text-white font-medium">{report.animalType}</span>
                                      {report.resolved && (
                                        <span className="text-[9px] text-primary font-medium">Resolved</span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-1">
                                      {report.affectedCount} affected &middot; {report.symptomsCount} symptoms &middot; {new Date(report.reportedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      <p className="text-center text-[10px] text-text-muted pb-4">
        Showing {filtered.length} of {totalUsers} users
      </p>
    </div>
  );
}
