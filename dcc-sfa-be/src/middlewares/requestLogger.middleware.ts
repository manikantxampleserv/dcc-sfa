import { Request, Response, NextFunction } from 'express';
import prisma from '../configs/prisma.client';

export const createRequestLogger = (serviceName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const originalJson = res.json;

        res.json = function (body: any) {
            try {
                const payload = req.method === 'GET'
                    ? (req.query && Object.keys(req.query).length ? JSON.stringify(req.query) : null)
                    : (req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : null);

                const logData = {
                    service: serviceName,
                    endpoint: req.originalUrl || req.path,
                    method: req.method,
                    payload,
                    response: body ? JSON.stringify(body) : null,
                    status_code: res.statusCode,
                    user_id: (req as any).user?.id ? Number((req as any).user.id) : null,
                    ip_address: (req.ip || req.headers['x-forwarded-for']?.toString() || '').substring(0, 50) || null,
                    device_info: (req.headers['user-agent'] || '').substring(0, 255) || null,
                };

                prisma.request_logs.create({ data: logData }).catch((err) => {
                    console.error(`Failed to save ${serviceName} request log:`, err);
                });
            } catch (err) {
                console.error(`Error logging ${serviceName} request:`, err);
            }

            return originalJson.call(this, body);
        };

        next();
    };
};
