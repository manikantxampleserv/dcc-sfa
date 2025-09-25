import { Router, Request, Response } from 'express';

import user from '../v1/routes/user.routes';
import auth from '../v1/routes/auth.routes';
import roles from '../v1/routes/roles.routes';
const routes = Router();

routes.use('/v1', auth);
routes.use('/v1', user);
routes.use('/v1', roles);

/**
 * Root endpoint - Welcome message and API documentation
 */
routes.get('/', (_: Request, res: Response) => {
  res.json({
    name: 'DCC-SFA API',
    description: 'Sales Force Automation System - Backend API',
    version: 'v1.0.0',
    status: 'Running',
    developer: 'Ampleserv Developers',
    documentation: {
      health: 'GET /api/v1/health - Check API health status',
      endpoints: ['GET /api/v1/health - Health check endpoint'],
    },
    links: {
      frontend: 'http://localhost:5173',
      health: 'http://localhost:4000/api/v1/health',
      repository: 'https://github.com/manikantxampleserv/dcc-sfa',
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(2) + 's',
  });
});

/**
 * Health check endpoint
 */
routes.get('/v1/health', (_: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'DCC SFA is alive, well-fed, and caffeinated.',
    uptime: process.uptime().toFixed(2) + 's',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: 'v1.0.0',
    database: 'Connected',
    memoryUsage: process.memoryUsage().rss + ' bytes',
    developer: 'Ampleserv Developers',
  });
});

export default routes;
