import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL não está definida.');
  }

  const adminEmail = process.env.SEED_SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD;
  const adminName = process.env.SEED_SUPER_ADMIN_NAME || 'Super Admin';

  if (!adminEmail) {
    throw new Error('SEED_SUPER_ADMIN_EMAIL não está definida.');
  }

  if (!adminPassword) {
    throw new Error('SEED_SUPER_ADMIN_PASSWORD não está definida.');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const normalizedEmail = adminEmail.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: adminName,
          password: passwordHash,
          role: 'SUPER_ADMIN',
          companyId: null,
          isActive: true,
        },
      });

      console.log(`SUPER_ADMIN atualizado: ${normalizedEmail}`);
      return;
    }

    await prisma.user.create({
      data: {
        name: adminName,
        email: normalizedEmail,
        password: passwordHash,
        role: 'SUPER_ADMIN',
        companyId: null,
        isActive: true,
      },
    });

    console.log(`SUPER_ADMIN criado: ${normalizedEmail}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});