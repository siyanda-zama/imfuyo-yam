import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allAlerts = await prisma.alert.findMany({
    orderBy: { createdAt: 'desc' },
    include: { animal: { include: { farm: true } } },
  });

  // By type
  const byType: Record<string, number> = {};
  for (const a of allAlerts) {
    byType[a.type] = (byType[a.type] || 0) + 1;
  }

  // Resolution rate
  const resolvedAlerts = allAlerts.filter((a) => a.resolved);
  const resolutionRate = allAlerts.length > 0
    ? Math.round((resolvedAlerts.length / allAlerts.length) * 100)
    : 0;

  // Avg resolution time
  let totalResolutionHours = 0;
  let resolvedWithTime = 0;
  for (const a of resolvedAlerts) {
    if (a.resolvedAt) {
      const hours = (new Date(a.resolvedAt).getTime() - new Date(a.createdAt).getTime()) / 3600000;
      totalResolutionHours += hours;
      resolvedWithTime++;
    }
  }
  const avgResolutionTimeHours = resolvedWithTime > 0
    ? Math.round((totalResolutionHours / resolvedWithTime) * 10) / 10
    : 0;

  // 7-day trend
  const recentTrend: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = allAlerts.filter((a) => {
      const alertDate = new Date(a.createdAt).toISOString().split('T')[0];
      return alertDate === dateStr;
    }).length;
    recentTrend.push({ date: dateStr, count });
  }

  return NextResponse.json({
    byType,
    resolutionRate,
    avgResolutionTimeHours,
    recentTrend,
    totalAlerts: allAlerts.length,
    activeAlerts: allAlerts.filter((a) => !a.resolved).length,
  });
}
