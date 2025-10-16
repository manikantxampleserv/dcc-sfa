// middleware/checkPermission.ts
import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../v1/services/permissionService';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to check if user has specific permission
 */
export const checkPermission = (module: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: No user found',
        });
      }

      const hasPermission = await PermissionService.hasPermission(
        req.user.id,
        module,
        action
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Insufficient permissions',
          required: { module, action },
        });
      }

      // Optionally, attach user permissions to request for later use
      if (!req.user.permissions) {
        const userPerms = await PermissionService.getUserPermissions(
          req.user.id
        );
        if (userPerms) {
          req.user.permissions = userPerms.permissions;
          req.user.roleLevel = userPerms.roleLevel;
        }
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
      });
    }
  };
};

export const requireMinLevel = (minLevel: number) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const dataScope = await PermissionService.getDataAccessScope(req.user.id);

      if (dataScope.level < minLevel) {
        return res.status(403).json({
          success: false,
          message: `This action requires level ${minLevel} or higher`,
          currentLevel: dataScope.level,
        });
      }

      req.user.dataScope = dataScope;
      next();
    } catch (error) {
      console.error('Level check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking role level',
      });
    }
  };
};

export const checkHierarchyAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const targetUserId = parseInt(req.params.userId || req.params.id);

    if (!targetUserId) {
      return next();
    }

    const userScope = await PermissionService.getDataAccessScope(req.user.id);
    const targetUserScope =
      await PermissionService.getDataAccessScope(targetUserId);

    const canAccess = await PermissionService.canAccessHierarchy(
      userScope.level,
      targetUserScope.level
    );

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Cannot manage users at same or higher level',
      });
    }

    next();
  } catch (error) {
    console.error('Hierarchy check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking hierarchy access',
    });
  }
};
