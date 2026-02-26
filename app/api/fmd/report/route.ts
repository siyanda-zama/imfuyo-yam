import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { farmId, animalId, animalType, affectedCount, severity, symptoms, notes, latitude, longitude, vetNotified, vetName, quarantineStarted } = body;

  if (!farmId || !animalType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

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
