import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function getProvince(lat: number, lng: number): string {
  if (lat < -30 && lng > 27 && lng < 30) return 'Eastern Cape';
  if (lat > -30 && lat < -27 && lng > 29 && lng < 33) return 'KwaZulu-Natal';
  if (lat > -31 && lat < -28 && lng > 24 && lng < 28) return 'Free State';
  if (lat > -27 && lat < -24 && lng > 29 && lng < 32) return 'Mpumalanga';
  if (lat > -25 && lng > 28 && lng < 31) return 'Limpopo';
  if (lat > -29 && lat < -27 && lng > 29 && lng < 31) return 'KwaZulu-Natal';
  return 'Other';
}

function countInRange(alerts: { createdAt: Date }[], daysBack: number, daysEnd: number = 0) {
  const now = Date.now();
  const start = now - daysBack * 86400000;
  const end = now - daysEnd * 86400000;
  return alerts.filter((a) => {
    const t = new Date(a.createdAt).getTime();
    return t >= start && t <= end;
  }).length;
}

interface Insight {
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  description: string;
  metric?: string;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [animals, alerts, farms] = await Promise.all([
    prisma.animal.findMany({ include: { farm: true } }),
    prisma.alert.findMany({ include: { animal: { include: { farm: true } } } }),
    prisma.farm.findMany({ include: { _count: { select: { animals: true } } } }),
  ]);

  const insights: Insight[] = [];

  // 1. Alert trend detection
  const thisWeek = countInRange(alerts, 7);
  const lastWeek = countInRange(alerts, 14, 7);
  if (lastWeek > 0) {
    const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    if (Math.abs(change) > 10) {
      insights.push({
        type: change > 0 ? 'warning' : 'success',
        title: `Alerts ${change > 0 ? 'increased' : 'decreased'} ${Math.abs(change)}% this week`,
        description: `${thisWeek} alerts this week compared to ${lastWeek} last week across all farms.`,
        metric: `${change > 0 ? '+' : ''}${change}%`,
      });
    }
  }

  // 2. Low battery predictions
  const lowBattery = animals.filter((a) => a.battery > 0 && a.battery < 30);
  if (lowBattery.length > 0) {
    insights.push({
      type: 'warning',
      title: `${lowBattery.length} devices need charging within 48hrs`,
      description: `Animals with low battery: ${lowBattery.map((a) => a.name).slice(0, 5).join(', ')}${lowBattery.length > 5 ? ` and ${lowBattery.length - 5} more` : ''}.`,
      metric: `${lowBattery.length} devices`,
    });
  }

  // 3. Farms with high alert density
  const farmAlertCounts: Record<string, { name: string; count: number }> = {};
  for (const a of alerts.filter((al) => !al.resolved)) {
    const fId = a.animal.farmId;
    if (!farmAlertCounts[fId]) farmAlertCounts[fId] = { name: a.animal.farm.name, count: 0 };
    farmAlertCounts[fId].count++;
  }
  const highAlertFarms = Object.values(farmAlertCounts).filter((f) => f.count >= 3);
  if (highAlertFarms.length > 0) {
    insights.push({
      type: 'danger',
      title: `${highAlertFarms.length} farm${highAlertFarms.length > 1 ? 's' : ''} with critical alert levels`,
      description: `${highAlertFarms.map((f) => `${f.name} (${f.count} active)`).join(', ')} require immediate attention.`,
      metric: `${highAlertFarms.reduce((s, f) => s + f.count, 0)} alerts`,
    });
  }

  // 4. Overall herd health
  const safeCount = animals.filter((a) => a.status === 'SAFE').length;
  const safePercent = animals.length > 0 ? Math.round((safeCount / animals.length) * 100) : 0;
  if (safePercent >= 80) {
    insights.push({
      type: 'success',
      title: `${safePercent}% of livestock in safe status`,
      description: `${safeCount} out of ${animals.length} tracked animals are within farm boundaries and reporting normally.`,
      metric: `${safePercent}%`,
    });
  } else {
    insights.push({
      type: 'warning',
      title: `Only ${safePercent}% of livestock in safe status`,
      description: `${animals.length - safeCount} animals require attention. Check boundary and inactivity alerts.`,
      metric: `${safePercent}%`,
    });
  }

  // 5. Seasonal / time-based insight
  const hour = new Date().getHours();
  if (hour >= 18 || hour < 6) {
    const boundaryAlerts = alerts.filter((a) => !a.resolved && a.type === 'BOUNDARY_EXIT');
    insights.push({
      type: 'info',
      title: 'Night-time monitoring active',
      description: `${boundaryAlerts.length} boundary exit${boundaryAlerts.length !== 1 ? 's' : ''} detected. Animals outside boundaries at night face higher predation risk.`,
    });
  } else {
    insights.push({
      type: 'info',
      title: 'Daytime grazing period',
      description: 'Animals typically move more during daytime hours. Boundary exits during this period are often normal grazing behavior.',
    });
  }

  // 6. Average battery health
  const avgBattery = animals.length > 0
    ? Math.round(animals.reduce((s, a) => s + a.battery, 0) / animals.length)
    : 0;
  insights.push({
    type: avgBattery >= 60 ? 'success' : avgBattery >= 40 ? 'info' : 'warning',
    title: `Average tracker battery at ${avgBattery}%`,
    description: `Fleet-wide battery health is ${avgBattery >= 60 ? 'good' : avgBattery >= 40 ? 'moderate' : 'concerning'}. ${lowBattery.length} trackers below 30%.`,
    metric: `${avgBattery}%`,
  });

  // Region risks
  const provinceData: Record<string, { alerts: number; farms: number; animals: number }> = {};
  for (const farm of farms) {
    const province = getProvince(farm.latitude, farm.longitude);
    if (!provinceData[province]) provinceData[province] = { alerts: 0, farms: 0, animals: 0 };
    provinceData[province].farms++;
    provinceData[province].animals += farm._count.animals;
  }
  for (const a of alerts.filter((al) => !al.resolved)) {
    const province = getProvince(a.animal.farm.latitude, a.animal.farm.longitude);
    if (provinceData[province]) provinceData[province].alerts++;
  }

  const regionRisks = Object.entries(provinceData).map(([province, data]) => ({
    province,
    riskLevel: (data.alerts >= 4 ? 'high' : data.alerts >= 2 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    alertCount: data.alerts,
    farmCount: data.farms,
    animalCount: data.animals,
  }));

  return NextResponse.json({ insights, regionRisks });
}
