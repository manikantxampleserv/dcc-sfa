import prisma from '../../configs/prisma.client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

interface CustomerCategoryConditionInput {
  id?: number;
  condition_type: string;
  condition_operator: string;
  threshold_value: number;
  product_category_id?: number | null;
  condition_description?: string | null;
  is_active?: string;
}

interface CustomerCategoryInput {
  id?: number;
  category_name: string;
  category_code: string;
  is_active?: string;
  createdby?: number;
  updatedby?: number;
  conditions?: CustomerCategoryConditionInput[];
}

const serializeCustomerCategory = (category: any) => ({
  id: category.id,
  category_name: category.category_name,
  category_code: category.category_code,
  is_active: category.is_active,
  createdate: category.createdate,
  createdby: category.createdby,
  updatedate: category.updatedate,
  updatedby: category.updatedby,
  log_inst: category.log_inst,
  conditions:
    category.customer_category_condition_customer_category?.map((c: any) => ({
      id: c.id,
      condition_type: c.condition_type,
      condition_operator: c.condition_operator,
      threshold_value: c.threshold_value,
      product_category_id: c.product_category_id,
      condition_description: c.condition_description,
      is_active: c.is_active,
    })) || [],
});

export const customerCategoryController = {
  async bulkCustomerCategory(req: Request, res: Response) {
    try {
      const input: CustomerCategoryInput[] = Array.isArray(req.body)
        ? req.body
        : [req.body];

      const results = {
        created: [] as any[],
        updated: [] as any[],
        failed: [] as any[],
      };

      for (const item of input) {
        try {
          const result = await prisma.$transaction(async tx => {
            let parent;

            if (item.id) {
              const exists = await tx.customer_category.findUnique({
                where: { id: item.id },
              });

              if (!exists)
                throw new Error(`Category with id ${item.id} not found`);

              parent = await tx.customer_category.update({
                where: { id: item.id },
                data: {
                  category_name: item.category_name,
                  category_code: item.category_code,
                  is_active: item.is_active || 'Y',
                  updatedby: req.user?.id || item.updatedby || 1,
                  updatedate: new Date(),
                },
              });
            } else {
              parent = await tx.customer_category.create({
                data: {
                  category_name: item.category_name,
                  category_code: item.category_code,
                  is_active: item.is_active || 'Y',
                  createdby: req.user?.id || item.createdby || 1,
                  createdate: new Date(),
                  log_inst: 1,
                },
              });
            }

            const parentId = parent.id;

            if (item.conditions && item.conditions.length > 0) {
              for (const cond of item.conditions) {
                const condData = {
                  condition_type: cond.condition_type,
                  condition_operator: cond.condition_operator,
                  threshold_value: cond.threshold_value,
                  product_category_id: cond.product_category_id,
                  condition_description: cond.condition_description,
                  is_active: cond.is_active || 'Y',
                };

                if (cond.id) {
                  await tx.customer_category_condition.update({
                    where: { id: cond.id },
                    data: {
                      ...condData,
                    },
                  });
                } else {
                  await tx.customer_category_condition.create({
                    data: {
                      ...condData,
                      customer_category_id: parentId,
                    },
                  });
                }
              }
            }

            const completeRecord = await tx.customer_category.findUnique({
              where: { id: parentId },
              include: {
                customer_category_condition_customer_category: true,
              },
            });

            return completeRecord;
          });

          if (item.id) results.updated.push(serializeCustomerCategory(result));
          else results.created.push(serializeCustomerCategory(result));
        } catch (error: any) {
          results.failed.push({
            item,
            error: error.message,
          });
        }
      }

      return res.status(200).json({
        message: 'Bulk upsert completed',
        results,
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  },
  async getAllCustomerCategory(req: any, res: any) {
    try {
      const { page, limit, search, is_active } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { category_name: { contains: searchLower } },
            { category_code: { contains: searchLower } },
          ],
        }),
        ...(is_active && { is_active: is_active as string }),
      };

      const { data, pagination } = await paginate({
        model: prisma.customer_category,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          customer_category_condition_customer_category: true,
        },
      });

      const totalCategories = await prisma.customer_category.count({
        where: filters,
      });
      const activeCategories = await prisma.customer_category.count({
        where: { ...filters, is_active: 'Y' },
      });
      const inactiveCategories = await prisma.customer_category.count({
        where: { ...filters, is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newCategoriesThisMonth = await prisma.customer_category.count({
        where: {
          ...filters,
          createdate: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      res.success(
        'Customer categories retrieved successfully',
        data.map(serializeCustomerCategory),
        200,
        pagination,
        {
          total_categories: totalCategories,
          active_categories: activeCategories,
          inactive_categories: inactiveCategories,
          new_categories_this_month: newCategoriesThisMonth,
        }
      );
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getCustomerCategoryById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const data = await prisma.customer_category.findUnique({
        where: { id },
        include: {
          customer_category_condition_customer_category: true,
        },
      });

      if (!data) {
        return res.status(404).json({
          message: `Customer category ${id} not found`,
        });
      }

      return res.status(200).json({
        message: 'Customer category retrieved',
        data: serializeCustomerCategory(data),
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  },

  async deleteCustomerCategory(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const exists = await prisma.customer_category.findUnique({
        where: { id },
      });

      if (!exists)
        return res.status(404).json({ message: 'Category not found' });

      await prisma.customer_category.delete({
        where: { id },
      });

      return res.status(200).json({
        message: 'Customer category deleted successfully',
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  },
};
