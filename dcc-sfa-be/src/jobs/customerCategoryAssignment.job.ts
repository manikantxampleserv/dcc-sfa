import cron from 'node-cron';
import prisma from '../configs/prisma.client';
import logger from '../configs/logger';

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
      logger.info('Cron job: Customer Category Assignment Started');
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
                condition_type: 'sales_amount',
              },
            },
          },
          orderBy: {
            level: 'asc',
          },
        });

        const validCategories = categoryLevels
          .filter(
            cat => cat.customer_category_condition_customer_category.length > 0
          )
          .map(cat => ({
            id: cat.id,
            categoryName: cat.category_name,
            level: cat.level || 1,
            thresholdValue: Number(
              cat.customer_category_condition_customer_category[0]
                ?.threshold_value || 0
            ),
          }))
          .sort((a, b) => a.thresholdValue - b.thresholdValue);

        if (validCategories.length === 0) {
          logger.warn(
            'No active customer categories found with sales conditions'
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
        const orderSalesData = await prisma.orders.groupBy({
          by: ['parent_id'],
          where: {
            parent_id: { in: customers.map((c: any) => c.id) },
            status: { in: ['approved', 'pending', 'confirmed'] },
            is_active: 'Y',
          },
          _sum: {
            total_amount: true,
          },
        });

        const salesMap = new Map();
        for (const order of orderSalesData) {
          if (order.parent_id !== null) {
            salesMap.set(
              order.parent_id,
              Number(order._sum?.total_amount || 0)
            );
          }
        }

        logger.info(`Processing ${customers.length} customers...`);

        for (const customer of customers) {
          results.totalProcessed++;

          try {
            const totalSales = salesMap.get(customer.id) || 0;

            let assignedCategory: any = null;

            for (let i = validCategories.length - 1; i >= 0; i--) {
              if (totalSales >= validCategories[i].thresholdValue) {
                assignedCategory = validCategories[i];
                break;
              }
            }

            if (!assignedCategory && validCategories.length > 0) {
              assignedCategory = validCategories[0];
            }

            const newCategoryId = assignedCategory?.id || null;
            const currentCategoryId = customer.customer_category_id;

            if (!currentCategoryId && newCategoryId) {
              await prisma.$transaction(async tx => {
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
            } else if (newCategoryId !== currentCategoryId) {
              const changeType = getChangeType(
                currentCategoryId,
                newCategoryId,
                validCategories
              );

              const existingRequest =
                await prisma.customer_category_grading.findFirst({
                  where: {
                    customer_id: customer.id,
                    action_taken: 'N',
                  },
                });

              if (existingRequest) {
                await prisma.customer_category_grading.update({
                  where: { id: existingRequest.id },
                  data: {
                    current_category_id: currentCategoryId,
                    upcoming_category_id: newCategoryId,
                    change_type: changeType,
                    status: 'P',
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
            } else {
              results.totalUnchanged++;
            }
          } catch (error: any) {
            results.totalFailed++;
            logger.error(`${customer.name}: ${error.message}`);
            logger.error(`Full error:`, JSON.stringify(error, null, 2));

            if (error.code === 'P2002') {
              logger.error(`Unique constraint violation`);
            } else if (error.code === 'P2003') {
              logger.error(`Foreign key constraint violation`);
            }
          }
        }
        const endTime = new Date();
        const duration = (endTime.getTime() - startTime.getTime()) / 1000;

        logger.info('Cron Customer Category Assignment Completed');
        logger.info(`Duration: ${duration}s`);
        logger.info(
          `Summary: processed: ${results.totalProcessed}, requestsCreated: ${results.totalUpdated}, unchanged: ${results.totalUnchanged}, failed: ${results.totalFailed}`
        );
      } catch (error: any) {
        logger.error('Cron: Customer Category Assignment Failed');
        logger.error('Error:', error.message);
      }
    },
    {
      timezone: 'Asia/Kolkata',
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
        await prisma.$transaction(async tx => {
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
