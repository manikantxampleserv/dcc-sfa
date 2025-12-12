import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { config } from 'mssql';

let prisma: PrismaClient | null = null;

const parseParams = (paramsString: string): Record<string, string> => {
  const parts: Record<string, string> = {};
  paramsString.split(';').forEach(part => {
    const trimmed = part.trim();
    if (!trimmed) return;
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) return;
    const key = trimmed.substring(0, equalIndex).trim().toLowerCase();
    const value = trimmed.substring(equalIndex + 1).trim();
    if (key && value) {
      parts[key] = value;
    }
  });
  return parts;
};

const parseConnectionString = (connectionString: string): config => {
  const parts: Record<string, string> = {};

  if (
    connectionString.startsWith('sqlserver://') ||
    connectionString.startsWith('mssql://')
  ) {
    const urlEndIndex = connectionString.indexOf(';');
    const urlPart =
      urlEndIndex > 0
        ? connectionString.substring(0, urlEndIndex)
        : connectionString;
    const paramsPart =
      urlEndIndex > 0 ? connectionString.substring(urlEndIndex + 1) : '';

    const url = new URL(urlPart);
    parts.server = url.hostname;
    parts.port = url.port || '1433';

    Object.assign(parts, parseParams(paramsPart));
  } else {
    Object.assign(parts, parseParams(connectionString));
  }

  const configObj: config = {
    server: parts.server || parts['data source'] || '',
    port: parts.port ? parseInt(parts.port, 10) : 1433,
    database: parts.database || parts['initial catalog'] || '',
    user: parts['user id'] || parts.user || '',
    password: parts.password || parts.pwd || '',
    options: {
      encrypt: parts.encrypt?.toLowerCase() !== 'false',
      trustServerCertificate: true,
    },
  };

  if (!configObj.server || !configObj.database) {
    throw new Error(
      'Invalid connection string: server and database are required'
    );
  }

  return configObj;
};

export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    const connectionConfig = parseConnectionString(process.env.DATABASE_URL!);
    const adapter = new PrismaMssql(connectionConfig);
    prisma = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prisma;
};

export default new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});
