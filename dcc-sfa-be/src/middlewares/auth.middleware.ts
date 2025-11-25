import jwt from 'jsonwebtoken';
import { jwtConfig } from '../configs/jwt.config';
import {
  buildPermissionName,
  formatPermissionErrorMessage,
  hasAllModulePermissions,
  hasAnyModulePermissions,
  isAdminRole,
  type Modules,
  type Actions,
} from '../configs/permissions.config';
import prisma from '../configs/prisma.client';

type PermissionItem = { module: Modules; action: Actions };

const userWithRoleAndPermissions = {
  user_role: {
    include: {
      roles_permission: {
        include: {
          permission: true,
        },
      },
    },
  },
};

export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'access_token_missing' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as { id: number };

    const dbToken = await prisma.api_tokens.findFirst({
      where: {
        token: token,
        user_id: decoded.id,
      },
    });

    if (dbToken) {
      if (dbToken.is_revoked === true) {
        return res.status(401).json({
          error: 'token_revoked',
          message: 'This token has been revoked. Please login again.',
        });
      }

      if (dbToken.is_active !== 'Y') {
        return res.status(401).json({
          error: 'token_inactive',
          message: 'This token is not active. Please login again.',
        });
      }

      if (dbToken.expires_at && new Date(dbToken.expires_at) < new Date()) {
        return res.status(401).json({
          error: 'token_expired',
          message: 'This token has expired. Please login again.',
        });
      }

      prisma.api_tokens
        .update({
          where: { id: dbToken.id },
          data: {
            ip_address: req.ip || req.socket.remoteAddress || 'unknown',
            updated_date: new Date(),
          },
        })
        .catch(err => console.error('Error updating token usage:', err));
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      include: userWithRoleAndPermissions,
    });

    if (!user || !user.user_role || user.is_active !== 'Y') {
      return res.status(401).json({ error: 'user_not_found_or_inactive' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.user_role.name,
      permissions: user.user_role.roles_permission
        .filter(rp => rp.is_active === 'Y' && rp.permission?.is_active === 'Y')
        .map(rp => rp.permission!.name),
      parent_id: user.parent_id,
      depot_id: user.depot_id,
      zone_id: user.zone_id,
    };

    req.token = token;
    req.dbToken = dbToken;
    next();
  } catch (err) {
    console.error('JWT error:', err);
    return res.status(401).json({ error: 'invalid_or_expired_token' });
  }
};

export const authenticateApiToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'api_token_missing',
        message: 'API token is required',
      });
    }

    const apiToken = await prisma.api_tokens.findFirst({
      where: {
        token: token,
      },
      include: {
        users_api_tokens_user_idTousers: {
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
        },
      },
    });

    if (!apiToken) {
      return res.status(401).json({
        success: false,
        error: 'invalid_token',
        message: 'API token not found',
      });
    }

    if (apiToken.is_revoked === true) {
      return res.status(401).json({
        success: false,
        error: 'token_revoked',
        message: 'This API token has been revoked',
      });
    }

    if (apiToken.is_active !== 'Y') {
      return res.status(401).json({
        success: false,
        error: 'token_inactive',
        message: 'This API token is not active',
      });
    }

    if (apiToken.expires_at && new Date(apiToken.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'token_expired',
        message: 'This API token has expired',
      });
    }

    const user = apiToken.users_api_tokens_user_idTousers;

    if (!user || user.is_active !== 'Y') {
      return res.status(401).json({
        success: false,
        error: 'user_inactive',
        message: 'User account is not active',
      });
    }

    if (!user.user_role) {
      return res.status(401).json({
        success: false,
        error: 'no_role_assigned',
        message: 'User has no role assigned',
      });
    }

    prisma.api_tokens
      .update({
        where: { id: apiToken.id },
        data: {
          ip_address: req.ip || req.socket.remoteAddress || 'unknown',
          updated_date: new Date(),
        },
      })
      .catch(err => console.error('Error updating token usage:', err));

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.user_role.name,
      permissions: user.user_role.roles_permission
        .filter(rp => rp.is_active === 'Y' && rp.permission?.is_active === 'Y')
        .map(rp => rp.permission!.name),
      parent_id: user.parent_id,
      depot_id: user.depot_id,
      zone_id: user.zone_id,
    };

    req.token = token;
    req.apiToken = apiToken;

    next();
  } catch (error) {
    console.error('API Token Authentication Error:', error);
    return res.status(500).json({
      success: false,
      error: 'authentication_failed',
      message: 'Failed to authenticate API token',
    });
  }
};

/**
 * @function requirePermission
 * @description Middleware to require any of the specified module/action permissions
 * @description Dynamically builds permission names from module and action
 * @param {PermissionItem[]} permissions - Array of {module, action} objects
 * @returns {Function} Express middleware function
 */
export const requirePermission = (permissions: PermissionItem[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'authentication_required' });
    }

    if (isAdminRole(req.user.role)) {
      return next();
    }

    if (req.user.permissions.includes('*')) {
      return next();
    }

    const hasRequiredPermission = hasAnyModulePermissions(
      req.user.permissions,
      permissions
    );

    if (!hasRequiredPermission) {
      const requiredPermissions = permissions.map(p =>
        buildPermissionName(p.module, p.action)
      );

      const userFriendlyMessage = formatPermissionErrorMessage(permissions);
      return res.status(403).json({
        success: false,
        message: userFriendlyMessage,
        error: 'access_denied',
        required_permissions: requiredPermissions,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};

/**
 * @function requireAllPermission
 * @description Middleware to require all of the specified module/action permissions
 * @description Dynamically builds permission names from module and action
 * @param {PermissionItem[]} permissions - Array of {module, action} objects
 * @returns {Function} Express middleware function
 */
export const requireAllPermission = (
  permissions: PermissionItem[]
): Function => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'authentication_required' });
    }

    if (isAdminRole(req.user.role)) {
      return next();
    }

    if (req.user.permissions.includes('*')) {
      return next();
    }

    const hasAllRequired = hasAllModulePermissions(
      req.user.permissions,
      permissions
    );

    if (!hasAllRequired) {
      const requiredPermissions = permissions.map(p =>
        buildPermissionName(p.module, p.action)
      );

      const userFriendlyMessage = formatPermissionErrorMessage(permissions);
      return res.status(403).json({
        success: false,
        message: userFriendlyMessage,
        error: 'access_denied',
        required_permissions: requiredPermissions,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};
