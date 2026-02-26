import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const offset = (max: number) => (Math.random() - 0.5) * max;
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000);
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

async function main() {
  // Clean existing data in order
  await prisma.alert.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('demo123', 12);
  const adminPassword = await bcrypt.hash('admin123', 12);

  // ─── Users ───────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.create({
      data: { name: 'Sipho Ndlela', phone: '0821234567', password: hashedPassword, plan: 'BASIC', role: 'FARMER' },
    }),
    prisma.user.create({
      data: { name: 'Thandiwe Mkhize', phone: '0831234567', password: hashedPassword, plan: 'PRO', role: 'FARMER' },
    }),
    prisma.user.create({
      data: { name: 'Johan van der Merwe', phone: '0841234567', password: hashedPassword, plan: 'BASIC', role: 'FARMER' },
    }),
    prisma.user.create({
      data: { name: 'Nomvula Dlamini', phone: '0851234567', password: hashedPassword, plan: 'PRO', role: 'FARMER' },
    }),
    prisma.user.create({
      data: { name: 'Tshilidzi Mudau', phone: '0861234567', password: hashedPassword, plan: 'BASIC', role: 'FARMER' },
    }),
    prisma.user.create({
      data: { name: 'Anele Jola', phone: '0871234567', password: hashedPassword, plan: 'PRO', role: 'FARMER' },
    }),
    prisma.user.create({
      data: { name: 'Lindiwe Khumalo', phone: '0881234567', password: hashedPassword, plan: 'BASIC', role: 'FARMER' },
    }),
    prisma.user.create({
      data: { name: 'Admin User', phone: '0800000001', password: adminPassword, plan: 'PRO', role: 'ADMIN' },
    }),
  ]);

  // ─── Farms (real SA coordinates) ─────────────────────────
  const farmData = [
    { name: 'Ndlela Farm',         lat: -31.5889, lng: 28.7844, radius: 500,  hectares: 12.5, owner: 0 },
    { name: 'Mkhize Ranch',        lat: -28.0268, lng: 32.2672, radius: 800,  hectares: 25.0, owner: 1 },
    { name: 'Van der Merwe Plaas', lat: -29.1211, lng: 26.2140, radius: 1200, hectares: 45.0, owner: 2 },
    { name: 'Dlamini Livestock',   lat: -25.4753, lng: 30.9694, radius: 600,  hectares: 18.0, owner: 3 },
    { name: 'Mudau Farm',          lat: -23.9045, lng: 29.4689, radius: 700,  hectares: 20.0, owner: 4 },
    { name: 'Jola Homestead',      lat: -31.8942, lng: 27.7750, radius: 400,  hectares: 8.5,  owner: 5 },
    { name: 'Khumalo Kraal',       lat: -28.5597, lng: 29.7811, radius: 900,  hectares: 30.0, owner: 6 },
  ];

  const farms = await Promise.all(
    farmData.map((f) =>
      prisma.farm.create({
        data: {
          name: f.name,
          latitude: f.lat,
          longitude: f.lng,
          radiusMeters: f.radius,
          hectares: f.hectares,
          ownerId: users[f.owner].id,
        },
      })
    )
  );

  // ─── Animals ─────────────────────────────────────────────
  type AnimalSeed = { name: string; tagId: string; type: string; farmIdx: number; battery: number; status: string; hoursAgo: number };

  const animalData: AnimalSeed[] = [
    // Farm 0 - Ndlela Farm (Eastern Cape) — 8 animals
    { name: 'Inkomo #01', tagId: 'TAG-001', type: 'COW', farmIdx: 0, battery: 87, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkomo #02', tagId: 'TAG-002', type: 'COW', farmIdx: 0, battery: 64, status: 'SAFE', hoursAgo: 1 },
    { name: 'Inkomo #03', tagId: 'TAG-003', type: 'COW', farmIdx: 0, battery: 22, status: 'ALERT', hoursAgo: 3 },
    { name: 'Inkomo #04', tagId: 'TAG-004', type: 'COW', farmIdx: 0, battery: 95, status: 'SAFE', hoursAgo: 0 },
    { name: 'Igusha #01', tagId: 'TAG-005', type: 'SHEEP', farmIdx: 0, battery: 78, status: 'SAFE', hoursAgo: 0 },
    { name: 'Igusha #02', tagId: 'TAG-006', type: 'SHEEP', farmIdx: 0, battery: 45, status: 'WARNING', hoursAgo: 2 },
    { name: 'Imbuzi #01', tagId: 'TAG-007', type: 'GOAT', farmIdx: 0, battery: 91, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkuku #01', tagId: 'TAG-008', type: 'CHICKEN', farmIdx: 0, battery: 56, status: 'SAFE', hoursAgo: 1 },

    // Farm 1 - Mkhize Ranch (KZN) — 12 animals
    { name: 'Inkomo #05', tagId: 'TAG-009', type: 'COW', farmIdx: 1, battery: 92, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkomo #06', tagId: 'TAG-010', type: 'COW', farmIdx: 1, battery: 88, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkomo #07', tagId: 'TAG-011', type: 'COW', farmIdx: 1, battery: 15, status: 'ALERT', hoursAgo: 6 },
    { name: 'Inkomo #08', tagId: 'TAG-012', type: 'COW', farmIdx: 1, battery: 73, status: 'SAFE', hoursAgo: 1 },
    { name: 'Inkomo #09', tagId: 'TAG-013', type: 'COW', farmIdx: 1, battery: 81, status: 'SAFE', hoursAgo: 0 },
    { name: 'Igusha #03', tagId: 'TAG-014', type: 'SHEEP', farmIdx: 1, battery: 67, status: 'SAFE', hoursAgo: 1 },
    { name: 'Igusha #04', tagId: 'TAG-015', type: 'SHEEP', farmIdx: 1, battery: 34, status: 'WARNING', hoursAgo: 4 },
    { name: 'Igusha #05', tagId: 'TAG-016', type: 'SHEEP', farmIdx: 1, battery: 90, status: 'SAFE', hoursAgo: 0 },
    { name: 'Imbuzi #02', tagId: 'TAG-017', type: 'GOAT', farmIdx: 1, battery: 85, status: 'SAFE', hoursAgo: 0 },
    { name: 'Imbuzi #03', tagId: 'TAG-018', type: 'GOAT', farmIdx: 1, battery: 42, status: 'WARNING', hoursAgo: 3 },
    { name: 'Ihashe #01', tagId: 'TAG-019', type: 'HORSE', farmIdx: 1, battery: 96, status: 'SAFE', hoursAgo: 0 },
    { name: 'Ihashe #02', tagId: 'TAG-020', type: 'HORSE', farmIdx: 1, battery: 71, status: 'SAFE', hoursAgo: 1 },

    // Farm 2 - Van der Merwe Plaas (Free State) — 14 animals
    { name: 'Inkomo #10', tagId: 'TAG-021', type: 'COW', farmIdx: 2, battery: 99, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkomo #11', tagId: 'TAG-022', type: 'COW', farmIdx: 2, battery: 77, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkomo #12', tagId: 'TAG-023', type: 'COW', farmIdx: 2, battery: 8, status: 'ALERT', hoursAgo: 12 },
    { name: 'Inkomo #13', tagId: 'TAG-024', type: 'COW', farmIdx: 2, battery: 83, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkomo #14', tagId: 'TAG-025', type: 'COW', farmIdx: 2, battery: 61, status: 'SAFE', hoursAgo: 2 },
    { name: 'Inkomo #15', tagId: 'TAG-026', type: 'COW', farmIdx: 2, battery: 55, status: 'WARNING', hoursAgo: 5 },
    { name: 'Igusha #06', tagId: 'TAG-027', type: 'SHEEP', farmIdx: 2, battery: 94, status: 'SAFE', hoursAgo: 0 },
    { name: 'Igusha #07', tagId: 'TAG-028', type: 'SHEEP', farmIdx: 2, battery: 86, status: 'SAFE', hoursAgo: 1 },
    { name: 'Igusha #08', tagId: 'TAG-029', type: 'SHEEP', farmIdx: 2, battery: 29, status: 'WARNING', hoursAgo: 8 },
    { name: 'Imbuzi #04', tagId: 'TAG-030', type: 'GOAT', farmIdx: 2, battery: 72, status: 'SAFE', hoursAgo: 0 },
    { name: 'Ingulube #01', tagId: 'TAG-031', type: 'PIG', farmIdx: 2, battery: 88, status: 'SAFE', hoursAgo: 0 },
    { name: 'Ingulube #02', tagId: 'TAG-032', type: 'PIG', farmIdx: 2, battery: 63, status: 'SAFE', hoursAgo: 2 },
    { name: 'Inkuku #02', tagId: 'TAG-033', type: 'CHICKEN', farmIdx: 2, battery: 47, status: 'SAFE', hoursAgo: 3 },
    { name: 'Inkuku #03', tagId: 'TAG-034', type: 'CHICKEN', farmIdx: 2, battery: 81, status: 'SAFE', hoursAgo: 0 },

    // Farm 3 - Dlamini Livestock (Mpumalanga) — 10 animals
    { name: 'Inkomo #16', tagId: 'TAG-035', type: 'COW', farmIdx: 3, battery: 90, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkomo #17', tagId: 'TAG-036', type: 'COW', farmIdx: 3, battery: 44, status: 'WARNING', hoursAgo: 4 },
    { name: 'Inkomo #18', tagId: 'TAG-037', type: 'COW', farmIdx: 3, battery: 76, status: 'SAFE', hoursAgo: 1 },
    { name: 'Igusha #09', tagId: 'TAG-038', type: 'SHEEP', farmIdx: 3, battery: 82, status: 'SAFE', hoursAgo: 0 },
    { name: 'Igusha #10', tagId: 'TAG-039', type: 'SHEEP', farmIdx: 3, battery: 19, status: 'ALERT', hoursAgo: 10 },
    { name: 'Imbuzi #05', tagId: 'TAG-040', type: 'GOAT', farmIdx: 3, battery: 93, status: 'SAFE', hoursAgo: 0 },
    { name: 'Imbuzi #06', tagId: 'TAG-041', type: 'GOAT', farmIdx: 3, battery: 58, status: 'SAFE', hoursAgo: 2 },
    { name: 'Ihashe #03', tagId: 'TAG-042', type: 'HORSE', farmIdx: 3, battery: 97, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkuku #04', tagId: 'TAG-043', type: 'CHICKEN', farmIdx: 3, battery: 70, status: 'SAFE', hoursAgo: 1 },
    { name: 'Inkuku #05', tagId: 'TAG-044', type: 'CHICKEN', farmIdx: 3, battery: 38, status: 'WARNING', hoursAgo: 6 },

    // Farm 4 - Mudau Farm (Limpopo) — 8 animals
    { name: 'Inkomo #19', tagId: 'TAG-045', type: 'COW', farmIdx: 4, battery: 85, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkomo #20', tagId: 'TAG-046', type: 'COW', farmIdx: 4, battery: 52, status: 'WARNING', hoursAgo: 5 },
    { name: 'Igusha #11', tagId: 'TAG-047', type: 'SHEEP', farmIdx: 4, battery: 91, status: 'SAFE', hoursAgo: 0 },
    { name: 'Igusha #12', tagId: 'TAG-048', type: 'SHEEP', farmIdx: 4, battery: 66, status: 'SAFE', hoursAgo: 1 },
    { name: 'Imbuzi #07', tagId: 'TAG-049', type: 'GOAT', farmIdx: 4, battery: 11, status: 'ALERT', hoursAgo: 18 },
    { name: 'Ingulube #03', tagId: 'TAG-050', type: 'PIG', farmIdx: 4, battery: 79, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkuku #06', tagId: 'TAG-051', type: 'CHICKEN', farmIdx: 4, battery: 89, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkuku #07', tagId: 'TAG-052', type: 'CHICKEN', farmIdx: 4, battery: 33, status: 'WARNING', hoursAgo: 7 },

    // Farm 5 - Jola Homestead (Eastern Cape) — 6 animals
    { name: 'Inkomo #21', tagId: 'TAG-053', type: 'COW', farmIdx: 5, battery: 98, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkomo #22', tagId: 'TAG-054', type: 'COW', farmIdx: 5, battery: 74, status: 'SAFE', hoursAgo: 1 },
    { name: 'Igusha #13', tagId: 'TAG-055', type: 'SHEEP', farmIdx: 5, battery: 60, status: 'SAFE', hoursAgo: 2 },
    { name: 'Imbuzi #08', tagId: 'TAG-056', type: 'GOAT', farmIdx: 5, battery: 25, status: 'WARNING', hoursAgo: 9 },
    { name: 'Inkuku #08', tagId: 'TAG-057', type: 'CHICKEN', farmIdx: 5, battery: 84, status: 'SAFE', hoursAgo: 0 },
    { name: 'Ihashe #04', tagId: 'TAG-058', type: 'HORSE', farmIdx: 5, battery: 92, status: 'SAFE', hoursAgo: 0 },

    // Farm 6 - Khumalo Kraal (KZN) — 9 animals
    { name: 'Inkomo #23', tagId: 'TAG-059', type: 'COW', farmIdx: 6, battery: 80, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkomo #24', tagId: 'TAG-060', type: 'COW', farmIdx: 6, battery: 5, status: 'ALERT', hoursAgo: 24 },
    { name: 'Inkomo #25', tagId: 'TAG-061', type: 'COW', farmIdx: 6, battery: 69, status: 'SAFE', hoursAgo: 1 },
    { name: 'Igusha #14', tagId: 'TAG-062', type: 'SHEEP', farmIdx: 6, battery: 87, status: 'SAFE', hoursAgo: 0 },
    { name: 'Igusha #15', tagId: 'TAG-063', type: 'SHEEP', farmIdx: 6, battery: 41, status: 'WARNING', hoursAgo: 5 },
    { name: 'Imbuzi #09', tagId: 'TAG-064', type: 'GOAT', farmIdx: 6, battery: 76, status: 'SAFE', hoursAgo: 1 },
    { name: 'Ingulube #04', tagId: 'TAG-065', type: 'PIG', farmIdx: 6, battery: 93, status: 'SAFE', hoursAgo: 0 },
    { name: 'Inkuku #09', tagId: 'TAG-066', type: 'CHICKEN', farmIdx: 6, battery: 50, status: 'SAFE', hoursAgo: 3 },
    { name: 'Ihashe #05', tagId: 'TAG-067', type: 'HORSE', farmIdx: 6, battery: 62, status: 'WARNING', hoursAgo: 6 },
  ];

  const animals = await Promise.all(
    animalData.map((a) => {
      const farm = farms[a.farmIdx];
      const farmLat = farmData[a.farmIdx].lat;
      const farmLng = farmData[a.farmIdx].lng;
      // Place ALERT animals outside boundary, others inside
      const isOutside = a.status === 'ALERT';
      const lat = isOutside ? farmLat + 0.008 + offset(0.002) : farmLat + offset(0.003);
      const lng = isOutside ? farmLng + 0.006 + offset(0.002) : farmLng + offset(0.003);

      return prisma.animal.create({
        data: {
          name: a.name,
          tagId: a.tagId,
          type: a.type,
          farmId: farm.id,
          latitude: lat,
          longitude: lng,
          battery: a.battery,
          status: a.status,
          lastSeenAt: hoursAgo(a.hoursAgo),
        },
      });
    })
  );

  // ─── Alerts ──────────────────────────────────────────────
  // Helper to find animal by tagId
  const byTag = (tag: string) => animals.find((a) => a.tagId === tag)!;

  type AlertSeed = { tag: string; type: string; message: string; resolved: boolean; daysAgo: number; resolvedAfterHours?: number };

  const alertData: AlertSeed[] = [
    // Active alerts
    { tag: 'TAG-003', type: 'BOUNDARY_EXIT', message: 'Inkomo #03 has left the farm boundary. Last seen 1.2km from Ndlela Farm.', resolved: false, daysAgo: 0 },
    { tag: 'TAG-011', type: 'LOW_BATTERY', message: 'Inkomo #07 tracker battery critically low at 15%.', resolved: false, daysAgo: 0 },
    { tag: 'TAG-023', type: 'LOW_BATTERY', message: 'Inkomo #12 tracker battery critically low at 8%.', resolved: false, daysAgo: 0 },
    { tag: 'TAG-039', type: 'BOUNDARY_EXIT', message: 'Igusha #10 has left the farm boundary near Dlamini Livestock.', resolved: false, daysAgo: 0 },
    { tag: 'TAG-049', type: 'INACTIVITY', message: 'Imbuzi #07 has not moved in 18 hours. Last seen at Mudau Farm.', resolved: false, daysAgo: 0 },
    { tag: 'TAG-060', type: 'LOW_BATTERY', message: 'Inkomo #24 tracker battery critically low at 5%.', resolved: false, daysAgo: 0 },
    { tag: 'TAG-052', type: 'INACTIVITY', message: 'Inkuku #07 has not moved in 7 hours.', resolved: false, daysAgo: 0 },
    { tag: 'TAG-063', type: 'BOUNDARY_EXIT', message: 'Igusha #15 has left the boundary of Khumalo Kraal.', resolved: false, daysAgo: 1 },
    { tag: 'TAG-067', type: 'INACTIVITY', message: 'Ihashe #05 has not moved in 6 hours.', resolved: false, daysAgo: 0 },
    { tag: 'TAG-044', type: 'LOW_BATTERY', message: 'Inkuku #05 tracker battery at 38%.', resolved: false, daysAgo: 0 },

    // Resolved alerts (historical)
    { tag: 'TAG-001', type: 'BOUNDARY_EXIT', message: 'Inkomo #01 briefly left the boundary. Returned safely.', resolved: true, daysAgo: 3, resolvedAfterHours: 2 },
    { tag: 'TAG-002', type: 'LOW_BATTERY', message: 'Inkomo #02 battery was low. Tracker recharged.', resolved: true, daysAgo: 5, resolvedAfterHours: 12 },
    { tag: 'TAG-009', type: 'BOUNDARY_EXIT', message: 'Inkomo #05 left Mkhize Ranch boundary during grazing.', resolved: true, daysAgo: 2, resolvedAfterHours: 1 },
    { tag: 'TAG-014', type: 'INACTIVITY', message: 'Igusha #03 was inactive for 8 hours. Resumed movement.', resolved: true, daysAgo: 4, resolvedAfterHours: 8 },
    { tag: 'TAG-021', type: 'BOUNDARY_EXIT', message: 'Inkomo #10 left Van der Merwe Plaas boundary.', resolved: true, daysAgo: 6, resolvedAfterHours: 3 },
    { tag: 'TAG-027', type: 'LOW_BATTERY', message: 'Igusha #06 battery was critically low. Recharged.', resolved: true, daysAgo: 7, resolvedAfterHours: 24 },
    { tag: 'TAG-035', type: 'BOUNDARY_EXIT', message: 'Inkomo #16 left Dlamini Livestock boundary briefly.', resolved: true, daysAgo: 1, resolvedAfterHours: 0.5 },
    { tag: 'TAG-045', type: 'INACTIVITY', message: 'Inkomo #19 was inactive. Resumed normal behavior.', resolved: true, daysAgo: 3, resolvedAfterHours: 6 },
    { tag: 'TAG-053', type: 'BOUNDARY_EXIT', message: 'Inkomo #21 crossed Jola Homestead boundary.', resolved: true, daysAgo: 5, resolvedAfterHours: 1.5 },
    { tag: 'TAG-059', type: 'LOW_BATTERY', message: 'Inkomo #23 battery recharged at Khumalo Kraal.', resolved: true, daysAgo: 4, resolvedAfterHours: 10 },
    { tag: 'TAG-010', type: 'INACTIVITY', message: 'Inkomo #06 inactive for 12 hours. Medical check done.', resolved: true, daysAgo: 2, resolvedAfterHours: 4 },
    { tag: 'TAG-015', type: 'LOW_BATTERY', message: 'Igusha #04 tracker battery low. Device replaced.', resolved: true, daysAgo: 6, resolvedAfterHours: 48 },
    { tag: 'TAG-030', type: 'BOUNDARY_EXIT', message: 'Imbuzi #04 left boundary during storm. Returned.', resolved: true, daysAgo: 8, resolvedAfterHours: 5 },
    { tag: 'TAG-036', type: 'INACTIVITY', message: 'Inkomo #17 inactive for 4 hours due to heat.', resolved: true, daysAgo: 1, resolvedAfterHours: 4 },
    { tag: 'TAG-042', type: 'BOUNDARY_EXIT', message: 'Ihashe #03 left Dlamini Livestock during exercise.', resolved: true, daysAgo: 3, resolvedAfterHours: 0.5 },
    { tag: 'TAG-047', type: 'LOW_BATTERY', message: 'Igusha #11 tracker battery replaced at Mudau Farm.', resolved: true, daysAgo: 9, resolvedAfterHours: 18 },
    { tag: 'TAG-054', type: 'INACTIVITY', message: 'Inkomo #22 inactive overnight. Normal resting.', resolved: true, daysAgo: 2, resolvedAfterHours: 7 },
    { tag: 'TAG-062', type: 'BOUNDARY_EXIT', message: 'Igusha #14 left Khumalo Kraal. Herded back.', resolved: true, daysAgo: 4, resolvedAfterHours: 2 },
    { tag: 'TAG-019', type: 'LOW_BATTERY', message: 'Ihashe #01 tracker low. Charged via solar unit.', resolved: true, daysAgo: 10, resolvedAfterHours: 6 },
    { tag: 'TAG-040', type: 'BOUNDARY_EXIT', message: 'Imbuzi #05 escaped through fence gap. Fixed.', resolved: true, daysAgo: 7, resolvedAfterHours: 3 },
  ];

  for (const a of alertData) {
    const animal = byTag(a.tag);
    const createdAt = daysAgo(a.daysAgo);
    const resolvedAt = a.resolved && a.resolvedAfterHours
      ? new Date(createdAt.getTime() + a.resolvedAfterHours * 3600000)
      : null;

    await prisma.alert.create({
      data: {
        animalId: animal.id,
        type: a.type,
        message: a.message,
        resolved: a.resolved,
        resolvedAt,
        createdAt,
      },
    });
  }

  // ─── User Settings ───────────────────────────────────────
  for (const user of users) {
    await prisma.userSettings.create({
      data: { userId: user.id },
    });
  }

  console.log('Seed data created successfully!');
  console.log(`Users: ${users.length}`);
  console.log(`Farms: ${farms.length}`);
  console.log(`Animals: ${animals.length}`);
  console.log(`Alerts: ${alertData.length}`);
  console.log(`\nAdmin login: 0800000001 / admin123`);
  console.log(`Farmer login: 0821234567 / demo123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
