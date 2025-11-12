import { Request, Response, NextFunction } from 'express';
import { getClientIP } from '../utils/ipUtils';
import prisma from '../configs/prisma.client';

/**
 * Create an audit log entry
 */
const createAuditLog = async (
  tableName: string,
  recordId: number,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  changedData: any,
  userId: number,
  req: Request
) => {
  try {
    const ipAddress = getClientIP(req);
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const sessionId = (req.headers['x-session-id'] as string) || 'Unknown';

    await prisma.audit_logs.create({
      data: {
        table_name: tableName,
        record_id: recordId,
        action: action,
        changed_data:
          typeof changedData === 'string'
            ? changedData
            : JSON.stringify(changedData),
        changed_by: userId,
        ip_address: ipAddress,
        device_info: deviceInfo,
        session_id: sessionId,
        createdby: userId,
        is_active: 'Y',
        createdate: new Date(),
        changed_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

/**
 * Audit middleware wrapper functions
 */
export const auditMiddleware = {
  logCreate: async (
    tableName: string,
    recordId: number,
    data: any,
    userId: number,
    req: Request
  ) => {
    return createAuditLog(tableName, recordId, 'CREATE', data, userId, req);
  },

  logUpdate: async (
    tableName: string,
    recordId: number,
    oldData: any,
    newData: any,
    userId: number,
    req: Request
  ) => {
    const changes = { old: oldData, new: newData };
    return createAuditLog(tableName, recordId, 'UPDATE', changes, userId, req);
  },

  logDelete: async (
    tableName: string,
    recordId: number,
    data: any,
    userId: number,
    req: Request
  ) => {
    return createAuditLog(tableName, recordId, 'DELETE', data, userId, req);
  },
};

/**
 * Audit Route Middleware
 * Automatically logs CRUD operations at the route level
 */
export const auditRoute = (
  tableName: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      const result = originalJson(data);

      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = (req as any).user?.id || 1;

        try {
          switch (action) {
            case 'CREATE':
              if (data?.data?.id) {
                createAuditLog(
                  tableName,
                  data.data.id,
                  'CREATE',
                  data.data,
                  userId,
                  req
                ).catch((error: any) =>
                  console.error('Audit log error:', error)
                );
              }
              break;

            case 'UPDATE':
              if (req.params?.id && data?.data) {
                const recordId = parseInt(req.params.id);
                createAuditLog(
                  tableName,
                  recordId,
                  'UPDATE',
                  { new: data.data },
                  userId,
                  req
                ).catch((error: any) =>
                  console.error('Audit log error:', error)
                );
              }
              break;

            case 'DELETE':
              if (req.params?.id) {
                const recordId = parseInt(req.params.id);
                createAuditLog(
                  tableName,
                  recordId,
                  'DELETE',
                  {},
                  userId,
                  req
                ).catch((error: any) =>
                  console.error('Audit log error:', error)
                );
              }
              break;
          }
        } catch (error) {
          console.error('Audit middleware error:', error);
        }
      }

      return result;
    };

    next();
  };
};

export const auditCreate = (tableName: string) => {
  return auditRoute(tableName, 'CREATE');
};

export const auditUpdate = (tableName: string) => {
  return auditRoute(tableName, 'UPDATE');
};

export const auditDelete = (tableName: string) => {
  return auditRoute(tableName, 'DELETE');
};
