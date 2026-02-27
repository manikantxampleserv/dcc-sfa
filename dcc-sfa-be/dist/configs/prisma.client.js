"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrisma = void 0;
const client_1 = require("@prisma/client");
const adapter_mssql_1 = require("@prisma/adapter-mssql");
const env_1 = require("./env");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
// First check if DATABASE_URL is already set in environment variables
if (!process.env.DATABASE_URL) {
    // Ensure environment variables are loaded (same as env.ts)
    const possiblePaths = [
        (0, path_1.resolve)(process.cwd(), '.env'), // Current working directory
        (0, path_1.resolve)(__dirname, '../../.env'), // Relative to compiled file
        (0, path_1.resolve)(__dirname, '../../../.env'), // For production builds
        '.env', // Fallback
    ];
    for (const path of possiblePaths) {
        try {
            const result = dotenv_1.default.config({ path, quiet: true });
            if (result.error) {
                continue;
            }
            if (process.env.DATABASE_URL) {
                break;
            }
        }
        catch (error) {
            continue;
        }
    }
}
let prisma = null;
const parseConnectionString = (connectionString) => {
    const params = Object.fromEntries(connectionString
        .split(';')
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => {
        const [key, ...valueParts] = p.split('=');
        return [key.trim().toLowerCase(), valueParts.join('=').trim()];
    })
        .filter(([k, v]) => k && v));
    let server = params.server || params['data source'] || '';
    let port = params.port || '1433';
    if (connectionString.startsWith('sqlserver://') ||
        connectionString.startsWith('mssql://')) {
        const url = new URL(connectionString.split(';')[0]);
        server = url.hostname;
        port = url.port || port;
    }
    if (!server || !(params.database || params['initial catalog'])) {
        throw new Error('Invalid connection string: server and database are required');
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
            max: 5,
            min: 1,
            idleTimeoutMillis: 30000,
            acquireTimeoutMillis: 15000,
            createTimeoutMillis: 15000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100,
        },
    };
};
const getPrisma = () => {
    if (!prisma) {
        const databaseUrl = env_1.config.database.url;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not configured in environment');
        }
        const connectionConfig = parseConnectionString(databaseUrl);
        const adapter = new adapter_mssql_1.PrismaMssql(connectionConfig);
        prisma = new client_1.PrismaClient({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
            transactionOptions: {
                maxWait: 5000,
                timeout: 10000,
                isolationLevel: 'ReadCommitted',
            },
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
exports.getPrisma = getPrisma;
exports.default = new Proxy({}, {
    get(_target, prop) {
        return (0, exports.getPrisma)()[prop];
    },
});
//# sourceMappingURL=prisma.client.js.map