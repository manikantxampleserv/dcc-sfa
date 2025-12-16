import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { config } from 'mssql';

let prisma: PrismaClient | null = null;

const parseConnectionString = (connectionString: string): config => {
  const params = Object.fromEntries(
    connectionString
      .split(';')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => {
        const [key, ...valueParts] = p.split('=');
        return [key.trim().toLowerCase(), valueParts.join('=').trim()];
      })
      .filter(([k, v]) => k && v)
  );

  let server = params.server || params['data source'] || '';
  let port = params.port || '1433';

  if (
    connectionString.startsWith('sqlserver://') ||
    connectionString.startsWith('mssql://')
  ) {
    const url = new URL(connectionString.split(';')[0]);
    server = url.hostname;
    port = url.port || port;
  }

  if (!server || !(params.database || params['initial catalog'])) {
    throw new Error(
      'Invalid connection string: server and database are required'
    );
  }

  return {
    server,
    port: parseInt(port, 10),
    database: params.database || params['initial catalog'] || '',
    user: params['user id'] || params.user || '',
    password: params.password || params.pwd || '',
    options: {
      encrypt: params.encrypt?.toLowerCase() !== 'false',
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    connectionTimeout: 30000,
    requestTimeout: 60000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    },
  };
};

export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is not set. Please create a .env file with DATABASE_URL configured.'
      );
    }
    const connectionConfig = parseConnectionString(databaseUrl);
    const adapter = new PrismaMssql(connectionConfig);
    prisma = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    process.on('beforeExit', async () => {
      if (prisma) {
        await prisma.$disconnect();
      }
    });

    process.on('SIGINT', async () => {
      if (prisma) {
        await prisma.$disconnect();
        process.exit(0);
      }
    });

    process.on('SIGTERM', async () => {
      if (prisma) {
        await prisma.$disconnect();
        process.exit(0);
      }
    });
  }
  return prisma;
};

export default new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});
