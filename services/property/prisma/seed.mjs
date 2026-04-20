import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

const rows = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    title: 'Loft with skyline view',
    city: 'Portland',
    pricePerNight: '189.00',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    title: 'Garden cottage',
    city: 'Austin',
    pricePerNight: '142.50',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    title: 'Harbor studio',
    city: 'Seattle',
    pricePerNight: '210.00',
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
  },
];

async function main() {
  for (const row of rows) {
    await prisma.property.upsert({
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
