import prisma from '../../configs/prisma.client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

export const customerCategoryGradingController = {
  async getPendingGradingRequests(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, change_type } = req.query;

      const whereClause: any = {
        status: 'P',
        ...(change_type && { change_type: change_type as string }),
      };

      const { data, pagination } = await paginate({
        model: prisma.customer_category_grading,
        filters: whereClause,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        orderBy: { createdate: 'desc' },
        include: {
          category_grading_customers: {
            select: { id: true, name: true, code: true },
          },
          approver_users: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return res.status(200).json({
        message: 'Pending grading requests retrieved',
        data,
        pagination,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getGradingRequestById(req: Request, res: Response) {
    try {
      const requestId = Number(req.params.id);

      const request = await prisma.customer_category_grading.findUnique({
        where: { id: requestId },
        include: {
          category_grading_customers: {
            select: {
              id: true,
              name: true,
              code: true,
              customer_category_id: true,
            },
          },
          approver_users: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!request) {
        return res.status(404).json({ message: 'Grading request not found' });
      }

      const orderSales = await prisma.orders.aggregate({
        where: {
          parent_id: request.customer_id,
          status: { in: ['approved', 'pending', 'confirmed'] },
          is_active: 'Y',
        },
        _sum: { total_amount: true },
      });

      const totalSales = Number(orderSales._sum?.total_amount || 0);

      return res.status(200).json({
        message: 'Grading request retrieved',
        data: {
          ...request,
          total_sales: totalSales,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async processGradingRequest(req: Request, res: Response) {
    try {
      const requestId = Number(req.params.id);
      const { action, notes } = req.body;

      const gradingRequest = await prisma.customer_category_grading.findUnique({
        where: { id: requestId },
      });

      if (!gradingRequest) {
        return res.status(404).json({ message: 'Grading request not found' });
      }

      if (gradingRequest.action_taken !== 'N') {
        return res.status(400).json({
          message: `Request already ${gradingRequest.action_taken === 'A' ? 'approved' : 'rejected'}`,
        });
      }

      await prisma.$transaction(async tx => {
        await tx.customer_category_grading.update({
          where: { id: requestId },
          data: {
            action_taken: action === 'approve' ? 'A' : 'R',
            status: action === 'approve' ? 'C' : 'R',
            approver_id: req.user?.id,
            approved_date: new Date(),
            updatedby: req.user?.id,
            updatedate: new Date(),
          },
        });

        if (action === 'approve') {
          await tx.customers.update({
            where: { id: gradingRequest.customer_id },
            data: {
              customer_category_id: gradingRequest.upcoming_category_id,
              updatedate: new Date(),
              updatedby: req.user?.id,
            },
          });
        }
      });

      return res.status(200).json({
        message: `Grading request ${action}d successfully`,
        action,
        requestId,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async bulkProcessGradingRequests(req: Request, res: Response) {
    try {
      const { requestIds, action, notes } = req.body;

      const results = {
        processed: 0,
        approved: 0,
        rejected: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const requestId of requestIds) {
        try {
          await processSingleGradingRequest(
            requestId,
            action,
            notes,
            req.user?.id || 1
          );
          results.processed++;
          if (action === 'approve') results.approved++;
          else if (action === 'reject') results.rejected++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Request ${requestId}: ${error.message}`);
        }
      }

      return res.status(200).json({
        message: `Bulk ${action} completed`,
        results,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getGradingStats(req: Request, res: Response) {
    try {
      const stats = await Promise.all([
        prisma.customer_category_grading.count({
          where: { status: 'P' },
        }),

        prisma.customer_category_grading.count({
          where: { status: 'C' },
        }),
        prisma.customer_category_grading.count({
          where: { status: 'R' },
        }),

        prisma.customer_category_grading.count({
          where: { change_type: 'upgrade', status: 'P' },
        }),
        prisma.customer_category_grading.count({
          where: { change_type: 'downgrade', status: 'P' },
        }),

        prisma.customer_category_grading.count({
          where: { change_type: 'upgrade', status: 'C' },
        }),
        prisma.customer_category_grading.count({
          where: { change_type: 'downgrade', status: 'C' },
        }),

        prisma.customer_category_grading.count({
          where: { change_type: 'upgrade', status: 'R' },
        }),
        prisma.customer_category_grading.count({
          where: { change_type: 'downgrade', status: 'R' },
        }),

        prisma.customers.count({
          where: {
            is_active: 'Y',
            customer_category_id: { not: null },
          },
        }),

        prisma.customers.groupBy({
          by: ['customer_category_id'],
          where: {
            is_active: 'Y',
            customer_category_id: { not: null },
          },
          _count: {
            id: true,
          },
        }),

        prisma.customer_category.findMany({
          where: { is_active: 'Y' },
          select: { id: true, category_name: true },
          orderBy: { level: 'asc' },
        }),
      ]);

      const allCategories = stats[11];

      const categoryCountMap = stats[10].reduce(
        (acc: Record<number, number>, cat: any) => {
          acc[cat.customer_category_id] = cat._count.id;
          return acc;
        },
        {} as Record<number, number>
      );

      const categoryDistribution = allCategories.map(category => ({
        categoryId: category.id,
        categoryName: category.category_name,
        customerCount: categoryCountMap[category.id] || 0,
      }));

      return res.status(200).json({
        message: 'Grading statistics retrieved',
        data: {
          pending: stats[0],
          changed: stats[1],
          retained: stats[2],

          pending_upgrades: stats[3],
          pending_downgrades: stats[4],

          total_upgrades: stats[5],
          total_downgrades: stats[6],
          rejected_upgrades: stats[7],
          rejected_downgrades: stats[8],

          total_customers_with_categories: stats[9],
          category_distribution: categoryDistribution,
          all_categories: allCategories,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },
};

async function processSingleGradingRequest(
  requestId: number,
  action: string,
  notes: string,
  userId: number
) {
  const gradingRequest = await prisma.customer_category_grading.findUnique({
    where: { id: requestId },
  });

  if (!gradingRequest) {
    throw new Error('Grading request not found');
  }

  if (gradingRequest.action_taken !== 'N') {
    throw new Error('Request already processed');
  }

  await prisma.$transaction(async tx => {
    await tx.customer_category_grading.update({
      where: { id: requestId },
      data: {
        action_taken: action === 'approve' ? 'A' : 'R',
        status: action === 'approve' ? 'C' : 'R',
        approver_id: userId,
        approved_date: new Date(),
        updatedby: userId,
        updatedate: new Date(),
      },
    });

    if (action === 'approve') {
      await tx.customers.update({
        where: { id: gradingRequest.customer_id },
        data: {
          customer_category_id: gradingRequest.upcoming_category_id,
          updatedate: new Date(),
          updatedby: userId,
        },
      });
    }
  });
}
