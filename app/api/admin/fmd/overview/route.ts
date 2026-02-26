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

  const confirmed = reports.filter((r) => r.severity === 'CONFIRMED').length;
  const suspected = reports.filter((r) => r.severity === 'SUSPECTED').length;
  const recovered = reports.filter((r) => r.severity === 'RECOVERED').length;
  const cleared = reports.filter((r) => r.severity === 'CLEARED').length;

  const quarantinedFarmIds = new Set(
    reports.filter((r) => r.quarantineStarted).map((r) => r.farmId)
  );

  const provinces = new Set(
    reports
      .filter((r) => r.severity === 'CONFIRMED' || r.severity === 'SUSPECTED')
      .map((r) => getProvince(r.farm.latitude, r.farm.longitude))
  );

  const totalAffectedAnimals = reports.reduce((sum, r) => sum + r.affectedCount, 0);

  return NextResponse.json({
    totalReports: reports.length,
    confirmed,
    suspected,
    recovered,
    cleared,
    quarantinedFarms: quarantinedFarmIds.size,
    provincesAffected: provinces.size,
    totalAffectedAnimals,
  });
}
