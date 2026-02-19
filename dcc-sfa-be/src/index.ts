/**
 * Application entry point.
 * Handles environment setup and starts the server.
 *
 * @module index
 */

import dotenv from 'dotenv';
import path from 'path';
import { startServer } from './server';

// Load base .env first, then override with environment-specific file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || 'development'}`
  ),
  override: true,
});

startServer();
