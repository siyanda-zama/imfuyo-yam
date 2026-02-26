import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getProvince } from '@/lib/provinces';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reports = await prisma.fmdReport.findMany({
    include: { farm: true },
  });

  const provinceMap: Record<string, {
    totalReports: number;
    confirmed: number;
    suspected: number;
    recovered: number;
    cleared: number;
    farmIds: Set<string>;
    affectedAnimals: number;
  }> = {};

  for (const r of reports) {
    const province = getProvince(r.farm.latitude, r.farm.longitude);
    if (!provinceMap[province]) {
      provinceMap[province] = {
        totalReports: 0, confirmed: 0, suspected: 0, recovered: 0, cleared: 0,
        farmIds: new Set(), affectedAnimals: 0,
      };
    }
    const p = provinceMap[province];
    p.totalReports++;
    p.affectedAnimals += r.affectedCount;
    p.farmIds.add(r.farmId);
    if (r.severity === 'CONFIRMED') p.confirmed++;
    else if (r.severity === 'SUSPECTED') p.suspected++;
    else if (r.severity === 'RECOVERED') p.recovered++;
    else if (r.severity === 'CLEARED') p.cleared++;
  }

  const result = Object.entries(provinceMap).map(([province, data]) => {
    const activeThreats = data.confirmed + data.suspected;
    const riskLevel = activeThreats >= 3 ? 'critical' : activeThreats >= 2 ? 'high' : activeThreats >= 1 ? 'medium' : 'low';
    return {
      province,
      totalReports: data.totalReports,
      confirmed: data.confirmed,
      suspected: data.suspected,
      recovered: data.recovered,
      cleared: data.cleared,
      affectedFarms: data.farmIds.size,
      affectedAnimals: data.affectedAnimals,
      riskLevel,
    };
  }).sort((a, b) => b.totalReports - a.totalReports);

  return NextResponse.json(result);
}
