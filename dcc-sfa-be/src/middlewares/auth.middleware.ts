// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { PrismaClient, Prisma } from '@prisma/client';
// import { jwtConfig } from '../configs/jwt.config';
// import { createPermission, PERMISSIONS } from '../configs/permissions.config';

// const prisma = new PrismaClient();

// type PermissionItem = { module: string; action: string };

// const userWithRoleAndPermissions = Prisma.validator<Prisma.usersInclude>()({
//   user_role: {
//     include: {
//       roles_permission: {
//         include: {
//           permission: true,
//         },
//       },
//     },
//   },
// });

// // Express Request interface extensions are now in src/types/express.d.ts

// export const authenticateToken = async (req: any, res: any, next: any) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     res.status(401).json({ error: 'access_token_missing' });
//     return;
//   }

//   try {
//     const decoded = jwt.verify(token, jwtConfig.secret) as { id: number };

//     const user = await prisma.users.findUnique({
//       where: { id: decoded.id },
//       include: userWithRoleAndPermissions,
//     });

//     if (!user || !user.user_role) {
//       res.status(401).json({ error: 'user_not_found_or_inactive' });
//       return;
//     }

//     req.user = {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       role: user.user_role.name,
//       permissions: user.user_role.roles_permission
//         .filter(rp => rp.permission?.is_active === 'Y')
//         .map(rp => rp.permission!.name),
//       parent_id: user.parent_id,
//       depot_id: user.depot_id,
//       zone_id: user.zone_id,
//     };

//     req.token = token;
//     next();
//   } catch (err) {
//     console.error('JWT error:', err);
//     res.status(401).json({ error: 'invalid_or_expired_token' });
//   }
// };

// export const authorizeRoles = (...allowedRoles: string[]) => {
//   return (req: any, res: any, next: any) => {
//     if (!req.user || !allowedRoles.includes(req.user.role)) {
//       res.status(403).json({ error: 'access_denied' });
//       return;
//     }
//     next();
//   };
// };

// export const requirePermission = (...perms: string[]) => {
//   return (req: any, res: any, next: any) => {
//     if (!req.user) {
//       res.status(401).json({ error: 'authentication_required' });
//       return;
//     }
//     const allowed = perms.some(p => req.user!.permissions.includes(p));
//     if (!allowed) {
//       res.status(403).json({ error: 'access_denied', missing: perms });
//       return;
//     }
//     next();
//   };
// };

// export const authorizeCompany = (req: any, res: any, next: any) => {
//   if (!req.user) {
//     res.status(401).json({ error: 'authentication_required' });
//     return;
//   }

//   const companyId =
//     req.params.companyId || req.body.parent_id || req.query.parent_id;

//   if (!companyId) {
//     next();
//     return;
//   }

//   if (req.user.parent_id !== parseInt(companyId as string)) {
//     res
//       .status(403)
//       .json({ error: 'access_denied', message: 'Company mismatch' });
//     return;
//   }

//   next();
// };

// export const authorizeDepot = (req: any, res: any, next: any) => {
//   if (!req.user) {
//     res.status(401).json({ error: 'authentication_required' });
//     return;
//   }

//   const depotId = req.params.depotId || req.body.depot_id || req.query.depot_id;

//   if (!depotId || !req.user.depot_id) {
//     next();
//     return;
//   }

//   if (['admin', 'super_admin'].includes(req.user.role)) {
//     next();
//     return;
//   }

//   if (req.user.depot_id !== parseInt(depotId as string)) {
//     res.status(403).json({ error: 'access_denied', message: 'Depot mismatch' });
//     return;
//   }

//   next();
// };

// export const authorizeZone = (req: any, res: any, next: any) => {
//   if (!req.user) {
//     res.status(401).json({ error: 'authentication_required' });
//     return;
//   }

//   const zoneId = req.params.zoneId || req.body.zone_id || req.query.zone_id;

//   if (!zoneId || !req.user.zone_id) {
//     next();
//     return;
//   }

//   if (['admin', 'super_admin'].includes(req.user.role)) {
//     next();
//     return;
//   }

//   if (req.user.zone_id !== parseInt(zoneId as string)) {
//     res.status(403).json({ error: 'access_denied', message: 'Zone mismatch' });
//     return;
//   }

//   next();
// };

// export const optionalAuth = async (req: any, res: any, next: any) => {
//   let token: string | undefined;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (!token) {
//     next();
//     return;
//   }

//   try {
//     const decoded = jwt.verify(token, jwtConfig.secret) as { id: number };

//     const user = await prisma.users.findUnique({
//       where: {
//         id: decoded.id,
//         is_active: 'Y',
//       },
//       include: {
//         user_role: true,
//       },
//     });

//     if (user) {
//       req.user = {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: user.user_role.name,
//         permissions: [],
//         parent_id: user.parent_id,
//         depot_id: user.depot_id,
//         zone_id: user.zone_id,
//       };
//       req.token = token;
//     }
//     next();
//   } catch (error) {
//     next();
//   }
// };

// export const validateSession = (req: any, res: any, next: any) => {
//   if (!req.user || !req.token) {
//     next();
//     return;
//   }

//   prisma.api_tokens
//     .findFirst({
//       where: {
//         token: req.token,
//         user_id: req.user.id,
//         is_active: 'Y',
//         is_revoked: false,
//       },
//     })
//     .then((token: any) => {
//       if (!token) {
//         res
//           .status(401)
//           .json({ error: 'session_expired', message: 'Please login again' });
//         return;
//       }
//       next();
//     })
//     .catch((error: any) => {
//       console.error('Session validation error:', error);
//       next();
//     });
// };

