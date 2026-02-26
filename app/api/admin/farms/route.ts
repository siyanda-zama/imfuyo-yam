import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function getProvince(lat: number, lng: number): string {
  if (lat < -30 && lng > 27 && lng < 30) return 'Eastern Cape';
  if (lat > -30 && lat < -27 && lng > 29 && lng < 33) return 'KwaZulu-Natal';
  if (lat > -31 && lat < -28 && lng > 24 && lng < 28) return 'Free State';
  if (lat > -27 && lat < -24 && lng > 29 && lng < 32) return 'Mpumalanga';
  if (lat > -25 && lng > 28 && lng < 31) return 'Limpopo';
  if (lat > -29 && lat < -27 && lng > 29 && lng < 31) return 'KwaZulu-Natal';
  return 'Other';
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const farms = await prisma.farm.findMany({
    include: {
      owner: { select: { name: true, phone: true, plan: true } },
      animals: { select: { status: true, battery: true } },
      _count: { select: { animals: true } },
    },
  });

  const alerts = await prisma.alert.findMany({
    where: { resolved: false },
    include: { animal: { select: { farmId: true } } },
  });

  const alertsByFarm: Record<string, number> = {};
  for (const a of alerts) {
    alertsByFarm[a.animal.farmId] = (alertsByFarm[a.animal.farmId] || 0) + 1;
  }

  const result = farms.map((farm) => {
    const totalAnimals = farm._count.animals;
    const safeCount = farm.animals.filter((a) => a.status === 'SAFE').length;
    const avgBattery = totalAnimals > 0
      ? farm.animals.reduce((sum, a) => sum + a.battery, 0) / totalAnimals
      : 0;
    const farmAlerts = alertsByFarm[farm.id] || 0;

    const healthScore = totalAnimals > 0
      ? Math.round(
          (safeCount / totalAnimals) * 50 +
          (avgBattery / 100) * 30 +
          (farmAlerts === 0 ? 20 : Math.max(0, 20 - farmAlerts * 5))
        )
      : 0;

    return {
      id: farm.id,
      name: farm.name,
      latitude: farm.latitude,
      longitude: farm.longitude,
      radiusMeters: farm.radiusMeters,
      hectares: farm.hectares,
      owner: farm.owner,
      animalCount: totalAnimals,
      province: getProvince(farm.latitude, farm.longitude),
      alertCount: farmAlerts,
      healthScore,
    };
  });

  return NextResponse.json(result);
}
