"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCustomerCategoryAssignment = void 0;
exports.assignLowestCategoryToUncategorizedCustomers = assignLowestCategoryToUncategorizedCustomers;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const logger_1 = __importDefault(require("../configs/logger"));
const customerCategoryAssignment_service_1 = require("../v1/services/customerCategoryAssignment.service");
function getChangeType(currentCategoryId, newCategoryId, validCategories) {
    if (!currentCategoryId && newCategoryId)
        return 'no_change';
    if (!newCategoryId)
        return 'removal';
    const currentLevel = validCategories.find(c => c.id === currentCategoryId)?.level || 0;
    const newLevel = validCategories.find(c => c.id === newCategoryId)?.level || 0;
    if (newLevel > currentLevel)
        return 'upgrade';
    if (newLevel < currentLevel)
        return 'downgrade';
    return 'no_change';
}
async function getLowestCategory() {
    const lowestCategory = await prisma_client_1.default.customer_category.findFirst({
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
let scheduledTask = null;
const scheduleCustomerCategoryAssignment = async () => {
    let cronExpression = '0 0 * * *';
    try {
        const companySettings = await prisma_client_1.default.companies.findFirst({
            orderBy: { id: 'asc' },
        });
        if (companySettings?.customer_grading_cron_time) {
            cronExpression = companySettings.customer_grading_cron_time;
        }
    }
    catch (error) {
        logger_1.default.error('Failed to get cron settings, using default', error);
    }
    if (scheduledTask) {
        scheduledTask.stop();
    }
    scheduledTask = node_cron_1.default.schedule(cronExpression, async () => {
        logger_1.default.info('Cron job: Customer Category Assignment Started');
        logger_1.default.info(`Time: ${new Date().toISOString()}`);
        try {
            const startTime = new Date();
            const results = {
                totalProcessed: 0,
                totalUpdated: 0,
                totalUnchanged: 0,
                totalFailed: 0,
            };
            const categoryLevels = await prisma_client_1.default.customer_category.findMany({
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
            const validCategories = categoryLevels
                .filter((cat) => cat.customer_category_condition_customer_category.length > 0)
                .map((cat) => ({
                id: cat.id,
                categoryName: cat.category_name,
                level: cat.level || 1,
                logical_condition: cat.logical_condition || 'AND',
                conditions: cat.customer_category_condition_customer_category.map((c) => ({
                    id: c.id,
                    condition_type: c.condition_type,
                    condition_operator: c.condition_operator,
                    threshold_value: Number(c.threshold_value || 0),
                    min_threshold_value: c.min_threshold_value !== null
                        ? Number(c.min_threshold_value)
                        : null,
                    max_threshold_value: c.max_threshold_value !== null
                        ? Number(c.max_threshold_value)
                        : null,
                    product_category_id: c.product_category_id,
                })),
            }));
            if (validCategories.length === 0) {
                logger_1.default.warn('No active customer categories found with conditions');
                return;
            }
            logger_1.default.info(`Found ${validCategories.length} category levels`);
            const lowestCategory = await getLowestCategory();
            if (!lowestCategory) {
                logger_1.default.warn('No active customer categories found');
                return;
            }
            logger_1.default.info(`Using lowest category: ${lowestCategory.category_name} (Level: ${lowestCategory.level})`);
            const customers = await prisma_client_1.default.customers.findMany({
                where: {
                    is_active: 'Y',
                },
                select: {
                    id: true,
                    name: true,
                    customer_category_id: true,
                },
            });
            logger_1.default.info(`Fetching aggregated sales for ${customers.length} customers...`);
            const invoiceSalesData = await prisma_client_1.default.invoices.groupBy({
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
            const metricsMap = new Map();
            for (const invoice of invoiceSalesData) {
                if (invoice.customer_id !== null) {
                    const totalSales = Number(invoice._sum?.total_amount || 0);
                    const orderCount = Number(invoice._count?.id || 0);
                    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
                    metricsMap.set(invoice.customer_id, {
                        totalSales,
                        orderCount,
                        averageOrderValue,
                    });
                }
            }
            logger_1.default.info(`Processing ${customers.length} customers...`);
            for (const customer of customers) {
                results.totalProcessed++;
                try {
                    const metrics = metricsMap.get(customer.id) || {
                        totalSales: 0,
                        orderCount: 0,
                        averageOrderValue: 0,
                    };
                    let assignedCategory = null;
                    for (const cat of validCategories) {
                        if ((0, customerCategoryAssignment_service_1.matchesCategory)(cat, metrics)) {
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
                        await prisma_client_1.default.$transaction(async (tx) => {
                            await tx.customers.update({
                                where: { id: customer.id },
                                data: {
                                    customer_category_id: newCategoryId,
                                    updatedate: new Date(),
                                    updatedby: 1,
                                },
                            });
                            const existingRequest = await tx.customer_category_grading.findFirst({
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
                            }
                            else {
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
                    }
                    else if (newCategoryId !== currentCategoryId) {
                        const changeType = getChangeType(currentCategoryId, newCategoryId, validCategories);
                        const existingRequest = await prisma_client_1.default.customer_category_grading.findFirst({
                            where: {
                                customer_id: customer.id,
                                action_taken: 'N',
                            },
                        });
                        if (existingRequest) {
                            await prisma_client_1.default.customer_category_grading.update({
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
                        }
                        else {
                            await prisma_client_1.default.customer_category_grading.create({
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
                    else {
                        results.totalUnchanged++;
                    }
                }
                catch (error) {
                    results.totalFailed++;
                    logger_1.default.error(`${customer.name}: ${error.message}`);
                    logger_1.default.error(`Full error:`, JSON.stringify(error, null, 2));
                    if (error.code === 'P2002') {
                        logger_1.default.error(`Unique constraint violation`);
                    }
                    else if (error.code === 'P2003') {
                        logger_1.default.error(`Foreign key constraint violation`);
                    }
                }
            }
            const endTime = new Date();
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;
            logger_1.default.info('Cron Customer Category Assignment Completed');
            logger_1.default.info(`Duration: ${duration}s`);
            logger_1.default.info(`Summary: processed: ${results.totalProcessed}, requestsCreated: ${results.totalUpdated}, unchanged: ${results.totalUnchanged}, failed: ${results.totalFailed}`);
        }
        catch (error) {
            logger_1.default.error('Cron: Customer Category Assignment Failed');
            logger_1.default.error('Error:', error.message);
        }
    }, {
        timezone: process.env.TIMEZONE || 'Asia/Kolkata',
    });
};
exports.scheduleCustomerCategoryAssignment = scheduleCustomerCategoryAssignment;
async function assignLowestCategoryToUncategorizedCustomers() {
    try {
        logger_1.default.info('Starting one-time assignment of lowest category to uncategorized customers...');
        const lowestCategory = await getLowestCategory();
        if (!lowestCategory) {
            logger_1.default.error('No active customer categories found');
            return;
        }
        const uncategorizedCustomers = await prisma_client_1.default.customers.findMany({
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
        logger_1.default.info(`Found ${uncategorizedCustomers.length} uncategorized customers`);
        let updated = 0;
        let failed = 0;
        for (const customer of uncategorizedCustomers) {
            try {
                await prisma_client_1.default.$transaction(async (tx) => {
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
            }
            catch (error) {
                failed++;
                logger_1.default.error(`✗ ${customer.name}: ${error.message}`);
            }
        }
        logger_1.default.info(`Assignment completed: ${updated} updated, ${failed} failed`);
        return { updated, failed };
    }
    catch (error) {
        logger_1.default.error('One-time assignment failed:', error.message);
        throw error;
    }
}
//# sourceMappingURL=customerCategoryAssignment.job.js.map