// export const requireAnyModulePermission = (permissions: PermissionItem[]) => {
//   return (req: any, res: any, next: any) => {
//     if (!req.user) {
//       return res.status(401).json({ error: 'authentication_required' });
//     }

//     const requiredPermissions: string[] = permissions.map((p: PermissionItem) =>
//       createPermission(p.module, p.action)
//     );

//     const hasAnyPermission = requiredPermissions.some(perm =>
//       req.user!.permissions.includes(perm)
//     );

//     if (!hasAnyPermission) {
//       return res.status(403).json({
//         error: 'access_denied',
//         message: 'Insufficient permissions',
//         required_permissions: requiredPermissions,
//       });
//     }

//     next();
//   };
// };
// export const requireAllModulePermissions = (
//   permissions: Array<{ module: string; action: string }>
// ) => {
//   return (req: any, res: any, next: any) => {
//     if (!req.user) {
//       res.status(401).json({ error: 'authentication_required' });
//       return;
//     }

//     const requiredPermissions = permissions.map(p =>
//       createPermission(p.module, p.action)
//     );
//     const hasAllPermissions = requiredPermissions.every(perm =>
//       req.user!.permissions.includes(perm)
//     );

//     if (!hasAllPermissions) {
//       res.status(403).json({
//         error: 'access_denied',
//         message: 'Insufficient permissions',
//         required_permissions: requiredPermissions,
//       });
//       return;
//     }

//     next();
//   };
// };

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma } from '@prisma/client';
import { jwtConfig } from '../configs/jwt.config';
import { createPermission, PERMISSIONS } from '../configs/permissions.config';

const prisma = new PrismaClient();

type PermissionItem = { module: string; action: string };

const userWithRoleAndPermissions = Prisma.validator<Prisma.usersInclude>()({
  user_role: {
    include: {
      roles_permission: {
        include: {
          permission: true,
        },
      },
    },
  },
});

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
        .filter(rp => rp.permission?.is_active === 'Y')
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
        .filter(rp => rp.permission?.is_active === 'Y')
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

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'access_denied' });
      return;
    }
    next();
  };
};

export const requirePermission = (...perms: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      res.status(401).json({ error: 'authentication_required' });
      return;
    }
    const allowed = perms.some(p => req.user!.permissions.includes(p));
    if (!allowed) {
      res.status(403).json({ error: 'access_denied', missing: perms });
      return;
    }
    next();
  };
};

export const authorizeCompany = (req: any, res: any, next: any) => {
  if (!req.user) {
    res.status(401).json({ error: 'authentication_required' });
    return;
  }

  const companyId =
    req.params.companyId || req.body.parent_id || req.query.parent_id;

  if (!companyId) {
    next();
    return;
  }

  if (req.user.parent_id !== parseInt(companyId as string)) {
    res
      .status(403)
      .json({ error: 'access_denied', message: 'Company mismatch' });
    return;
  }

  next();
};

export const authorizeDepot = (req: any, res: any, next: any) => {
  if (!req.user) {
    res.status(401).json({ error: 'authentication_required' });
    return;
  }

  const depotId = req.params.depotId || req.body.depot_id || req.query.depot_id;

  if (!depotId || !req.user.depot_id) {
    next();
    return;
  }

  if (['admin', 'super_admin'].includes(req.user.role)) {
    next();
    return;
  }

  if (req.user.depot_id !== parseInt(depotId as string)) {
    res.status(403).json({ error: 'access_denied', message: 'Depot mismatch' });
    return;
  }

  next();
};

export const authorizeZone = (req: any, res: any, next: any) => {
  if (!req.user) {
    res.status(401).json({ error: 'authentication_required' });
    return;
  }

  const zoneId = req.params.zoneId || req.body.zone_id || req.query.zone_id;

  if (!zoneId || !req.user.zone_id) {
    next();
    return;
  }

  if (['admin', 'super_admin'].includes(req.user.role)) {
    next();
    return;
  }

  if (req.user.zone_id !== parseInt(zoneId as string)) {
    res.status(403).json({ error: 'access_denied', message: 'Zone mismatch' });
    return;
  }

  next();
};

export const optionalAuth = async (req: any, res: any, next: any) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as { id: number };

    const user = await prisma.users.findUnique({
      where: {
        id: decoded.id,
        is_active: 'Y',
      },
      include: {
        user_role: true,
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.user_role.name,
        permissions: [],
        parent_id: user.parent_id,
        depot_id: user.depot_id,
        zone_id: user.zone_id,
      };
      req.token = token;
    }
    next();
  } catch (error) {
    next();
  }
};

export const validateSession = (req: any, res: any, next: any) => {
  next();
};

export const requireAnyModulePermission = (permissions: PermissionItem[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'authentication_required' });
    }

    const requiredPermissions: string[] = permissions.map((p: PermissionItem) =>
      createPermission(p.module, p.action)
    );

    const hasAnyPermission = requiredPermissions.some(perm =>
      req.user!.permissions.includes(perm)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({
        error: 'access_denied',
        message: 'Insufficient permissions',
        required_permissions: requiredPermissions,
      });
    }

    next();
  };
};

export const requireAllModulePermissions = (
  permissions: Array<{ module: string; action: string }>
) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      res.status(401).json({ error: 'authentication_required' });
      return;
    }

    const requiredPermissions = permissions.map(p =>
      createPermission(p.module, p.action)
    );
    const hasAllPermissions = requiredPermissions.every(perm =>
      req.user!.permissions.includes(perm)
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        error: 'access_denied',
        message: 'Insufficient permissions',
        required_permissions: requiredPermissions,
      });
      return;
    }

    next();
  };
};
