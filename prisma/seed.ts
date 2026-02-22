import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.alert.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Sipho Ndlela',
      phone: '0821234567',
      password: hashedPassword,
      plan: 'BASIC',
    },
  });

  // Farm center: Eastern Cape area (roughly Mthatha)
  const farmLat = -31.5889;
  const farmLng = 28.7844;

  const farm = await prisma.farm.create({
    data: {
      name: 'Ndlela Farm',
      latitude: farmLat,
      longitude: farmLng,
      radiusMeters: 500,
      hectares: 12.5,
      ownerId: user.id,
    },
  });

  // Helper to generate coords within radius
  const offset = (max: number) => (Math.random() - 0.5) * max;

  const animals = await Promise.all([
    prisma.animal.create({
      data: {
        name: 'Inkomo #01',
        tagId: 'TAG-001',
        type: 'COW',
        farmId: farm.id,
        latitude: farmLat + offset(0.003),
        longitude: farmLng + offset(0.003),
        battery: 87,
        status: 'SAFE',
        lastSeenAt: new Date(),
      },
    }),
    prisma.animal.create({
      data: {
        name: 'Inkomo #02',
        tagId: 'TAG-002',
        type: 'COW',
        farmId: farm.id,
        latitude: farmLat + offset(0.003),
        longitude: farmLng + offset(0.003),
        battery: 64,
        status: 'SAFE',
        lastSeenAt: new Date(),
      },
    }),
    prisma.animal.create({
      data: {
        name: 'Inkomo #03',
        tagId: 'TAG-003',
        type: 'COW',
        farmId: farm.id,
        latitude: farmLat + 0.008, // Outside boundary
        longitude: farmLng + 0.006,
        battery: 22,
        status: 'ALERT',
        lastSeenAt: new Date(Date.now() - 3600000),
      },
    }),
    prisma.animal.create({
      data: {
        name: 'Inkomo #04',
        tagId: 'TAG-004',
        type: 'COW',
        farmId: farm.id,
        latitude: farmLat + offset(0.003),
        longitude: farmLng + offset(0.003),
        battery: 95,
        status: 'SAFE',
        lastSeenAt: new Date(),
      },
    }),
    prisma.animal.create({
      data: {
        name: 'Imvu #01',
        tagId: 'TAG-005',
        type: 'SHEEP',
        farmId: farm.id,
        latitude: farmLat + offset(0.002),
        longitude: farmLng + offset(0.002),
        battery: 78,
        status: 'SAFE',
        lastSeenAt: new Date(),
      },
    }),
    prisma.animal.create({
      data: {
        name: 'Imvu #02',
        tagId: 'TAG-006',
        type: 'SHEEP',
        farmId: farm.id,
        latitude: farmLat + offset(0.002),
        longitude: farmLng + offset(0.002),
        battery: 45,
        status: 'WARNING',
        lastSeenAt: new Date(),
      },
    }),
  ]);

  // Create alert for Inkomo #03 (outside boundary)
  await prisma.alert.create({
    data: {
      animalId: animals[2].id,
      type: 'BOUNDARY_EXIT',
      message: 'Inkomo #03 has left the farm boundary. Last seen 1.2km from Ndlela Farm.',
      resolved: false,
    },
  });

  console.log('Seed data created successfully!');
  console.log(`User: ${user.phone} / demo123`);
  console.log(`Farm: ${farm.name}`);
  console.log(`Animals: ${animals.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
