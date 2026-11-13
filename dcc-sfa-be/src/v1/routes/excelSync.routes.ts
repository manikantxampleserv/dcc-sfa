import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../configs/prisma.client';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { excelSyncController } from '../controllers/excelSync.controller';

const router = Router();

/**
 * Middleware that disables all HTTP caching for Excel live sync.
 * Prevents Excel Power Query from serving stale cached records.
 */
router.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.removeHeader('ETag');
  next();
});

/**
 * Authentication middleware for Excel live integration.
 * Supports:
 * 1. Query parameter token (?token=... or ?apiKey=...)
 * 2. Excel Basic Auth dialog (Username/Password encoded in base64)
 * 3. Excel Web API tab (Raw JWT key in Authorization header)
 * 4. Standard Bearer token in Authorization header
 *
 * @param {Request} req Express request
 * @param {Response} res Express response
 * @param {NextFunction} next Express next middleware
 * @returns {Promise<any>}
 */
const allowExcelTokenAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const rawAuth = req.headers['authorization'];
    const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
    const queryToken = (req.query.token ||
      req.query.apiKey ||
      req.query.key) as string | undefined;

    /**
     * Handle Excel Basic Authentication tab (Authorization: Basic base64(email:password))
     */
    if (rawAuth && rawAuth.startsWith('Basic ')) {
      const base64Credentials = rawAuth.substring(6).trim();
      const decoded = Buffer.from(base64Credentials, 'base64').toString(
        'utf-8'
      );
      const colonIndex = decoded.indexOf(':');

      if (colonIndex !== -1) {
        const username = decoded.substring(0, colonIndex).trim();
        const password = decoded.substring(colonIndex + 1);

        const user = await prisma.users.findFirst({
          where: {
            OR: [{ email: { equals: username } }, { employee_id: username }],
            is_active: 'Y',
          },
          include: {
            user_role: {
              include: {
                roles_permission: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        if (user && (await bcrypt.compare(password, user.password_hash))) {
          (req as any).user = {
            id: user.id,
            email: user.email,
            employee_id: user.employee_id,
            name: user.name,
            role: user.user_role?.name || 'Admin',
            version: user.version ?? null,
            permissions:
              user.user_role?.roles_permission
                ?.filter(
                  rp => rp.is_active === 'Y' && rp.permission?.is_active === 'Y'
                )
                ?.map(rp => rp.permission!.name) || [],
            parent_id: user.parent_id,
            depot_id: user.depot_id,
            zone_id: user.zone_id,
          };
          return next();
        }

        res.setHeader('WWW-Authenticate', 'Basic realm="Excel Live Sync"');
        return res.status(401).json({
          error: 'invalid_credentials',
          message: 'Invalid email or password for Excel sync.',
        });
      }
    }

    /**
     * Map Query Param or x-api-key or raw token to Bearer Authorization header.
     * Sanitizes tokens where trailing query parameters were accidentally concatenated.
     */
    let cleanToken = queryToken;
    if (cleanToken && cleanToken.includes('.')) {
      const parts = cleanToken.split('.');
      if (parts.length >= 3 && parts[2].length > 43) {
        const sigPart = parts[2];
        const extra = sigPart.substring(43);
        const sigClean = sigPart.substring(0, 43);
        cleanToken = `${parts[0]}.${parts[1]}.${sigClean}`;

        if (!req.query.start_date) {
          const sdMatch = extra.match(/start_date=([^&]+)/);
          if (sdMatch) {
            req.query.start_date = sdMatch[1];
          } else if (req.query.end_date) {
            req.query.start_date = req.query.end_date;
          }
        }
      }
    }

    if (!rawAuth && cleanToken) {
      req.headers['authorization'] = `Bearer ${cleanToken}`;
    } else if (!rawAuth && apiKeyHeader) {
      req.headers['authorization'] = `Bearer ${apiKeyHeader}`;
    } else if (
      rawAuth &&
      !rawAuth.startsWith('Bearer ') &&
      !rawAuth.startsWith('Basic ')
    ) {
      req.headers['authorization'] = `Bearer ${rawAuth}`;
    }

    if (!req.headers['authorization']) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Excel Live Sync"');
      return res.status(401).json({
        error: 'access_token_missing',
        message:
          'Authentication credentials or token required for Excel access.',
      });
    }

    return authenticateToken(req, res, next);
  } catch (error) {
    return res.status(500).json({
      error: 'auth_processing_error',
      message: 'Failed to process authentication for Excel request.',
    });
  }
};

/**
 * 1. Sales Data Endpoint
 * Streams live sales CSV data.
 * Query filters:
 * - Date filters: start_date, end_date, from_date, to_date, date (Formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, ISO).
 * - Format: EvDate column is formatted as DD-MM-YYYY.
 * - Hierarchy filters: depot_id, zone_id, route_id, customer_id, channel_id, category_id, type_id, user_id.
 */
router.get(
  '/excel/sale-data',
  allowExcelTokenAuth,
  excelSyncController.getSalesData
);

router.get(
  '/excel/sales-data',
  allowExcelTokenAuth,
  excelSyncController.getSalesData
);

/**
 * 2. Outlet Master Endpoint
 * Streams flat outlet master CSV data.
 * Query filters:
 * - Hierarchy filters: depot_id, zone_id, route_id, search.
 */
router.get(
  '/excel/outlet-master',
  allowExcelTokenAuth,
  excelSyncController.getOutletMaster
);

/**
 * 3. Survey Data Endpoint
 * Streams questionnaire answer details CSV.
 * Query filters:
 * - Date filters: start_date, end_date, from_date, to_date, date (Formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, ISO).
 * - Format: Date column is formatted as DD-MM-YYYY.
 * - Hierarchy filters: survey_id, user_id, customer_id.
 */
router.get(
  '/excel/survey-data',
  allowExcelTokenAuth,
  excelSyncController.getSurveyData
);

/**
 * 4. Van Load and Unload Detail Endpoint
 * Streams inventory movement load/unload details CSV.
 * Query filters:
 * - Date filters: start_date, end_date, from_date, to_date, date (Formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, ISO).
 * - Format: Date column is formatted as DD-MM-YYYY.
 * - Other filters: type (LOAD/UNLOAD), user_id.
 */
router.get(
  '/excel/van-load-unload',
  allowExcelTokenAuth,
  excelSyncController.getVanLoadUnload
);

export default router;
