/**
 * Application entry point.
 * Handles environment setup and starts the server.
 *
 * @module index
 */

import { startServer } from './server';
import './configs/env';

startServer();
