import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { name: 'Demo Guest' },
    create: {
      id: '11111111-1111-1111-1111-111111111101',
      email: 'demo@example.com',
      name: 'Demo Guest',
    },
  });

  await prisma.user.upsert({
    where: { email: 'host@example.com' },
    update: { name: 'Sample Host' },
    create: {
      id: '11111111-1111-1111-1111-111111111102',
      email: 'host@example.com',
      name: 'Sample Host',
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
