import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

/**
 * Extracts a human-readable record name or identifier from changed audit data or entity payload.
 * @param data - The parsed changed data or database record
 * @returns The resolved record name or null
 */
const extractRecordName = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const candidateFields = [
    'order_number',
    'invoice_number',
    'order_no',
    'invoice_no',
    'name',
    'title',
    'outlet_name',
    'shop_name',
    'customer_name',
    'product_name',
    'route_name',
    'vehicle_number',
    'plate_number',
    'reference_number',
    'reference_no',
    'reference',
    'ref_no',
    'voucher_no',
    'receipt_no',
    'code',
    'short_code',
    'username',
    'employee_id',
    'description',
  ];

  const obj = data as Record<string, unknown>;

  for (const field of candidateFields) {
    const val = obj[field];
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
    if (typeof val === 'number') {
      return String(val);
    }
  }

  const nestedKeys = ['new', 'data', 'old', 'record', 'item'];
  for (const key of nestedKeys) {
    if (obj[key] && typeof obj[key] === 'object') {
      const nested = obj[key] as Record<string, unknown>;
      for (const field of candidateFields) {
        const val = nested[field];
        if (typeof val === 'string' && val.trim().length > 0) {
          return val.trim();
        }
        if (typeof val === 'number') {
          return String(val);
        }
      }
    }
  }

  return null;
};

/**
 * Attempts to retrieve a referenced record's display name directly from its database table.
 * @param tableName - Name of the database table
 * @param recordId - Primary key ID of the record
 * @returns The resolved display name or null
 */
const resolveRecordNameFromDb = async (
  tableName: string,
  recordId: number
): Promise<string | null> => {
  if (!tableName || !recordId || isNaN(recordId)) {
    return null;
  }

  try {
    const raw = tableName.trim().toLowerCase();
    const candidateModelNames = [
      raw,
      raw.endsWith('s') ? raw.slice(0, -1) : `${raw}s`,
    ];

    let targetModel: unknown = null;
    for (const modelKey of candidateModelNames) {
      if ((prisma as unknown as Record<string, unknown>)[modelKey]) {
        targetModel = (prisma as unknown as Record<string, unknown>)[modelKey];
        break;
      }
    }

    if (
      !targetModel ||
      typeof (targetModel as Record<string, unknown>).findUnique !== 'function'
    ) {
      return null;
    }

    const record = await (
      targetModel as {
        findUnique: (args: { where: { id: number } }) => Promise<unknown>;
      }
    ).findUnique({
      where: { id: recordId },
    });

    if (record) {
      return extractRecordName(record);
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * Audit Logs Controller
 * Handles audit log queries and reporting
 */
export const auditLogsController = {
  /**
   * Get Audit Logs
   * GET /api/v1/audit-logs
   * Returns audit logs with filtering and pagination
   */
  async getAuditLogs(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        table_name,
        action,
        user_id,
        start_date,
        end_date,
      } = req.query;

      const where: Record<string, unknown> = {
        is_active: 'Y',
      };

      if (table_name) {
        where.table_name = table_name as string;
      } else {
        where.table_name = {
          notIn: [
            'gps_logs',
            'gps_log',
            'request_logs',
            'error_logs',
            'mobile_error_logs',
          ],
        };
      }

      if (action) {
        where.action = action as string;
      }

      if (user_id) {
        where.changed_by = parseInt(user_id as string);
      }

      if (start_date || end_date) {
        const dateFilter: Record<string, Date> = {};
        if (start_date) {
          dateFilter.gte = new Date(start_date as string);
        }
        if (end_date) {
          dateFilter.lte = new Date(end_date as string);
        }
        where.changed_at = dateFilter;
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const { data, pagination } = await paginate<Record<string, unknown>>({
        model: prisma.audit_logs,
        filters: where,
        page: pageNum,
        limit: limitNum,
        orderBy: { changed_at: 'desc' },
        include: {
          users_audit_logs_changed_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
              profile_image: true,
            },
          },
        },
      });

      const serializedLogs = await Promise.all(
        data.map(async log => {
          let parsedChangedData: unknown = null;
          try {
            parsedChangedData = log.changed_data
              ? JSON.parse(log.changed_data as string)
              : null;
          } catch {
            parsedChangedData = log.changed_data;
          }

          let record_name = extractRecordName(parsedChangedData);
          if (
            !record_name &&
            typeof log.table_name === 'string' &&
            typeof log.record_id === 'number'
          ) {
            record_name = await resolveRecordNameFromDb(
              log.table_name,
              log.record_id
            );
          }

          const userRelation = log.users_audit_logs_changed_byTousers as
            | {
                name?: string;
                email?: string;
                employee_id?: string | null;
                profile_image?: string | null;
              }
            | undefined;

          return {
            id: log.id,
            table_name: log.table_name,
            record_id: log.record_id,
            record_name: record_name,
            action: log.action,
            changed_data: parsedChangedData,
            changed_by: log.changed_by,
            user_name: userRelation?.name || 'N/A',
            user_email: userRelation?.email || 'N/A',
            user_avatar: userRelation?.profile_image || null,
            employee_id: userRelation?.employee_id || null,
            changed_at: log.changed_at,
            ip_address: log.ip_address,
            device_info: log.device_info,
            session_id: log.session_id,
          };
        })
      );

      /**
       * Calculate statistics
       */
      const stats = {
        total_logs: pagination.total_count,
        by_action: {
          CREATE: await prisma.audit_logs.count({
            where: { ...where, action: 'CREATE' },
          }),
          UPDATE: await prisma.audit_logs.count({
            where: { ...where, action: 'UPDATE' },
          }),
          DELETE: await prisma.audit_logs.count({
            where: { ...where, action: 'DELETE' },
          }),
        },
        unique_tables: await prisma.audit_logs.findMany({
          where,
          select: { table_name: true },
          distinct: ['table_name'],
        }),
        unique_users: await prisma.audit_logs.findMany({
          where,
          select: { changed_by: true },
          distinct: ['changed_by'],
        }),
      };

      res.json({
        success: true,
        message: 'Audit logs retrieved successfully',
        data: {
          logs: serializedLogs,
          pagination: {
            page: pagination.current_page,
            limit: limitNum,
            total: pagination.total_count,
            total_pages: pagination.total_pages,
          },
          statistics: {
            ...stats,
            unique_tables_count: stats.unique_tables.length,
            unique_users_count: stats.unique_users.length,
          },
        },
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Get Audit Logs Error:', error);
      res.status(500).json({
        success: false,
        message: err?.message || 'Failed to retrieve audit logs',
      });
    }
  },
};
