import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial users...');
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const father = await prisma.user.upsert({
    where: { email: 'father@finance.local' },
    update: {},
    create: {
      name: 'Father',
      email: 'father@finance.local',
      password: passwordHash,
      role: 'FATHER',
    },
  });
  
  const son = await prisma.user.upsert({
    where: { email: 'son@finance.local' },
    update: {},
    create: {
      name: 'Son',
      email: 'son@finance.local',
      password: passwordHash,
      role: 'SON',
    },
  });
  
  const defaultSetting = await prisma.setting.create({
    data: {
      companyName: 'My Finance',
      currency: 'INR',
      defaultInterestRate: 2.0,
      defaultDurationType: 'MONTHS',
      theme: 'SYSTEM'
    }
  });

  console.log('Created Father:', father.email);
  console.log('Created Son:', son.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
