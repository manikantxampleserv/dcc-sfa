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
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env'), quiet: true });
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
    override: true,
    quiet: true,
});
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