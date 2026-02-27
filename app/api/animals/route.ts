import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  // Optional farmId filter for multi-farm support
  const farmId = request.nextUrl.searchParams.get('farmId');
  const excludeFmdActive = request.nextUrl.searchParams.get('excludeFmdActive');

  const animals = await prisma.animal.findMany({
    where: {
      farm: { ownerId: userId },
      ...(farmId && { farmId }),
      // Exclude animals that already have an active (unresolved) FMD report
      ...(excludeFmdActive === '1' && {
        fmdReports: {
          none: {
            resolvedAt: null,
            severity: { in: ['SUSPECTED', 'CONFIRMED'] },
          },
        },
      }),
    },
    include: { farm: true },
  });

  return NextResponse.json(animals);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const body = await request.json();
  const { name, tagId, type, farmId, latitude, longitude } = body;

  if (!name || !tagId || !type || !farmId) {
    return NextResponse.json(
      { error: 'Missing required fields: name, tagId, type, farmId' },
      { status: 400 }
    );
  }

  // Verify the farm belongs to the user
  const farm = await prisma.farm.findFirst({
    where: { id: farmId, ownerId: userId },
  });

  if (!farm) {
    return NextResponse.json(
      { error: 'Farm not found or does not belong to you' },
      { status: 404 }
    );
  }

  // If no coordinates provided, place the animal randomly within the farm boundary
  let animalLat = latitude ?? null;
  let animalLng = longitude ?? null;

  if (animalLat == null || animalLng == null) {
    // Random position within ~80% of the farm radius
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 0.8 * farm.radiusMeters;
    // Approximate meters to degrees
    const dLat = (distance * Math.cos(angle)) / 111320;
    const dLng = (distance * Math.sin(angle)) / (111320 * Math.cos((farm.latitude * Math.PI) / 180));
    animalLat = farm.latitude + dLat;
    animalLng = farm.longitude + dLng;
  }

  const animal = await prisma.animal.create({
    data: {
      name,
      tagId,
      type,
      farmId,
      latitude: animalLat,
      longitude: animalLng,
    },
  });

  return NextResponse.json(animal, { status: 201 });
}
