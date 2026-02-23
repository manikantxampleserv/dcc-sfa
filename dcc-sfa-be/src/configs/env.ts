import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
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
    console.warn(' Missing B2 environment variables:', missing);
  }
};

validateB2Config();

export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
  },
  server: {
    port: parseInt(process.env.PORT || '4000'),
  },
  b2: {
    keyId: process.env.BACKBLAZE_B2_KEY_ID!,
    applicationKey: process.env.BACKBLAZE_B2_APPLICATION_KEY!,
    bucketId: process.env.BACKBLAZE_B2_BUCKET_ID!,
    bucketName: process.env.BACKBLAZE_B2_BUCKET_NAME!,
    bucketUrl: process.env.BACKBLAZE_BUCKET_URL!,
  },
  smtp: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '465'),
    username: process.env.SMTP_USERNAME!,
    password: process.env.SMTP_PASSWORD!,
    mailHost: process.env.MAIL_HOST!,
  },
};
