import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import { responseHandler } from './middlewares/response.middleware';
import routes from './routes';
import { scheduleCustomerCategoryAssignment } from './jobs/customerCategoryAssignment.job';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { setupGraphQL } from './graphql/server';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from './configs/swagger';

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
 * @returns {Promise<Application>} Configured Express application
 */
export const createApp = async (): Promise<Application> => {
  const app = express();

  app.set('trust proxy', true);

  await setupGraphQL(app);

  app.use(express.json({ limit: '10mb' }));

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(cookieParser());

  app.use(cors({ origin: '*', credentials: true }));

  app.use(responseHandler);

  app.use('/api', routes);

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  scheduleCustomerCategoryAssignment();

  return app;
};
