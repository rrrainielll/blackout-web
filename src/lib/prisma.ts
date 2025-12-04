import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV !== 'production' ? ['query'] : [],
};

export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
