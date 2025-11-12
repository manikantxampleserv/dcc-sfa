import { PrismaClient as PrismaClientType } from '@prisma/client';

let prisma: PrismaClientType | null = null;

export const PrismaClient = (): PrismaClientType => {
  if (!prisma) {
    prisma = new PrismaClientType({
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prisma;
};

export default PrismaClient();
