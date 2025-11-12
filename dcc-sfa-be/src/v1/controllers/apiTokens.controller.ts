import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';

export const getApiTokens = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      isActive = '',
      isRevoked = '',
      userId = '',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { token: { contains: search as string } },
        { device_id: { contains: search as string } },
        { ip_address: { contains: search as string } },
      ];
    }

    if (isActive !== '') {
      if (isActive === 'true' || isActive === 'Y' || isActive === '1') {
        where.is_active = 'Y';
      } else if (isActive === 'false' || isActive === 'N' || isActive === '0') {
        where.is_active = 'N';
      }
    }

    if (isRevoked !== '') {
      where.is_revoked = isRevoked === 'true' || isRevoked === '1';
    }

    if (userId) {
      where.user_id = parseInt(userId as string);
    }

    const [tokens, totalCount] = await Promise.all([
      prisma.api_tokens.findMany({
        where,
        include: {
          users_api_tokens_user_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_date: 'desc',
        },
        skip: offset,
        take: limitNum,
      }),
      prisma.api_tokens.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    const stats = {
      total_tokens: await prisma.api_tokens.count(),
      active_tokens: await prisma.api_tokens.count({
        where: {
          is_active: 'Y',
          is_revoked: false,
          OR: [{ expires_at: null }, { expires_at: { gte: new Date() } }],
        },
      }),
      revoked_tokens: await prisma.api_tokens.count({
        where: { is_revoked: true },
      }),
      expired_tokens: await prisma.api_tokens.count({
        where: {
          expires_at: { lt: new Date() },
          is_revoked: false,
        },
      }),
    };

    res.status(200).json({
      success: true,
      message: 'API tokens retrieved successfully',
      data: tokens,
      meta: {
        current_page: pageNum,
        total_pages: totalPages,
        total_count: totalCount,
        has_next: pageNum < totalPages,
        has_previous: pageNum > 1,
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        requestDuration: Date.now() - (req as any).startTime,
        timestamp: new Date().toISOString(),
      },
      stats,
    });
  } catch (error) {
    console.error('Error fetching API tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch API tokens',
    });
  }
};

export const getApiTokenById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tokenId = parseInt(id);

    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token ID',
      });
    }

    const token = await prisma.api_tokens.findUnique({
      where: { id: tokenId },
      include: {
        users_api_tokens_user_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'API token not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'API token retrieved successfully',
      data: token,
    });
  } catch (error) {
    console.error('Error fetching API token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch API token',
    });
  }
};

export const revokeApiToken = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tokenId = parseInt(id);
    const userId = (req as any).user?.id;

    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token ID',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    const token = await prisma.api_tokens.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'API token not found',
      });
    }

    if (token.is_revoked) {
      return res.status(400).json({
        success: false,
        message: 'Token is already revoked',
      });
    }

    const updatedToken = await prisma.api_tokens.update({
      where: { id: tokenId },
      data: {
        is_revoked: true,
        updated_by: userId,
        updated_date: new Date(),
      },
      include: {
        users_api_tokens_user_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      message: 'API token revoked successfully',
      data: updatedToken,
    });
  } catch (error) {
    console.error('Error revoking API token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        error instanceof Error ? error.message : 'Failed to revoke API token',
    });
  }
};

export const activateApiToken = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tokenId = parseInt(id);
    const userId = (req as any).user?.id;

    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token ID',
      });
    }

    const token = await prisma.api_tokens.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'API token not found',
      });
    }

    if (token.is_active === 'Y') {
      return res.status(400).json({
        success: false,
        message: 'Token is already active',
      });
    }

    const updatedToken = await prisma.api_tokens.update({
      where: { id: tokenId },
      data: {
        is_active: 'Y',
        updated_by: userId,
        updated_date: new Date(),
      },
      include: {
        users_api_tokens_user_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'API token activated successfully',
      data: updatedToken,
    });
  } catch (error) {
    console.error('Error activating API token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to activate API token',
    });
  }
};

export const deactivateApiToken = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tokenId = parseInt(id);
    const userId = (req as any).user?.id;

    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token ID',
      });
    }
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    const token = await prisma.api_tokens.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'API token not found',
      });
    }

    if (token.is_active === 'N') {
      return res.status(400).json({
        success: false,
        message: 'Token is already inactive',
      });
    }

    const updatedToken = await prisma.api_tokens.update({
      where: { id: tokenId },
      data: {
        is_active: 'N',
        updated_by: userId,
        updated_date: new Date(),
      },
      include: {
        users_api_tokens_user_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'API token deactivated successfully',
      data: updatedToken,
    });
  } catch (error) {
    console.error('Error deactivating API token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to deactivate API token',
    });
  }
};

export const deleteApiToken = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tokenId = parseInt(id);

    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token ID',
      });
    }

    const token = await prisma.api_tokens.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'API token not found',
      });
    }

    await prisma.api_tokens.delete({
      where: { id: tokenId },
    });

    res.status(200).json({
      success: true,
      message: 'API token deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to delete API token',
    });
  }
};

export const revokeAllUserTokens = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user?.id;
    const targetUserId = parseInt(userId);

    if (isNaN(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    const result = await prisma.api_tokens.updateMany({
      where: {
        user_id: targetUserId,
        is_revoked: false,
      },
      data: {
        is_revoked: true,
        updated_by: currentUserId,
        updated_date: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: `${result.count} API tokens revoked successfully`,
      data: { revokedCount: result.count },
    });
  } catch (error) {
    console.error('Error revoking all user tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to revoke all user tokens',
    });
  }
};
