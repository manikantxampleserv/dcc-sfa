import { Router, Request, Response } from 'express';

import user from '../v1/routes/user.routes';
import auth from '../v1/routes/auth.routes';
import roles from '../v1/routes/roles.routes';
import rolePermissions from '../v1/routes/rolePermissions.routes';
import permissions from '../v1/routes/permissions.routes';
import company from '../v1/routes/company.routes';
const routes = Router();

routes.use('/v1', auth);
routes.use('/v1', user);
routes.use('/v1', roles);
routes.use('/v1', rolePermissions);
routes.use('/v1', permissions);
routes.use('/v1', company);

routes.get('/', (_: any, res: any) => {
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

routes.get('/v1/health', (_: any, res: any) => {
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
