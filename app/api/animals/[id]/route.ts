import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const { id } = await params;

  const animal = await prisma.animal.findUnique({
    where: { id },
    include: { alerts: true, farm: true },
  });

  if (!animal) {
    return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
  }

  // Verify ownership
  if (animal.farm.ownerId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.json(animal);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const { id } = await params;

  // Verify ownership
  const existing = await prisma.animal.findUnique({
    where: { id },
    include: { farm: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
  }

  if (existing.farm.ownerId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { latitude, longitude, status, battery } = body;

  const animal = await prisma.animal.update({
    where: { id },
    data: {
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(status !== undefined && { status }),
      ...(battery !== undefined && { battery }),
      lastSeenAt: new Date(),
    },
  });

  return NextResponse.json(animal);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const { id } = await params;

  // Verify ownership
  const existing = await prisma.animal.findUnique({
    where: { id },
    include: { farm: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
  }

  if (existing.farm.ownerId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Delete alerts first, then the animal
  await prisma.alert.deleteMany({ where: { animalId: id } });
  await prisma.animal.delete({ where: { id } });

  return NextResponse.json({ message: 'Animal deleted' });
}
