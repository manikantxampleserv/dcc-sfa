import cron from 'node-cron';
import prisma from '../configs/prisma.client';
import logger from '../configs/logger';
import {
  matchesCategory,
  CategoryLevel,
  CustomerMetrics,
} from '../v1/services/customerCategoryAssignment.service';

function getChangeType(
  currentCategoryId: number | null,
  newCategoryId: number | null,
  validCategories: any[]
): string {
  if (!currentCategoryId && newCategoryId) return 'no_change';
  if (!newCategoryId) return 'removal';

  const currentLevel =
    validCategories.find(c => c.id === currentCategoryId)?.level || 0;
  const newLevel =
    validCategories.find(c => c.id === newCategoryId)?.level || 0;

  if (newLevel > currentLevel) return 'upgrade';
  if (newLevel < currentLevel) return 'downgrade';
  return 'no_change';
}
async function getLowestCategory() {
  const lowestCategory = await prisma.customer_category.findFirst({
    where: {
      is_active: 'Y',
    },
    orderBy: {
      level: 'asc',
    },
    select: {
      id: true,
      category_name: true,
      category_code: true,
      level: true,
    },
  });

  return lowestCategory;
}

let scheduledTask: any = null;
let isAssignmentRunning = false;

export const runCustomerCategoryAssignment = async () => {
  if (isAssignmentRunning) {
    logger.warn('Customer Category Assignment is already running. Skipping duplicate trigger.');
    return { skipped: true };
  }
  isAssignmentRunning = true;
  logger.info('Customer Category Assignment Started');
  logger.info(`Time: ${new Date().toISOString()}`);

  try {
    const startTime = new Date();
        const results = {
          totalProcessed: 0,
          totalUpdated: 0,
          totalUnchanged: 0,
          totalFailed: 0,
        };

        const categoryLevels = await prisma.customer_category.findMany({
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
            level: 'desc', // Highest tier evaluated first
          },
        });

        const validCategories: CategoryLevel[] = categoryLevels
          .filter(
            (cat: any) =>
              cat.customer_category_condition_customer_category.length > 0
          )
          .map((cat: any) => ({
            id: cat.id,
            categoryName: cat.category_name,
            level: cat.level || 1,
            logical_condition: cat.logical_condition || 'AND',
            conditions: cat.customer_category_condition_customer_category.map(
              (c: any) => ({
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

        if (validCategories.length === 0) {
          logger.warn(
            'No active customer categories found with conditions'
          );
          return;
        }

        logger.info(`Found ${validCategories.length} category levels`);

        const lowestCategory = await getLowestCategory();

        if (!lowestCategory) {
          logger.warn('No active customer categories found');
          return;
        }

        logger.info(
          `Using lowest category: ${lowestCategory.category_name} (Level: ${lowestCategory.level})`
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

        logger.info(
          `Fetching aggregated sales for ${customers.length} customers...`
        );
        const invoiceSalesData = await prisma.invoices.groupBy({
          by: ['customer_id'],
          where: {
            invoices_customers: {
              is_active: 'Y',
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

        const metricsMap = new Map<number, CustomerMetrics>();
        for (const invoice of invoiceSalesData) {
          if (invoice.customer_id !== null) {
            const totalSales = Number(invoice._sum?.total_amount || 0);
            const orderCount = Number(invoice._count?.id || 0);
            const averageOrderValue =
              orderCount > 0 ? totalSales / orderCount : 0;
            metricsMap.set(invoice.customer_id, {
              totalSales,
              orderCount,
              averageOrderValue,
            });
          }
        }

        logger.info(`Pre-fetching existing grading records for quick lookup...`);
        const existingGradings = await prisma.customer_category_grading.findMany({
          select: {
            id: true,
            customer_id: true,
            current_category_id: true,
            upcoming_category_id: true,
            change_type: true,
            status: true,
            action_taken: true,
          },
          orderBy: { id: 'desc' },
        });

        const gradingMap = new Map<number, any>();
        for (const g of existingGradings) {
          if (!gradingMap.has(g.customer_id)) {
            gradingMap.set(g.customer_id, g);
          }
        }
        logger.info(`Loaded ${gradingMap.size} existing customer grading records into memory.`);

        logger.info(`Processing ${customers.length} customers...`);

        // Process in chunks of 50 to maximize throughput and avoid serial network latency
        const CHUNK_SIZE = 50;
        for (let i = 0; i < customers.length; i += CHUNK_SIZE) {
          const chunk = customers.slice(i, i + CHUNK_SIZE);
          await Promise.all(
            chunk.map(async customer => {
          results.totalProcessed++;

          try {
            const metrics = metricsMap.get(customer.id) || {
              totalSales: 0,
              orderCount: 0,
              averageOrderValue: 0,
            };

            let assignedCategory: any = null;

            for (const cat of validCategories) {
              if (matchesCategory(cat, metrics)) {
                assignedCategory = cat;
                break;
              }
            }

            if (!assignedCategory && lowestCategory) {
              assignedCategory = lowestCategory;
            }

            const newCategoryId = assignedCategory?.id || null;
            const currentCategoryId = customer.customer_category_id;

            if (!currentCategoryId && newCategoryId) {
              await prisma.$transaction(async (tx: any) => {
                await tx.customers.update({
                  where: { id: customer.id },
                  data: {
                    customer_category_id: newCategoryId,
                    updatedate: new Date(),
                    updatedby: 1,
                  },
                });

                const existingRequest =
                  await tx.customer_category_grading.findFirst({
                    where: {
                      customer_id: customer.id,
                      action_taken: 'N',
                    },
                  });

                if (existingRequest) {
                  await tx.customer_category_grading.update({
                    where: { id: existingRequest.id },
                    data: {
                      current_category_id: newCategoryId,
                      upcoming_category_id: newCategoryId,
                      change_type: 'no_change',
                      status: 'C',
                      action_taken: 'A',
                      approver_id: 1,
                      approved_date: new Date(),
                      updatedate: new Date(),
                      updatedby: 1,
                    },
                  });
                } else {
                  await tx.customer_category_grading.create({
                    data: {
                      customer_id: customer.id,
                      current_category_id: newCategoryId,
                      upcoming_category_id: newCategoryId,
                      change_type: 'no_change',
                      status: 'C',
                      action_taken: 'A',
                      approver_id: 1,
                      approved_date: new Date(),
                      createdate: new Date(),
                      updatedate: new Date(),
                      createdby: 1,
                      updatedby: 1,
                    },
                  });
                }
              });

              results.totalUpdated++;
            } else {
              const isDifferent = newCategoryId !== currentCategoryId;
              const changeType = isDifferent
                ? getChangeType(
                    currentCategoryId,
                    newCategoryId,
                    validCategories
                  )
                : 'no_change';

              const existingRequest = gradingMap.get(customer.id);

              if (existingRequest) {
                // If already in the exact desired state, SKIP database write
                if (
                  existingRequest.current_category_id === currentCategoryId &&
                  existingRequest.upcoming_category_id === newCategoryId &&
                  existingRequest.change_type === changeType &&
                  existingRequest.status === 'P' &&
                  existingRequest.action_taken === 'N'
                ) {
                  results.totalUnchanged++;
                  return;
                }

                await prisma.customer_category_grading.update({
                  where: { id: existingRequest.id },
                  data: {
                    current_category_id: currentCategoryId,
                    upcoming_category_id: newCategoryId,
                    change_type: changeType,
                    status: 'P',
                    action_taken: 'N',
                    approver_id: null,
                    approved_date: null,
                    updatedate: new Date(),
                    updatedby: 1,
                  },
                });

                results.totalUpdated++;
              } else {
                await prisma.customer_category_grading.create({
                  data: {
                    customer_id: customer.id,
                    current_category_id: currentCategoryId,
                    upcoming_category_id: newCategoryId,
                    status: 'P',
                    change_type: changeType,
                    action_taken: 'N',
                    createdate: new Date(),
                    updatedate: new Date(),
                    createdby: 1,
                    updatedby: 1,
                  },
                });

                results.totalUpdated++;
              }
            }
          } catch (error: any) {
            results.totalFailed++;
            logger.error(`${customer.name}: ${error.message}`);
          }
            })
          );
        }
        const endTime = new Date();
        const duration = (endTime.getTime() - startTime.getTime()) / 1000;

        logger.info('Customer Category Assignment Completed');
        logger.info(`Duration: ${duration}s`);
        logger.info(
          `Summary: processed: ${results.totalProcessed}, requestsCreated: ${results.totalUpdated}, unchanged: ${results.totalUnchanged}, failed: ${results.totalFailed}`
        );
        return { ...results, duration };
      } catch (error: any) {
        logger.error('Customer Category Assignment Failed');
        logger.error('Error:', error.message);
        throw error;
      } finally {
        isAssignmentRunning = false;
      }
};

export const scheduleCustomerCategoryAssignment = async () => {
  let cronExpression = '0 0 * * *';
  try {
    const companySettings = await prisma.companies.findFirst({
      orderBy: { id: 'asc' },
    });
    if (companySettings?.customer_grading_cron_time) {
      cronExpression = companySettings.customer_grading_cron_time;
    }
  } catch (error) {
    logger.error('Failed to get cron settings, using default', error);
  }

  if (scheduledTask) {
    scheduledTask.stop();
  }

  scheduledTask = cron.schedule(
    cronExpression,
    async () => {
      try {
        await runCustomerCategoryAssignment();
      } catch (err: any) {
        logger.error('Scheduled customer category assignment error:', err.message);
      }
    },
    {
      timezone: process.env.TIMEZONE || 'Asia/Kolkata',
    }
  );
};

export async function assignLowestCategoryToUncategorizedCustomers() {
  try {
    logger.info(
      'Starting one-time assignment of lowest category to uncategorized customers...'
    );

    const lowestCategory = await getLowestCategory();

    if (!lowestCategory) {
      logger.error('No active customer categories found');
      return;
    }

    const uncategorizedCustomers = await prisma.customers.findMany({
      where: {
        is_active: 'Y',
        customer_category_id: null,
      },
      select: {
        id: true,
        name: true,
        customer_category_id: true,
      },
    });

    logger.info(
      `Found ${uncategorizedCustomers.length} uncategorized customers`
    );

    let updated = 0;
    let failed = 0;

    for (const customer of uncategorizedCustomers) {
      try {
        await prisma.$transaction(async (tx: any) => {
          await tx.customers.update({
            where: { id: customer.id },
            data: {
              customer_category_id: lowestCategory.id,
              updatedate: new Date(),
              updatedby: 1,
            },
          });

          await tx.customer_category_grading.create({
            data: {
              customer_id: customer.id,
              current_category_id: null,
              upcoming_category_id: lowestCategory.id,
              change_type: 'no_change',
              status: 'C',
              action_taken: 'A',
              approver_id: 1,
              approved_date: new Date(),
              createdby: 1,
            },
          });
        });

        updated++;
      } catch (error: any) {
        failed++;
        logger.error(`✗ ${customer.name}: ${error.message}`);
      }
    }

    logger.info(`Assignment completed: ${updated} updated, ${failed} failed`);
    return { updated, failed };
  } catch (error: any) {
    logger.error('One-time assignment failed:', error.message);
    throw error;
  }
}
