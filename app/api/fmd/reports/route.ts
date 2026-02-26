import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reports = await prisma.fmdReport.findMany({
    where: { reportedById: session.user.id },
    orderBy: { reportedAt: 'desc' },
    include: {
      farm: { select: { name: true } },
      animal: { select: { name: true, tagId: true } },
    },
  });

  return NextResponse.json(
    reports.map((r) => ({
      ...r,
      symptoms: JSON.parse(r.symptoms),
    }))
  );
}
