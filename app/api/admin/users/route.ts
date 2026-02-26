import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getProvince } from '@/lib/provinces';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: 'FARMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      farms: {
        include: {
          animals: {
            select: { id: true, type: true, status: true, battery: true, name: true, tagId: true },
          },
          fmdReports: {
            select: { id: true, severity: true, animalType: true, affectedCount: true, reportedAt: true, symptoms: true, resolvedAt: true },
          },
          _count: { select: { animals: true } },
        },
      },
    },
  });

  // Compute active alerts per user
  const allAlerts = await prisma.alert.findMany({
    where: { resolved: false },
    select: { animalId: true },
  });
  const alertAnimalIds = new Set(allAlerts.map((a) => a.animalId));

  const result = users.map((user) => {
    const allAnimals = user.farms.flatMap((f) => f.animals);
    const allFmdReports = user.farms.flatMap((f) => f.fmdReports);
    const activeAlerts = allAnimals.filter((a) => alertAnimalIds.has(a.id)).length;

    // Animal type breakdown
    const typeBreakdown: Record<string, number> = {};
    for (const a of allAnimals) {
      typeBreakdown[a.type] = (typeBreakdown[a.type] || 0) + 1;
    }

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const a of allAnimals) {
      statusBreakdown[a.status] = (statusBreakdown[a.status] || 0) + 1;
    }

    // FMD severity breakdown
    const fmdSeverity: Record<string, number> = {};
    for (const r of allFmdReports) {
      fmdSeverity[r.severity] = (fmdSeverity[r.severity] || 0) + 1;
    }

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      plan: user.plan,
      createdAt: user.createdAt,
      farms: user.farms.map((f) => ({
        id: f.id,
        name: f.name,
        latitude: f.latitude,
        longitude: f.longitude,
        radiusMeters: f.radiusMeters,
        hectares: f.hectares,
        province: getProvince(f.latitude, f.longitude),
        animalCount: f._count.animals,
        fmdReportCount: f.fmdReports.length,
      })),
      totalAnimals: allAnimals.length,
      typeBreakdown,
      statusBreakdown,
      activeAlerts,
      fmdReports: allFmdReports.map((r) => ({
        id: r.id,
        severity: r.severity,
        animalType: r.animalType,
        affectedCount: r.affectedCount,
        reportedAt: r.reportedAt,
        symptomsCount: JSON.parse(r.symptoms || '[]').length,
        resolved: !!r.resolvedAt,
      })),
      fmdSeverity,
      totalFmdReports: allFmdReports.length,
    };
  });

  return NextResponse.json(result);
}
