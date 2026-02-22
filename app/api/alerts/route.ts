import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const alerts = await prisma.alert.findMany({
    where: {
      animal: {
        farm: {
          ownerId: userId,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    include: { animal: true },
  });

  return NextResponse.json(alerts);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const body = await request.json();
  const { animalId, type, message } = body;

  if (!animalId || !type || !message) {
    return NextResponse.json(
      { error: 'Missing required fields: animalId, type, message' },
      { status: 400 }
    );
  }

  // Verify the animal belongs to the user
  const animal = await prisma.animal.findFirst({
    where: { id: animalId, farm: { ownerId: userId } },
  });

  if (!animal) {
    return NextResponse.json(
      { error: 'Animal not found or does not belong to you' },
      { status: 404 }
    );
  }

  const alert = await prisma.alert.create({
    data: {
      animalId,
      type,
      message,
    },
    include: { animal: true },
  });

  return NextResponse.json(alert, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const body = await request.json();
  const { id, resolved } = body;

  if (!id || resolved === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields: id, resolved' },
      { status: 400 }
    );
  }

  // Verify ownership through the animal -> farm -> owner chain
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: {
      animal: {
        include: { farm: true },
      },
    },
  });

  if (!alert) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  if (alert.animal.farm.ownerId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const updated = await prisma.alert.update({
    where: { id },
    data: { resolved },
  });

  return NextResponse.json(updated);
}
