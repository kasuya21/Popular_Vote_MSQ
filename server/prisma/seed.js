const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Seed Admins ---
  const defaultPassword = await bcrypt.hash('password123', 10);
  const mainAdminPassword = await bcrypt.hash('Deoxy2004', 10);
  
  const admins = [
    { email: 'thunva2004@gmail.com', name: 'Main Admin', role: 'SUPER_ADMIN', passwordHash: mainAdminPassword }
  ];

  for (const adminData of admins) {
    await prisma.admin.upsert({
      where: { email: adminData.email },
      update: {},
      create: adminData,
    });
  }
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
