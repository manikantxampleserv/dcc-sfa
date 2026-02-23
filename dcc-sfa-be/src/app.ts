/**
 * Sets up middleware, routes, and application-level configurations.
 */

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import { responseHandler } from './middlewares/response.middleware';
import routes from './routes';
import { scheduleCustomerCategoryAssignment } from './jobs/customerCategoryAssignment.job';
import dotenv from 'dotenv';
import { resolve } from 'path';

// First check if DATABASE_URL is already set in environment variables
if (!process.env.DATABASE_URL) {
  // Load environment variables from the root directory
  const possiblePaths = [
    resolve(process.cwd(), '.env'), // Current working directory
    resolve(__dirname, '../.env'), // Relative to compiled file
    resolve(__dirname, '../../../.env'), // For production builds
    '.env', // Fallback
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
}

/**
 * Creates and configures the Express application
 * @returns {Application} Configured Express application
 */
export const createApp = (): Application => {
  const app = express();

  app.set('trust proxy', true);

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.use(cookieParser());

  app.use(cors({ origin: '*', credentials: true }));

  app.use(responseHandler);

  app.use('/api', routes);
  scheduleCustomerCategoryAssignment();

  return app;
};
