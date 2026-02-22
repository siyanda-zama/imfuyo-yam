import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const farms = await prisma.farm.findMany({
    where: { ownerId: userId },
    include: {
      _count: {
        select: { animals: true },
      },
    },
  });

  return NextResponse.json(farms);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const body = await request.json();
  const { name, latitude, longitude, radiusMeters, hectares } = body;

  if (!name || latitude === undefined || longitude === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields: name, latitude, longitude' },
      { status: 400 }
    );
  }

  const farm = await prisma.farm.create({
    data: {
      name,
      latitude,
      longitude,
      ...(radiusMeters !== undefined && { radiusMeters }),
      ...(hectares !== undefined && { hectares }),
      ownerId: userId,
    },
  });

  return NextResponse.json(farm, { status: 201 });
}
