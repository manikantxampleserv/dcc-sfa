"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL found in environment variables');
}
else {
    const isProduction = process.env.NODE_ENV === 'production' ||
        process.env.NODE_ENV === 'prod' ||
        process.env.env === 'production';
    console.log(`Environment detection - NODE_ENV: ${process.env.NODE_ENV}, isProduction: ${isProduction}`);
    const possiblePaths = [
        ...(isProduction
            ? [
                (0, path_1.resolve)(process.cwd(), '.env.production'),
                (0, path_1.resolve)(__dirname, '../../.env.production'),
                (0, path_1.resolve)(__dirname, '../../../.env.production'),
            ]
            : []),
        (0, path_1.resolve)(process.cwd(), '.env'),
        (0, path_1.resolve)(__dirname, '../../.env'),
        (0, path_1.resolve)(__dirname, '../../../.env'),
        '.env',
    ];
    let envLoaded = false;
    for (const path of possiblePaths) {
        try {
            const result = dotenv_1.default.config({ path, quiet: true });
            if (result.error) {
                continue;
            }
            if (process.env.DATABASE_URL) {
                console.log(`DATABASE_URL loaded from: ${path}`);
                envLoaded = true;
                break;
            }
        }
        catch (error) {
            continue;
        }
    }
    if (!envLoaded && !process.env.DATABASE_URL) {
        console.warn('Warning: DATABASE_URL not found in any .env file');
        console.warn('Attempted paths:', possiblePaths);
        console.warn('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
        console.warn('Current working directory:', process.cwd());
        console.warn('Module directory:', __dirname);
        console.warn('NODE_ENV:', process.env.NODE_ENV);
    }
}
const validateB2Config = () => {
    const required = {
        BACKBLAZE_B2_KEY_ID: process.env.BACKBLAZE_B2_KEY_ID,
        BACKBLAZE_B2_APPLICATION_KEY: process.env.BACKBLAZE_B2_APPLICATION_KEY,
        BACKBLAZE_B2_BUCKET_ID: process.env.BACKBLAZE_B2_BUCKET_ID,
        BACKBLAZE_B2_BUCKET_NAME: process.env.BACKBLAZE_B2_BUCKET_NAME,
    };
    const missing = Object.entries(required)
        .filter(([_, value]) => !value)
        .map(([key]) => key);
    if (missing.length > 0) {
        console.warn(' Missing B2 environment variables:', missing);
    }
};
validateB2Config();
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required but not found in environment variables');
}
exports.config = {
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    server: {
        port: parseInt(process.env.PORT || '4000'),
    },
    b2: {
        keyId: process.env.BACKBLAZE_B2_KEY_ID,
        applicationKey: process.env.BACKBLAZE_B2_APPLICATION_KEY,
        bucketId: process.env.BACKBLAZE_B2_BUCKET_ID,
        bucketName: process.env.BACKBLAZE_B2_BUCKET_NAME,
        bucketUrl: process.env.BACKBLAZE_BUCKET_URL,
    },
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        username: process.env.SMTP_USERNAME,
        password: process.env.SMTP_PASSWORD,
        mailHost: process.env.MAIL_HOST,
    },
};
//# sourceMappingURL=env.js.map