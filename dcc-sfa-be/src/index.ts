/**
 * Application entry point.
 * Handles environment setup and starts the server.
 *
 * @module index
 */

import dotenv from 'dotenv';
import { startServer } from './server';

dotenv.config({ quiet: true });

/**
 * Suppresses DEP0123 warning for IP addresses in TLS connections.
 * This warning occurs when connecting to SQL Server with an IP address.
 */
process.on('warning', (warning: Error) => {
  if (warning.message && warning.message.includes('DEP0123')) {
    return;
  }
  console.warn(warning.name, warning.message);
});

startServer();
