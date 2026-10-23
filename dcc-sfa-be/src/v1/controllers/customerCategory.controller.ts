import prisma from '../../configs/prisma.client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import customerCategoryAssignmentService from '../services/customerCategoryAssignment.service';

interface CustomerCategoryConditionInput {
  id?: number;
  condition_type: string;
  condition_operator: string;
  threshold_value: number;
  product_category_id?: number | null;
  min_threshold_value?: number | null;
  max_threshold_value?: number | null;
  condition_description?: string | null;
  is_active?: string;
}

interface CustomerCategoryInput {
  id?: number;
  category_name: string;
  category_code: string;
  level?: number;
  is_active?: string;
  logical_condition?: 'AND' | 'OR';
  createdby?: number;
  updatedby?: number;
  conditions?: CustomerCategoryConditionInput[];
}

const serializeCustomerCategory = (category: any) => ({
  id: category.id,
  category_name: category.category_name,
  category_code: category.category_code,
  level: category.level,
  logical_condition: category.logical_condition || 'AND',
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
      min_threshold_value: c.min_threshold_value,
      max_threshold_value: c.max_threshold_value,
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

      if (!Array.isArray(req.body)) {
        const singleResult = await prisma.$transaction(async tx => {
          const item = req.body as CustomerCategoryInput;

          const duplicateCategory = await tx.customer_category.findFirst({
            where: {
              category_name: item.category_name,
              ...(item.id && { id: { not: item.id } }),
            },
          });

          if (duplicateCategory) {
            throw new Error(
              `Category name '${item.category_name}' already exists`
            );
          }

          const duplicateLevel = await tx.customer_category.findFirst({
            where: {
              level: item.level,
              ...(item.id && { id: { not: item.id } }),
            },
          });

          if (duplicateLevel) {
            throw new Error(
              `Level '${item.level}' is already assigned to another category (ID: ${duplicateLevel.id})`
            );
          }

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
                level: item.level,
                logical_condition: item.logical_condition || 'AND',
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
                level: item.level || 1,
                logical_condition: item.logical_condition || 'AND',
                is_active: item.is_active || 'Y',
                createdby: req.user?.id || item.createdby || 1,
                createdate: new Date(),
                log_inst: 1,
              },
            });
          }

          const parentId = parent.id;

          if (item.id) {
            const existingConditions =
              await tx.customer_category_condition.findMany({
                where: { customer_category_id: parentId },
                select: { id: true },
              });

            const existingConditionIds = existingConditions.map(c => c.id);
            const inputConditionIds = (item.conditions || [])
              .filter(cond => cond.id)
              .map(cond => cond.id);

            const conditionsToDelete = existingConditionIds.filter(
              id => !inputConditionIds.includes(id)
            );

            if (conditionsToDelete.length > 0) {
              await tx.customer_category_condition.deleteMany({
                where: { id: { in: conditionsToDelete } },
              });
            }
          }

          if (item.conditions && item.conditions.length > 0) {
            for (const cond of item.conditions) {
              const condData = {
                condition_type: cond.condition_type,
                condition_operator: cond.condition_operator,
                threshold_value: cond.threshold_value ?? 0,
                min_threshold_value:
                  cond.min_threshold_value !== undefined
                    ? cond.min_threshold_value
                    : null,
                max_threshold_value:
                  cond.max_threshold_value !== undefined
                    ? cond.max_threshold_value
                    : null,
                product_category_id: cond.product_category_id || null,
                condition_description: cond.condition_description || null,
                is_active: cond.is_active || 'Y',
              };

              if (cond.id) {
                await tx.customer_category_condition.update({
                  where: { id: cond.id },
                  data: condData,
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
          } else if (item.id) {
            await tx.customer_category_condition.deleteMany({
              where: { customer_category_id: parentId },
            });
          }

          const completeRecord = await tx.customer_category.findUnique({
            where: { id: parentId },
            include: {
              customer_category_condition_customer_category: true,
            },
          });

          return completeRecord;
        });

        return res.status(200).json({
          message: 'Customer category processed successfully',
          data: serializeCustomerCategory(singleResult),
          action: req.body.id ? 'updated' : 'created',
        });
      }

      const results = {
        created: [] as any[],
        updated: [] as any[],
        failed: [] as any[],
      };

      for (const item of input) {
        try {
          const result = await prisma.$transaction(async tx => {
            const duplicateCategory = await tx.customer_category.findFirst({
              where: {
                category_name: item.category_name,
                ...(item.id && { id: { not: item.id } }),
              },
            });

            if (duplicateCategory) {
              throw new Error(
                `Category name '${item.category_name}' already exists`
              );
            }

            const duplicateLevel = await tx.customer_category.findFirst({
              where: {
                level: item.level,
                ...(item.id && { id: { not: item.id } }),
              },
            });

            if (duplicateLevel) {
              throw new Error(
                `Level '${item.level}' is already assigned to another category (ID: ${duplicateLevel.id})`
              );
            }

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
                  level: item.level,
                  logical_condition: item.logical_condition || 'AND',
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
                  level: item.level || 1,
                  logical_condition: item.logical_condition || 'AND',
                  is_active: item.is_active || 'Y',
                  createdby: req.user?.id || item.createdby || 1,
                  createdate: new Date(),
                  log_inst: 1,
                },
              });
            }

            const parentId = parent.id;

            if (item.id) {
              const existingConditions =
                await tx.customer_category_condition.findMany({
                  where: { customer_category_id: parentId },
                  select: { id: true },
                });

              const existingConditionIds = existingConditions.map(c => c.id);
              const inputConditionIds = (item.conditions || [])
                .filter(cond => cond.id)
                .map(cond => cond.id);

              const conditionsToDelete = existingConditionIds.filter(
                id => !inputConditionIds.includes(id)
              );

              if (conditionsToDelete.length > 0) {
                await tx.customer_category_condition.deleteMany({
                  where: { id: { in: conditionsToDelete } },
                });
              }
            }

            if (item.conditions && item.conditions.length > 0) {
              for (const cond of item.conditions) {
                const condData = {
                  condition_type: cond.condition_type,
                  condition_operator: cond.condition_operator,
                  threshold_value: cond.threshold_value ?? 0,
                  min_threshold_value:
                    cond.min_threshold_value !== undefined
                      ? cond.min_threshold_value
                      : null,
                  max_threshold_value:
                    cond.max_threshold_value !== undefined
                      ? cond.max_threshold_value
                      : null,
                  product_category_id: cond.product_category_id || null,
                  condition_description: cond.condition_description || null,
                  is_active: cond.is_active || 'Y',
                };

                if (cond.id) {
                  await tx.customer_category_condition.update({
                    where: { id: cond.id },
                    data: condData,
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
            } else if (item.id) {
              await tx.customer_category_condition.deleteMany({
                where: { customer_category_id: parentId },
              });
            }

            const completeRecord = await tx.customer_category.findUnique({
              where: { id: parentId },
              include: {
                customer_category_condition_customer_category: true,
              },
            });

            return completeRecord;
          });

          if (item.id) {
            results.updated.push(serializeCustomerCategory(result));
          } else {
            results.created.push(serializeCustomerCategory(result));
          }
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
      return res.status(500).json({ success: false, message: e.message });
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
        orderBy: { level: 'asc' },
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

      // Check for foreign key constraints before deletion
      const [customersCount, conditionsCount, promotionCategoriesCount] =
        await Promise.all([
          prisma.customers.count({ where: { customer_category_id: id } }),
          prisma.customer_category_condition.count({
            where: { customer_category_id: id },
          }),
          prisma.promotion_customer_category.count({
            where: { customer_category_id: id },
          }),
        ]);

      const hasRelatedRecords =
        customersCount > 0 ||
        conditionsCount > 0 ||
        promotionCategoriesCount > 0;

      if (hasRelatedRecords) {
        const relatedRecords = [];
        if (customersCount > 0)
          relatedRecords.push(`${customersCount} customer(s)`);
        if (conditionsCount > 0)
          relatedRecords.push(`${conditionsCount} condition(s)`);
        if (promotionCategoriesCount > 0)
          relatedRecords.push(
            `${promotionCategoriesCount} promotion category reference(s)`
          );

        return res.status(400).json({
          message:
            'Cannot delete customer category. This category has related records.',
          details: {
            category: exists.category_name,
            relatedRecords,
            suggestion:
              'Please delete or reassign the related records first, or consider marking this category as inactive instead of deleting.',
          },
        });
      }

      await prisma.customer_category.delete({
        where: { id },
      });

      return res.status(200).json({
        message: 'Customer category deleted successfully',
      });
    } catch (e: any) {
      console.error('Delete Customer Category Error:', e);

      // Handle specific database errors
      if (e.code === 'P2003') {
        // Foreign key constraint violation
        return res.status(400).json({
          message:
            'Cannot delete customer category. This category has related records in other tables.',
          details: {
            error: 'Foreign key constraint violated',
            suggestion:
              'Please delete the related records first or mark the category as inactive.',
          },
        });
      }

      return res.status(500).json({ message: e.message });
    }
  },

  async assignCategoriesToCustomers(req: Request, res: Response) {
    try {
      const startTime = new Date();
      const results =
        await customerCategoryAssignmentService.assignCustomerCategories();
      const duration = (new Date().getTime() - startTime.getTime()) / 1000;

      return res.status(200).json({
        message: 'Customer category assignment completed successfully',
        duration: `${duration}s`,
        summary: {
          totalProcessed: results.totalProcessed,
          totalUpdated: results.totalUpdated,
          totalUnchanged: results.totalUnchanged,
          totalFailed: results.totalFailed,
        },
        details: results.details.filter(
          d => d.status === 'updated' || d.status === 'failed'
        ),
      });
    } catch (e: any) {
      console.error('Fatal error in category assignment:', e);
      return res.status(500).json({ message: e.message });
    }
  },

  async assignCategoryToSingleCustomer(req: Request, res: Response) {
    try {
      const customerId = Number(req.params.customerId);

      const customer = await prisma.customers.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const result =
        await customerCategoryAssignmentService.assignSingleCustomerCategory(
          customerId
        );

      return res.status(200).json({
        message: 'Customer category assigned successfully',
        data: {
          customerId,
          customerName: customer.name,
          totalSales: result.totalSales,
          orderCount: result.orderCount,
          previousCategory: customer.customer_category_id,
          assignedCategory: result.assignedCategory,
          assignedCategoryId: result.assignedCategoryId,
        },
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  },

  async getCategoryAssignmentStats(req: Request, res: Response) {
    try {
      const categories = await prisma.customer_category.findMany({
        where: {
          is_active: 'Y',
        },
        include: {
          customer_category_condition_customer_category: true,
        },
        orderBy: {
          level: 'asc',
        },
      });

      const totalCustomers = await prisma.customers.count({
        where: {
          is_active: 'Y',
        },
      });

      const customersWithoutCategory = await prisma.customers.count({
        where: {
          is_active: 'Y',
          customer_category_id: null,
        },
      });

      const stats = await Promise.all(
        categories.map(async cat => {
          const customerCount = await prisma.customers.count({
            where: {
              customer_category_id: cat.id,
              is_active: 'Y',
            },
          });

          return {
            id: cat.id,
            categoryName: cat.category_name,
            categoryCode: cat.category_code,
            level: cat.level,
            threshold:
              cat.customer_category_condition_customer_category[0]
                ?.threshold_value || 0,
            customerCount,
          };
        })
      );

      return res.status(200).json({
        message: 'Category assignment statistics retrieved',
        data: {
          totalCustomers,
          customersWithoutCategory,
          customersWithCategory: totalCustomers - customersWithoutCategory,
          categoryStats: stats,
        },
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  },
};
