import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProvince } from '@/lib/provinces';

export async function GET() {
  const reports = await prisma.fmdReport.findMany({
    include: { farm: true },
  });

  const activeReports = reports.filter((r) => r.severity === 'CONFIRMED' || r.severity === 'SUSPECTED');
  const provinces = new Set(activeReports.map((r) => getProvince(r.farm.latitude, r.farm.longitude)));

  return NextResponse.json({
    totalReports: reports.length,
    activeReports: activeReports.length,
    confirmed: reports.filter((r) => r.severity === 'CONFIRMED').length,
    provincesAffected: provinces.size,
    totalProvinces: 9,
  });
}
