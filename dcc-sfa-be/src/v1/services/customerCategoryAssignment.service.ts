import prisma from '../../configs/prisma.client';

export interface CategoryCondition {
  id: number;
  condition_type: string;
  condition_operator: string;
  threshold_value: number;
  min_threshold_value?: number | null;
  max_threshold_value?: number | null;
  product_category_id?: number | null;
}

export interface CategoryLevel {
  id: number;
  categoryName: string;
  level: number;
  logical_condition: string;
  conditions: CategoryCondition[];
}

export interface CustomerMetrics {
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  categorySales?: Map<number, number>;
}

export function evaluateConditionRule(
  actualValue: number,
  condition: CategoryCondition
): boolean {
  const min =
    condition.min_threshold_value !== null &&
    condition.min_threshold_value !== undefined
      ? Number(condition.min_threshold_value)
      : null;
  const max =
    condition.max_threshold_value !== null &&
    condition.max_threshold_value !== undefined
      ? Number(condition.max_threshold_value)
      : null;
  const op = (condition.condition_operator || '>=').toUpperCase().trim();

  if (op === 'BETWEEN' || op === 'RANGE' || min !== null || max !== null) {
    if (min !== null && max !== null) {
      return actualValue >= min && actualValue <= max;
    }
    if (min !== null) {
      return actualValue >= min;
    }
    if (max !== null) {
      return actualValue <= max;
    }
  }

  const single =
    condition.threshold_value !== null &&
    condition.threshold_value !== undefined
      ? Number(condition.threshold_value)
      : 0;

  switch (condition.condition_operator) {
    case '>=':
      return actualValue >= single;
    case '<=':
      return actualValue <= single;
    case '>':
      return actualValue > single;
    case '<':
      return actualValue < single;
    case '=':
    case '==':
      return actualValue === single;
    case '!=':
      return actualValue !== single;
    default:
      return actualValue >= single;
  }
}

export function matchesCategory(
  category: CategoryLevel,
  metrics: CustomerMetrics
): boolean {
  if (!category.conditions || category.conditions.length === 0) {
    return false;
  }

  const logicalOp = (category.logical_condition || 'AND').toUpperCase().trim();

  const results = category.conditions.map(cond => {
    let actualValue = metrics.totalSales;
    const type = (cond.condition_type || '').toLowerCase();

    if (cond.product_category_id && metrics.categorySales) {
      actualValue = metrics.categorySales.get(cond.product_category_id) || 0;
    } else if (
      type.includes('order') ||
      type.includes('frequency') ||
      type.includes('count')
    ) {
      actualValue = metrics.orderCount;
    } else if (type.includes('average') || type.includes('aov')) {
      actualValue = metrics.averageOrderValue;
    } else {
      actualValue = metrics.totalSales;
    }

    return evaluateConditionRule(actualValue, cond);
  });

  if (logicalOp === 'OR') {
    return results.some(r => r === true);
  } else {
    // Default is AND: all condition types must be true
    return results.every(r => r === true);
  }
}

