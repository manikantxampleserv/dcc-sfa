import dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(' Error loading .env file:', result.error);
  throw result.error;
}

console.log('Env variables loaded:', envPath);

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
  // console.log('B2 confiuration validated:', {
  //   keyId: required.BACKBLAZE_B2_KEY_ID!.substring(0, 8) + '...',
  //   bucketName: required.BACKBLAZE_B2_BUCKET_NAME,
  //   bucketId: required.BACKBLAZE_B2_BUCKET_ID!.substring(0, 8) + '...',
  // });
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
