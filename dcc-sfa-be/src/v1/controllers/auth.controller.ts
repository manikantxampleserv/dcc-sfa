import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../configs/jwt.config';

const prisma = new PrismaClient();

const generateTokens = (user: any) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.user_role?.name || user.role,
    parent_id: user.parent_id,
    depot_id: user.depot_id,
    zone_id: user.zone_id,
  };

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  const refreshToken = jwt.sign({ id: user.id }, jwtConfig.secret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

export const register = async (req: any, res: any) => {
  try {
    const { email, password, name, role_id, parent_id } = req.body;

    const existing = await prisma.users.findFirst({ where: { email } });
    if (existing) {
      return res.error('Email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        name,
        role_id: role_id || 1,
        parent_id: parent_id ?? null,
        createdby: 0,
        createdate: new Date(),
        is_active: 'Y',
      },
      include: {
        user_role: true,
      },
    });

    return res.success(
      'User registered successfully',
      {
        id: user.id,
        email: user.email,
        role: user.user_role?.name,
        name: user.name,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return res.error('Registration failed', 500);
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findFirst({
      where: { email, is_active: 'Y' },
      include: {
        user_role: true,
      },
    });

    if (!user) return res.error('User not found', 404);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.error('Invalid credentials', 401);

    const { accessToken, refreshToken } = generateTokens(user);

    await prisma.api_tokens.create({
      data: {
        user_id: user.id,
        token: accessToken,
        token_type: 'Bearer',
        issued_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        is_active: 'Y',
        created_by: user.id,
        created_date: new Date(),
      },
    });

    return res.success('Login successful', {
      user: {
        id: user.id,
        email: user.email,
        role: user.user_role.name,
        name: user.name,
      },
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: jwtConfig.expiresIn,
    });
  } catch (error) {
    console.error(error);
    return res.error('Login failed', 500);
  }
};

export const logout = async (req: any, res: any) => {
  try {
    if (!req.token || !req.user) {
      return res.error('No active session', 400);
    }

    await prisma.api_tokens.updateMany({
      where: {
        token: req.token,
        user_id: req.user.id,
      },
      data: {
        is_revoked: true,
        // is_active: 'N',
        updated_date: new Date(),
        updated_by: req.user.id,
      },
    });

    return res.success('Logged out successfully');
  } catch (error) {
    console.error(error);
    return res.error('Logout failed', 500);
  }
};

export const refresh = async (req: any, res: any) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.error('Refresh token required', 400);

    const decoded = jwt.verify(refreshToken, jwtConfig.secret) as {
      id: number;
    };

    const user = await prisma.users.findUnique({
      where: { id: decoded.id, is_active: 'Y' },
      include: {
        user_role: true,
      },
    });
    if (!user) return res.error('User not found', 404);

    const { accessToken } = generateTokens(user);

    await prisma.api_tokens.create({
      data: {
        user_id: user.id,
        token: accessToken,
        token_type: 'Bearer',
        issued_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        is_active: 'Y',
        created_by: user.id,
        created_date: new Date(),
      },
    });

    return res.success('Token refreshed', {
      accessToken,
      expiresIn: jwtConfig.expiresIn,
    });
  } catch (error) {
    console.error(error);
    return res.error('Invalid refresh token', 401);
  }
};