export class CustomerCategoryAssignmentService {
  async calculateCustomerMetrics(customerId: number): Promise<CustomerMetrics> {
    const orderSales = await prisma.orders.aggregate({
      where: {
        parent_id: customerId,
        approval_status: {
          in: ['approved', 'pending'],
        },
        is_active: 'Y',
      },
      _sum: {
        total_amount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalSales = Number(orderSales._sum.total_amount || 0);
    const orderCount = Number(orderSales._count.id || 0);
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    return {
      totalSales,
      orderCount,
      averageOrderValue,
    };
  }

  async getCategoryLevels(): Promise<CategoryLevel[]> {
    const categories = await prisma.customer_category.findMany({
      where: {
        is_active: 'Y',
      },
      include: {
        customer_category_condition_customer_category: {
          where: {
            is_active: 'Y',
          },
        },
      },
      orderBy: {
        level: 'desc',
      },
    });

    return categories
      .filter(
        cat => cat.customer_category_condition_customer_category.length > 0
      )
      .map(cat => ({
        id: cat.id,
        categoryName: cat.category_name,
        level: cat.level || 1,
        logical_condition: cat.logical_condition || 'AND',
        conditions: cat.customer_category_condition_customer_category.map(
          c => ({
            id: c.id,
            condition_type: c.condition_type,
            condition_operator: c.condition_operator,
            threshold_value: Number(c.threshold_value || 0),
            min_threshold_value:
              c.min_threshold_value !== null
                ? Number(c.min_threshold_value)
                : null,
            max_threshold_value:
              c.max_threshold_value !== null
                ? Number(c.max_threshold_value)
                : null,
            product_category_id: c.product_category_id,
          })
        ),
      }));
  }

  determineCategory(
    metrics: CustomerMetrics,
    categoryLevels: CategoryLevel[]
  ): CategoryLevel | null {
    for (const category of categoryLevels) {
      if (matchesCategory(category, metrics)) {
        return category;
      }
    }
    return null;
  }

  async assignCustomerCategories(): Promise<{
    totalProcessed: number;
    totalUpdated: number;
    totalUnchanged: number;
    totalFailed: number;
    details: any[];
  }> {
    const startTime = new Date();
    console.log(
      `[${startTime.toISOString()}] Starting customer category assignment...`
    );

    const results = {
      totalProcessed: 0,
      totalUpdated: 0,
      totalUnchanged: 0,
      totalFailed: 0,
      details: [] as any[],
    };

    try {
      const categoryLevels = await this.getCategoryLevels();

      if (categoryLevels.length === 0) {
        console.warn('No active customer categories found with conditions');
        return results;
      }

      console.log(
        `Found ${categoryLevels.length} category levels:`,
        categoryLevels.map(c => ({
          name: c.categoryName,
          level: c.level,
          logical_condition: c.logical_condition,
          conditionsCount: c.conditions.length,
        }))
      );

      const customers = await prisma.customers.findMany({
        where: {
          is_active: 'Y',
        },
        select: {
          id: true,
          name: true,
          customer_category_id: true,
        },
      });

      console.log(`Processing ${customers.length} customers...`);

      for (const customer of customers) {
        results.totalProcessed++;
        try {
          const metrics = await this.calculateCustomerMetrics(customer.id);
          const assignedCategory = this.determineCategory(
            metrics,
            categoryLevels
          );

          const newCategoryId = assignedCategory?.id || null;
          const currentCategoryId = customer.customer_category_id;

          if (newCategoryId !== currentCategoryId) {
            await prisma.customers.update({
              where: { id: customer.id },
              data: {
                customer_category_id: newCategoryId,
                updatedate: new Date(),
                updatedby: 1,
              },
            });

            results.totalUpdated++;
            results.details.push({
              customerId: customer.id,
              customerName: customer.name,
              totalSales: metrics.totalSales,
              orderCount: metrics.orderCount,
              previousCategory: currentCategoryId,
              newCategory: newCategoryId,
              newCategoryName: assignedCategory?.categoryName || 'None',
              status: 'updated',
            });

            console.log(
              ` Customer ${customer.name} (ID: ${customer.id}) - Sales: ${metrics.totalSales}, Orders: ${metrics.orderCount} - Category: ${assignedCategory?.categoryName || 'None'}`
            );
          } else {
            results.totalUnchanged++;
          }
        } catch (error: any) {
          results.totalFailed++;
          console.error(
            ` Failed to process customer ${customer.id}:`,
            error.message
          );
          results.details.push({
            customerId: customer.id,
            customerName: customer.name,
            status: 'failed',
            error: error.message,
          });
        }
      }

      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;

      console.log(
        `\n[${endTime.toISOString()}] Category assignment completed in ${duration}s`
      );
      console.log(`Total Processed: ${results.totalProcessed}`);
      console.log(`Total Updated: ${results.totalUpdated}`);
      console.log(`Total Unchanged: ${results.totalUnchanged}`);
      console.log(`Total Failed: ${results.totalFailed}`);

      return results;
    } catch (error: any) {
      console.error('Fatal error in category assignment:', error);
      throw error;
    }
  }

  async assignSingleCustomerCategory(customerId: number): Promise<any> {
    const categoryLevels = await this.getCategoryLevels();
    const metrics = await this.calculateCustomerMetrics(customerId);
    const assignedCategory = this.determineCategory(metrics, categoryLevels);

    if (assignedCategory) {
      await prisma.customers.update({
        where: { id: customerId },
        data: {
          customer_category_id: assignedCategory.id,
          updatedate: new Date(),
        },
      });
    }

    return {
      customerId,
      totalSales: metrics.totalSales,
      orderCount: metrics.orderCount,
      assignedCategory: assignedCategory?.categoryName || 'None',
      assignedCategoryId: assignedCategory?.id || null,
    };
  }
}

export default new CustomerCategoryAssignmentService();
