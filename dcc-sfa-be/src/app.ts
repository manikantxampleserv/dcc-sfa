/**
 * Sets up middleware, routes, and application-level configurations.
 */

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import { responseHandler } from './middlewares/response.middleware';
import routes from './routes';

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

  return app;
};
