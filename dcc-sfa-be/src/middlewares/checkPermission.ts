import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../v1/services/permissionService';
import {
  ACTION_LEVEL_REQUIREMENTS,
  createPermission,
} from '../configs/permissions.config';

export const checkPermission = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: No user found',
        });
      }

      const permissionName = createPermission(module, action);

      const hasPermission = await PermissionService.hasPermissionByName(
        currentUser.id,
        permissionName
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied: You don't have permission ${permissionName}`,
        });
      }

      const requiredLevel =
        ACTION_LEVEL_REQUIREMENTS[
          permissionName as keyof typeof ACTION_LEVEL_REQUIREMENTS
        ];

      if (requiredLevel) {
        const userLevel = await PermissionService.getUserRoleLevel(
          currentUser.id
        );

        if (userLevel < requiredLevel) {
          return res.status(403).json({
            success: false,
            message: `Access denied: This action requires level ${requiredLevel} or higher. Your level: ${userLevel}`,
            required_level: requiredLevel,
            current_level: userLevel,
          });
        }

        currentUser.roleLevel = userLevel;
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
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const userLevel = await PermissionService.getUserRoleLevel(
        currentUser.id
      );

      if (userLevel < minLevel) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Requires level ${minLevel}+. Your level: ${userLevel}`,
          required_level: minLevel,
          current_level: userLevel,
        });
      }

      currentUser.roleLevel = userLevel;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking role level',
      });
    }
  };
};

export const checkHierarchyAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = req.user;
    const targetUserId = parseInt(req.params.id || req.params.userId);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!targetUserId) {
      return next();
    }
    if (currentUser.id === targetUserId) {
      return next();
    }

    const currentUserLevel = await PermissionService.getUserRoleLevel(
      currentUser.id
    );
    const targetUserLevel =
      await PermissionService.getUserRoleLevel(targetUserId);

    if (currentUserLevel <= targetUserLevel) {
      return res.status(403).json({
        success: false,
        message: 'Cannot manage users at same or higher level',
        your_level: currentUserLevel,
        target_level: targetUserLevel,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking hierarchy access',
    });
  }
};

export const checkDataAccess = (scopeType: 'self' | 'team' | 'all') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const dataScope = await PermissionService.getDataAccessScope(
        currentUser.id
      );

      const scopeHierarchy = {
        global: ['self', 'team', 'supervised', 'regional', 'global'],
        regional: ['self', 'team', 'supervised', 'regional'],
        team: ['self', 'team'],
        supervised: ['self', 'supervised'],
        self: ['self'],
      };

      const userScopeAccess = scopeHierarchy[
        dataScope.scope as keyof typeof scopeHierarchy
      ] || ['self'];

      if (!userScopeAccess.includes(scopeType)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Your data access scope (${dataScope.scope}) doesn't allow ${scopeType} access`,
          your_scope: dataScope.scope,
          required_scope: scopeType,
        });
      }

      currentUser.dataScope = dataScope;
      next();
    } catch (error) {
      console.error('Data access check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking data access',
      });
    }
  };
};

export const authorize = (
  module: string,
  action: string,
  minLevel?: number
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: No user found',
        });
      }

      const permissionName = createPermission(module, action);

      const hasPermission = await PermissionService.hasPermissionByName(
        currentUser.id,
        permissionName
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Missing permission ${permissionName}`,
        });
      }

      const requiredLevel =
        minLevel ||
        ACTION_LEVEL_REQUIREMENTS[
          permissionName as keyof typeof ACTION_LEVEL_REQUIREMENTS
        ];

      if (requiredLevel) {
        const userLevel = await PermissionService.getUserRoleLevel(
          currentUser.id
        );

        if (userLevel < requiredLevel) {
          return res.status(403).json({
            success: false,
            message: `Access denied: Requires level ${requiredLevel}+`,
            required_level: requiredLevel,
            current_level: userLevel,
          });
        }

        currentUser.roleLevel = userLevel;
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
      });
    }
  };
};
