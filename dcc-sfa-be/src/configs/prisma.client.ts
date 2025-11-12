import { PrismaClient as PrismaClientType } from '@prisma/client';

let prisma: PrismaClientType | null = null;

export const getPrisma = (): PrismaClientType => {
  if (!prisma) {
    prisma = new PrismaClientType({
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prisma;
};

// Lazy default export - only creates instance when accessed
export default new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    return getPrisma()[prop as keyof PrismaClientType];
  },
});
