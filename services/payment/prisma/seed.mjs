import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rows = [
  {
    id: '44444444-4444-4444-4444-444444444401',
    bookingId: '33333333-3333-3333-3333-333333333301',
    amount: '756.00',
    currency: 'USD',
    status: 'succeeded',
  },
  {
    id: '44444444-4444-4444-4444-444444444402',
    bookingId: '33333333-3333-3333-3333-333333333302',
    amount: '570.00',
    currency: 'USD',
    status: 'pending',
  },
];

async function main() {
  for (const row of rows) {
    await prisma.payment.upsert({
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
