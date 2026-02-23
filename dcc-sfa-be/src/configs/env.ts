import dotenv from 'dotenv';
import { resolve } from 'path';

// First check if DATABASE_URL is already set in environment variables
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL found in environment variables');
} else {
  console.log(
    'DATABASE_URL not found in environment variables, attempting to load from .env files...'
  );

  // Try .env.production first for production environment
  const isProduction = process.env.NODE_ENV === 'production';

  // Load environment variables from the appropriate .env file
  const possiblePaths = [
    isProduction
      ? resolve(process.cwd(), '.env.production')
      : resolve(process.cwd(), '.env'), // Production .env file
    resolve(process.cwd(), '.env'), // Current working directory
    resolve(__dirname, '../../.env'), // Relative to compiled file
    resolve(__dirname, '../../../.env'), // For production builds
    '.env', // Fallback
  ];

  let envLoaded = false;
  for (const path of possiblePaths) {
    try {
      const result = dotenv.config({ path, quiet: true });
      if (result.error) {
        // Try next path
        continue;
      }
      if (process.env.DATABASE_URL) {
        console.log(`DATABASE_URL loaded from: ${path}`);
        envLoaded = true;
        break;
      }
    } catch (error) {
      // Try next path
      continue;
    }
  }

  if (!envLoaded && !process.env.DATABASE_URL) {
    console.warn('Warning: DATABASE_URL not found in any .env file');
    console.warn('Attempted paths:', possiblePaths);
    console.warn(
      'Available env vars:',
      Object.keys(process.env).filter(key => key.includes('DATABASE'))
    );
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

// Ensure DATABASE_URL is available before exporting config
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is required but not found in environment variables'
  );
}

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
