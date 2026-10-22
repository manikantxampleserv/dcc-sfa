import { Request, Response, NextFunction } from 'express';
import prisma from '../configs/prisma.client';

/**
 * Middleware to intercept JSON error responses and log failures to the database,
 * while ignoring routine authentication errors such as access_token_missing.
 *
 * @param req Express Request
 * @param res Express Response
 * @param next Express NextFunction
 */
export const errorLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json;

  res.json = function (body: any) {
    const failedItems = body?.results?.failed || body?.data?.failed;

    if (failedItems && Array.isArray(failedItems) && failedItems.length > 0) {
      try {
        for (const failedItem of failedItems) {
          const errorMessage = failedItem.error || 'Bulk operation failed';

          const isAccessTokenMissing =
            failedItem.error === 'access_token_missing' ||
            errorMessage === 'access_token_missing' ||
            (typeof errorMessage === 'string' &&
              errorMessage.includes('access_token_missing'));

          if (isAccessTokenMissing) {
            continue;
          }

          const errorLog = {
            message:
              typeof errorMessage === 'string'
                ? errorMessage
                : JSON.stringify(errorMessage),
            stack: failedItem.stack || null,
            path: req.originalUrl || req.path,
            method: req.method,
            body: JSON.stringify({
              requestPayload: req.body,
              failedItemContext: failedItem,
            }),
            query:
              req.query && Object.keys(req.query).length
                ? JSON.stringify(req.query)
                : null,
            user_id: (req as any).user?.id
              ? Number((req as any).user.id)
              : null,
            ip_address:
              (
                req.ip ||
                req.headers['x-forwarded-for']?.toString() ||
                ''
              ).substring(0, 50) || null,
            device_info:
              (req.headers['user-agent'] || '').substring(0, 255) || null,
          };
          prisma.error_logs.create({ data: errorLog }).catch(console.error);
        }
      } catch (loggerError) {
        console.error('Failed to log bulk failures to database:', loggerError);
      }
    } else if (res.statusCode >= 400) {
      try {
        const errorMessage =
          body?.error || body?.message || `HTTP Error ${res.statusCode}`;

        const isAccessTokenMissing =
          body?.error === 'access_token_missing' ||
          body?.message === 'access_token_missing' ||
          errorMessage === 'access_token_missing' ||
          (typeof errorMessage === 'string' &&
            errorMessage.includes('access_token_missing'));

        if (!isAccessTokenMissing) {
          const errorLog = {
            message:
              typeof errorMessage === 'string'
                ? errorMessage
                : JSON.stringify(errorMessage),
            stack: body?.stack || null,
            path: req.originalUrl || req.path,
            method: req.method,
            body:
              req.body && Object.keys(req.body).length
                ? JSON.stringify(req.body)
                : null,
            query:
              req.query && Object.keys(req.query).length
                ? JSON.stringify(req.query)
                : null,
            user_id: (req as any).user?.id
              ? Number((req as any).user.id)
              : null,
            ip_address:
              (
                req.ip ||
                req.headers['x-forwarded-for']?.toString() ||
                ''
              ).substring(0, 50) || null,
            device_info:
              (req.headers['user-agent'] || '').substring(0, 255) || null,
          };
          prisma.error_logs.create({ data: errorLog }).catch(console.error);
        }
      } catch (loggerError) {
        console.error('Failed to log error to database:', loggerError);
      }
    }
    return originalJson.call(this, body);
  };

  next();
};
