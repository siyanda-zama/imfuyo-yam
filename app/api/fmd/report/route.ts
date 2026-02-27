import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    farmId, animalType, animalIds, severity, symptoms,
    notes, latitude, longitude, vetNotified, vetName, quarantineStarted,
    // Legacy support: single animalId + affectedCount
    animalId, affectedCount,
  } = body;

  if (!farmId || !animalType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const userId = session.user.id;
  const ids: string[] = Array.isArray(animalIds) ? animalIds : [];

  // If new batch format with animalIds array
  if (ids.length > 0) {
    const reports = await prisma.$transaction(
      ids.map((id) =>
        prisma.fmdReport.create({
          data: {
            farmId,
            reportedById: userId,
            animalId: id,
            animalType,
            affectedCount: 1,
            severity: severity || 'SUSPECTED',
            symptoms: JSON.stringify(symptoms || []),
            notes: notes || null,
            latitude: latitude || null,
            longitude: longitude || null,
            vetNotified: vetNotified || false,
            vetName: vetName || null,
            quarantineStarted: quarantineStarted || false,
          },
        })
      )
    );

    return NextResponse.json({ count: reports.length, reports }, { status: 201 });
  }

  // Legacy fallback: single report
  const report = await prisma.fmdReport.create({
    data: {
      farmId,
      reportedById: session.user.id,
      animalId: animalId || null,
      animalType,
      affectedCount: affectedCount || 1,
      severity: severity || 'SUSPECTED',
      symptoms: JSON.stringify(symptoms || []),
      notes: notes || null,
      latitude: latitude || null,
      longitude: longitude || null,
      vetNotified: vetNotified || false,
      vetName: vetName || null,
      quarantineStarted: quarantineStarted || false,
    },
  });

  return NextResponse.json(report, { status: 201 });
}
