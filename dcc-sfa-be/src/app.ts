import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import { resolve } from 'path';
import { setupGraphQL } from './graphql/server';
import { scheduleCustomerCategoryAssignment } from './jobs/customerCategoryAssignment.job';
import { scheduleReconciliationJob } from './jobs/reconciliation.job';
import { responseHandler } from './middlewares/response.middleware';
import routes from './routes';

const possiblePaths = [
  resolve(process.cwd(), '.env'),
  resolve(__dirname, '../.env'),
  resolve(__dirname, '../../../.env'),
  '.env',
];

for (const path of possiblePaths) {
  try {
    const result = dotenv.config({ path, quiet: true });
    if (result.error) {
      continue;
    }
    if (process.env.DATABASE_URL) {
      break;
    }
  } catch (error) {
    continue;
  }
}

/**
 * Creates and configures the Express application
 * @returns {Promise<Application>} Configured Express application
 */
export const createApp = async (): Promise<Application> => {
  const app = express();

  app.set('trust proxy', true);

  await setupGraphQL(app);

  app.use(express.json({ limit: '10mb' }));

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(cookieParser() as any);

  app.use(cors({ origin: '*', credentials: true }));

  app.use(responseHandler);

  app.use('/api', routes);

  scheduleCustomerCategoryAssignment();
  scheduleReconciliationJob();

  return app;
};
