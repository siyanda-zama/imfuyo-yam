export type AnimalType = "COW" | "SHEEP" | "GOAT" | "CHICKEN" | "HORSE" | "PIG";
export type AnimalStatus = "SAFE" | "WARNING" | "ALERT";
export type AlertType = "BOUNDARY_EXIT" | "LOW_BATTERY" | "INACTIVITY";

export interface Animal {
  id: string;
  name: string;
  tagId: string;
  type: AnimalType;
  status: AnimalStatus;
  battery: number;
  latitude: number;
  longitude: number;
  lastSeenAt: string;
}

export interface Farm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  hectares: number | null;
  _count?: { animals: number };
}

export interface Alert {
  id: string;
  animalId: string;
  type: AlertType;
  message: string;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
}

// Admin Dashboard Types
export interface AdminOverview {
  totalFarms: number;
  totalAnimals: number;
  totalFarmers: number;
  activeAlerts: number;
  estimatedLivestockValue: number;
  animalsByType: Record<string, number>;
  animalsByStatus: Record<string, number>;
  batteryDistribution: { healthy: number; medium: number; low: number; critical: number };
}

export interface AdminFarm extends Farm {
  owner: { name: string; phone: string; plan: string };
  animalCount: number;
  province: string;
  alertCount: number;
  healthScore: number;
}

export interface AlertAnalytics {
  byType: Record<string, number>;
  resolutionRate: number;
  avgResolutionTimeHours: number;
  recentTrend: { date: string; count: number }[];
}

export interface AIInsight {
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  description: string;
  metric?: string;
}

export interface RegionRisk {
  province: string;
  riskLevel: 'low' | 'medium' | 'high';
  alertCount: number;
  farmCount: number;
  animalCount: number;
}

// ─── FMD Types ─────────────────────────────────────────
export type FmdSeverity = 'SUSPECTED' | 'CONFIRMED' | 'RECOVERED' | 'CLEARED';
export type FmdSusceptibleType = 'COW' | 'SHEEP' | 'GOAT' | 'PIG';

export interface FmdReport {
  id: string;
  farmId: string;
  farm: { name: string; latitude: number; longitude: number };
  reportedById: string;
  reportedBy: { name: string; phone: string };
  animalId: string | null;
  animal: { name: string; tagId: string } | null;
  animalType: FmdSusceptibleType;
  affectedCount: number;
  severity: FmdSeverity;
  symptoms: string[];
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  vetNotified: boolean;
  vetName: string | null;
  quarantineStarted: boolean;
  reportedAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface FmdOverview {
  totalReports: number;
  confirmed: number;
  suspected: number;
  recovered: number;
  cleared: number;
  quarantinedFarms: number;
  provincesAffected: number;
  totalAffectedAnimals: number;
}

export interface FmdProvinceStatus {
  province: string;
  totalReports: number;
  confirmed: number;
  suspected: number;
  recovered: number;
  cleared: number;
  affectedFarms: number;
  affectedAnimals: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}
