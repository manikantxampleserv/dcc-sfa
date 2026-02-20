"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env'), quiet: true });
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
    override: true,
    quiet: true,
});
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
        console.error(' Missing B2 environment variables:', missing);
        throw new Error(`Missing required B2 variables: ${missing.join(', ')}`);
    }
};
validateB2Config();
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