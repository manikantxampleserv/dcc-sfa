import { Router, Request, Response } from 'express';

const routes = Router();

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
