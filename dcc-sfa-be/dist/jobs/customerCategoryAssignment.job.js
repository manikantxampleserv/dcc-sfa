"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCustomerCategoryAssignment = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const logger_1 = __importDefault(require("../configs/logger"));
const scheduleCustomerCategoryAssignment = () => {
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log('⏰ Cron job: Customer Category Assignment Started');
        console.log('Time:', new Date().toISOString());
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
                            condition_type: 'sales_amount',
                        },
                    },
                },
                orderBy: {
                    level: 'asc',
                },
            });
            const validCategories = categoryLevels
                .filter(cat => cat.customer_category_condition_customer_category.length > 0)
                .map(cat => ({
                id: cat.id,
                categoryName: cat.category_name,
                level: cat.level || 1,
                thresholdValue: Number(cat.customer_category_condition_customer_category[0]
                    ?.threshold_value || 0),
            }))
                .sort((a, b) => a.thresholdValue - b.thresholdValue);
            if (validCategories.length === 0) {
                console.warn('⚠️  No active customer categories found with sales conditions');
                return;
            }
            console.log(`📊 Found ${validCategories.length} category levels`);
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
            console.log(`👥 Processing ${customers.length} customers...\n`);
            for (const customer of customers) {
                results.totalProcessed++;
                try {
                    const orderSales = await prisma_client_1.default.orders.aggregate({
                        where: {
                            parent_id: customer.id,
                            status: {
                                in: ['approved', 'pending'],
                            },
                            is_active: 'Y',
                        },
                        _sum: {
                            total_amount: true,
                        },
                    });
                    const totalSales = Number(orderSales._sum?.total_amount || 0);
                    let assignedCategory = null;
                    for (let i = validCategories.length - 1; i >= 0; i--) {
                        if (totalSales >= validCategories[i].thresholdValue) {
                            assignedCategory = validCategories[i];
                            break;
                        }
                    }
                    const newCategoryId = assignedCategory?.id || null;
                    const currentCategoryId = customer.customer_category_id;
                    if (newCategoryId !== currentCategoryId) {
                        await prisma_client_1.default.customers.update({
                            where: { id: customer.id },
                            data: {
                                customer_category_id: newCategoryId,
                                updatedate: new Date(),
                                updatedby: 1,
                            },
                        });
                        results.totalUpdated++;
                        console.log(`  📝 ${customer.name} → ${assignedCategory?.categoryName || 'None'} (Sales: ₹${totalSales})`);
                    }
                    else {
                        results.totalUnchanged++;
                    }
                }
                catch (error) {
                    results.totalFailed++;
                    console.error(`❌ ${customer.name}: ${error.message}`);
                }
            }
            const endTime = new Date();
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;
            console.log('✅ Cron Customer Category Assignment Completed');
            console.log(`⏱️ Duration: ${duration}s`);
            console.log('📈 Summary:', {
                processed: results.totalProcessed,
                updated: results.totalUpdated,
                unchanged: results.totalUnchanged,
                failed: results.totalFailed,
            });
        }
        catch (error) {
            console.error('❌ Cron: Customer Category Assignment Failed');
            console.error('Error:', error.message);
        }
    }, {
        timezone: 'Asia/Kolkata',
    });
    logger_1.default.info('Customer Category Assignment cronjob scheduled');
};
exports.scheduleCustomerCategoryAssignment = scheduleCustomerCategoryAssignment;
//# sourceMappingURL=customerCategoryAssignment.job.js.map