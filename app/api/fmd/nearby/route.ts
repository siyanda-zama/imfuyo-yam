import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getProvince } from '@/lib/provinces';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all active (unresolved) FMD reports with coordinates
  const reports = await prisma.fmdReport.findMany({
    where: {
      resolvedAt: null,
      severity: { in: ['SUSPECTED', 'CONFIRMED'] },
    },
    orderBy: { reportedAt: 'desc' },
    include: {
      farm: { select: { name: true, latitude: true, longitude: true } },
      animal: { select: { name: true, tagId: true } },
    },
  });

  return NextResponse.json(
    reports.map((r) => ({
      id: r.id,
      severity: r.severity,
      animalType: r.animalType,
      symptoms: JSON.parse(r.symptoms),
      latitude: r.latitude ?? r.farm.latitude,
      longitude: r.longitude ?? r.farm.longitude,
      farmName: r.farm.name,
      animalName: r.animal?.name || null,
      province: getProvince(r.farm.latitude, r.farm.longitude),
      reportedAt: r.reportedAt.toISOString(),
      quarantineStarted: r.quarantineStarted,
    }))
  );
}
