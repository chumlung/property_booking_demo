import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

const rows = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    propertyId: '22222222-2222-2222-2222-222222222201',
    guestEmail: 'demo@example.com',
    checkIn: new Date('2026-05-01'),
    checkOut: new Date('2026-05-05'),
    status: 'confirmed',
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    propertyId: '22222222-2222-2222-2222-222222222202',
    guestEmail: 'host@example.com',
    checkIn: new Date('2026-06-10'),
    checkOut: new Date('2026-06-14'),
    status: 'pending',
  },
];

async function main() {
  for (const row of rows) {
    await prisma.booking.upsert({
      where: { id: row.id },
      update: row,
      create: row,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
