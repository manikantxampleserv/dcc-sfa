import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { jwtConfig } from '../configs/jwt.config';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
        parent_id: number;
        depot_id?: number | null;
        zone_id?: number | null;
      };
      token?: string;
    }
  }
}

interface JwtPayload {
  id: number;
  username: string;
  email: string;
  role: string;
  parent_id: number;
  depot_id?: number | null;
  zone_id?: number | null;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'] as string;
  }

  if (!token) {
    res.error('Access denied. No token provided.', 401);
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;

    prisma.api_tokens
      .findFirst({
        where: {
          token: token,
          user_id: decoded.id,
          is_active: 'Y',
          is_revoked: false,
          OR: [{ expires_at: null }, { expires_at: { gte: new Date() } }],
        },
      })
      .then(apiToken => {
        if (!apiToken) {
          res.error('Invalid or expired token.', 401);
          return;
        }

        return prisma.users.findUnique({
          where: {
            id: decoded.id,
            is_active: 'Y',
          },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            parent_id: true,
            depot_id: true,

            zone_id: true,
          },
        });
      })
      .then(user => {
        if (!user) {
          res.error('User not found or inactive.', 401);
          return;
        }

        req.user = user;
        req.token = token;

        prisma.users
          .update({
            where: { id: user.id },
            data: { last_login: new Date() },
          })
          .then(() => next())
          .catch(error => {
            console.error('Last login update error:', error);
            next();
          });
      })
      .catch(error => {
        console.error('Database error:', error);
        res.error('Authentication failed.', 500);
      });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.error('Token has expired.', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.error('Invalid token.', 401);
    } else {
      res.error('Token verification failed.', 500);
    }
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.error('Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.error('Access denied. Insufficient permissions.', 403);
      return;
    }

    next();
  };
};

export const authorizeCompany = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.error('Authentication required.', 401);
    return;
  }

  const companyId =
    req.params.companyId || req.body.parent_id || req.query.parent_id;

  if (!companyId) {
    next();
    return;
  }

  if (req.user.parent_id !== parseInt(companyId as string)) {
    res.error('Access denied. You can only access your company data.', 403);
    return;
  }

  next();
};

export const authorizeDepot = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.error('Authentication required.', 401);
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
    res.error('Access denied. You can only access your depot data.', 403);
    return;
  }

  next();
};

// Zone authorization
export const authorizeZone = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.error('Authentication required.', 401);
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
    res.error('Access denied. You can only access your zone data.', 403);
    return;
  }

  next();
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;

    prisma.users
      .findUnique({
        where: {
          id: decoded.id,
          is_active: 'Y',
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          parent_id: true,
          depot_id: true,
          zone_id: true,
        },
      })
      .then(user => {
        if (user) {
          req.user = user;
          req.token = token;
        }
        next();
      })
      .catch(() => next());
  } catch (error) {
    next();
  }
};

export const validateSession = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || !req.token) {
    next();
    return;
  }

  prisma.api_tokens
    .findFirst({
      where: {
        token: req.token,
        user_id: req.user.id,
        is_active: 'Y',
        is_revoked: false,
      },
    })
    .then(token => {
      if (!token) {
        res.error('Session expired. Please login again.', 401);
        return;
      }
      next();
    })
    .catch(error => {
      console.error('Session validation error:', error);
      next();
    });
};
