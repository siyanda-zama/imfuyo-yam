import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const LIVESTOCK_VALUES: Record<string, number> = {
  COW: 15000,
  HORSE: 25000,
  PIG: 3500,
  GOAT: 2500,
  SHEEP: 2000,
  CHICKEN: 150,
};

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [totalFarms, totalAnimals, totalFarmers, activeAlerts, animals] = await Promise.all([
    prisma.farm.count(),
    prisma.animal.count(),
    prisma.user.count({ where: { role: 'FARMER' } }),
    prisma.alert.count({ where: { resolved: false } }),
    prisma.animal.findMany({ select: { type: true, status: true, battery: true } }),
  ]);

  const animalsByType: Record<string, number> = {};
  const animalsByStatus: Record<string, number> = {};
  const batteryDistribution = { healthy: 0, medium: 0, low: 0, critical: 0 };
  let estimatedLivestockValue = 0;

  for (const a of animals) {
    animalsByType[a.type] = (animalsByType[a.type] || 0) + 1;
    animalsByStatus[a.status] = (animalsByStatus[a.status] || 0) + 1;
    estimatedLivestockValue += LIVESTOCK_VALUES[a.type] || 0;

    if (a.battery >= 70) batteryDistribution.healthy++;
    else if (a.battery >= 40) batteryDistribution.medium++;
    else if (a.battery >= 20) batteryDistribution.low++;
    else batteryDistribution.critical++;
  }

  return NextResponse.json({
    totalFarms,
    totalAnimals,
    totalFarmers,
    activeAlerts,
    estimatedLivestockValue,
    animalsByType,
    animalsByStatus,
    batteryDistribution,
  });
}
