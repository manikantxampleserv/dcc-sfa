"use strict";
// import cron from 'node-cron';
// import prisma from '../configs/prisma.client';
// import logger from '../configs/logger';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCustomerCategoryAssignment = void 0;
exports.assignLowestCategoryToUncategorizedCustomers = assignLowestCategoryToUncategorizedCustomers;
// export const scheduleCustomerCategoryAssignment = () => {
//   cron.schedule(
//     '0 0 * * *',
//     async () => {
//       console.log(' Cron job: Customer Category Assignment Started');
//       console.log('Time:', new Date().toISOString());
//       try {
//         const startTime = new Date();
//         const results = {
//           totalProcessed: 0,
//           totalUpdated: 0,
//           totalUnchanged: 0,
//           totalFailed: 0,
//         };
//         const categoryLevels = await prisma.customer_category.findMany({
//           where: {
//             is_active: 'Y',
//           },
//           include: {
//             customer_category_condition_customer_category: {
//               where: {
//                 is_active: 'Y',
//                 condition_type: 'sales_amount',
//               },
//             },
//           },
//           orderBy: {
//             level: 'asc',
//           },
//         });
//         const validCategories = categoryLevels
//           .filter(
//             cat => cat.customer_category_condition_customer_category.length > 0
//           )
//           .map(cat => ({
//             id: cat.id,
//             categoryName: cat.category_name,
//             level: cat.level || 1,
//             thresholdValue: Number(
//               cat.customer_category_condition_customer_category[0]
//                 ?.threshold_value || 0
//             ),
//           }))
//           .sort((a, b) => a.thresholdValue - b.thresholdValue);
//         if (validCategories.length === 0) {
//           console.warn(
//             '  No active customer categories found with sales conditions'
//           );
//           return;
//         }
//         console.log(` Found ${validCategories.length} category levels`);
//         const customers = await prisma.customers.findMany({
//           where: {
//             is_active: 'Y',
//           },
//           select: {
//             id: true,
//             name: true,
//             customer_category_id: true,
//           },
//         });
//         console.log(` Processing ${customers.length} customers...\n`);
//         for (const customer of customers) {
//           results.totalProcessed++;
//           try {
//             const orderSales = await prisma.orders.aggregate({
//               where: {
//                 parent_id: customer.id,
//                 status: {
//                   in: ['approved', 'pending'],
//                 },
//                 is_active: 'Y',
//               },
//               _sum: {
//                 total_amount: true,
//               },
//             });
//             const totalSales = Number(orderSales._sum?.total_amount || 0);
//             let assignedCategory = null;
//             for (let i = validCategories.length - 1; i >= 0; i--) {
//               if (totalSales >= validCategories[i].thresholdValue) {
//                 assignedCategory = validCategories[i];
//                 break;
//               }
//             }
//             if (!assignedCategory && validCategories.length > 0) {
//               assignedCategory = validCategories[0];
//             }
//             const newCategoryId = assignedCategory?.id || null;
//             const currentCategoryId = customer.customer_category_id;
//             if (newCategoryId !== currentCategoryId) {
//               await prisma.customers.update({
//                 where: { id: customer.id },
//                 data: {
//                   customer_category_id: newCategoryId,
//                   updatedate: new Date(),
//                   updatedby: 1,
//                 },
//               });
//               results.totalUpdated++;
//               console.log(
//                 `   ${customer.name} → ${assignedCategory?.categoryName || 'None'} (Sales: ₹${totalSales})`
//               );
//             } else {
//               results.totalUnchanged++;
//             }
//           } catch (error: any) {
//             results.totalFailed++;
//             console.error(` ${customer.name}: ${error.message}`);
//           }
//         }
//         const endTime = new Date();
//         const duration = (endTime.getTime() - startTime.getTime()) / 1000;
//         console.log(' Cron Customer Category Assignment Completed');
//         console.log(` Duration: ${duration}s`);
//         console.log(' Summary:', {
//           processed: results.totalProcessed,
//           updated: results.totalUpdated,
//           unchanged: results.totalUnchanged,
//           failed: results.totalFailed,
//         });
//       } catch (error: any) {
//         console.error(' Cron: Customer Category Assignment Failed');
//         console.error('Error:', error.message);
//       }
//     },
//     {
//       timezone: 'Asia/Kolkata',
//     }
//   );
//   logger.info('Customer Category Assignment cronjob scheduled');
// };
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const logger_1 = __importDefault(require("../configs/logger"));
function getChangeType(currentCategoryId, newCategoryId, validCategories) {
    if (!currentCategoryId && newCategoryId)
        return 'new_assignment';
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
const scheduleCustomerCategoryAssignment = () => {
    console.log('Setting up cron job...');
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log(' Cron job: Customer Category Assignment Started');
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
                console.warn('  No active customer categories found with sales conditions');
                return;
            }
            console.log(` Found ${validCategories.length} category levels`);
            // const lowestCategory = await getLowestCategory();
            // if (!lowestCategory) {
            //   console.warn('  No active customer categories found');
            //   return;
            // }
            // console.log(
            //   ` Using lowest category: ${lowestCategory.category_name} (Level: ${lowestCategory.level})`
            // );
            // const customers = await prisma.customers.findMany({
            //   where: {
            //     is_active: 'Y',
            //   },
            //   select: {
            //     id: true,
            //     name: true,
            //     customer_category_id: true,
            //   },
            // });
            // console.log(` Processing ${customers.length} customers...\n`);
            // console.log(` Processing ${customers.length} customers...\n`);
            // for (const customer of customers) {
            //   results.totalProcessed++;
            //   try {
            //     const orderSales = await prisma.orders.aggregate({
            //       where: {
            //         parent_id: customer.id,
            //         status: {
            //           in: ['approved', 'pending', 'confirmed'],
            //         },
            //         is_active: 'Y',
            //       },
            //       _sum: {
            //         total_amount: true,
            //       },
            //     });
            //     const totalSales = Number(orderSales._sum?.total_amount || 0);
            //     let assignedCategory = null;
            //     for (let i = validCategories.length - 1; i >= 0; i--) {
            //       if (totalSales >= validCategories[i].thresholdValue) {
            //         assignedCategory = validCategories[i];
            //         break;
            //       }
            //     }
            //     if (!assignedCategory && validCategories.length > 0) {
            //       assignedCategory = validCategories[0];
            //     }
            //     const newCategoryId = assignedCategory?.id || null;
            //     const currentCategoryId = customer.customer_category_id;
            //     if (newCategoryId !== currentCategoryId) {
            //       const changeType = getChangeType(
            //         currentCategoryId,
            //         newCategoryId,
            //         validCategories
            //       );
            //       const existingRequest =
            //         await prisma.customer_category_grading.findFirst({
            //           where: {
            //             customer_id: customer.id,
            //             action_taken: 'N',
            //           },
            //         });
            //       if (existingRequest) {
            //         await prisma.customer_category_grading.update({
            //           where: { id: existingRequest.id },
            //           data: {
            //             current_category_id: currentCategoryId,
            //             upcoming_category_id: newCategoryId,
            //             change_type: changeType,
            //             status: 'P',
            //             updatedate: new Date(),
            //             updatedby: 1,
            //           },
            //         });
            //         results.totalUpdated++;
            //         console.log(
            //           `   ${customer.name}  Updated existing ${changeType} request (Sales: ₹${totalSales})`
            //         );
            //       } else {
            //         await prisma.customer_category_grading.create({
            //           data: {
            //             customer_id: customer.id,
            //             current_category_id: currentCategoryId,
            //             upcoming_category_id: newCategoryId,
            //             status: 'P',
            //             change_type: changeType,
            //             action_taken: 'N',
            //             createdby: 1,
            //           },
            //         });
            //         results.totalUpdated++;
            //         console.log(
            //           `   ${customer.name} → ${changeType} request created (Sales: ₹${totalSales})`
            //         );
            //       }
            //     } else {
            //       results.totalUnchanged++;
            //     }
            //   } catch (error: any) {
            //     results.totalFailed++;
            //     console.error(` ${customer.name}: ${error.message}`);
            //   }
            // }
            const lowestCategory = await getLowestCategory();
            if (!lowestCategory) {
                console.warn('  No active customer categories found');
                return;
            }
            console.log(` Using lowest category: ${lowestCategory.category_name} (Level: ${lowestCategory.level})`);
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
            console.log(` Processing ${customers.length} customers...\n`);
            for (const customer of customers) {
                results.totalProcessed++;
                try {
                    const orderSales = await prisma_client_1.default.orders.aggregate({
                        where: {
                            parent_id: customer.id,
                            status: {
                                in: ['approved', 'pending', 'confirmed'],
                            },
                            is_active: 'Y',
                        },
                        _sum: {
                            total_amount: true,
                        },
                    });
                    const totalSales = Number(orderSales._sum?.total_amount || 0);
                    console.log(`  ${customer.name}: Sales: ₹${totalSales}, Current Category: ${customer.customer_category_id}`);
                    let assignedCategory = null;
                    if (!customer.customer_category_id) {
                        for (let i = validCategories.length - 1; i >= 0; i--) {
                            if (totalSales >= validCategories[i].thresholdValue) {
                                assignedCategory = validCategories[i];
                                break;
                            }
                        }
                        if (!assignedCategory && validCategories.length > 0) {
                            assignedCategory = validCategories[0];
                        }
                        console.log(`    Assigned Category: ${assignedCategory?.categoryName || 'None'} (ID: ${assignedCategory?.id})`);
                    }
                    else {
                        for (let i = validCategories.length - 1; i >= 0; i--) {
                            if (totalSales >= validCategories[i].thresholdValue) {
                                assignedCategory = validCategories[i];
                                break;
                            }
                        }
                        if (!assignedCategory && validCategories.length > 0) {
                            assignedCategory = validCategories[0];
                        }
                    }
                    const newCategoryId = assignedCategory?.id || null;
                    const currentCategoryId = customer.customer_category_id;
                    console.log(`    Comparison: newCategoryId=${newCategoryId}, currentCategoryId=${currentCategoryId}`);
                    console.log(`    Condition newCategoryId !== currentCategoryId: ${newCategoryId !== currentCategoryId}`);
                    if (!currentCategoryId && newCategoryId) {
                        console.log(`     Auto-assigning category to ${customer.name} (no previous category)`);
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
                            results.totalUpdated++;
                            console.log(`   ${customer.name} → Updated existing auto-assignment request (Sales: ₹${totalSales})`);
                        }
                        else {
                            await prisma_client_1.default.customer_category_grading.create({
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
                            results.totalUpdated++;
                            console.log(`   ${customer.name} → Auto-assignment request created (Sales: ₹${totalSales})`);
                        }
                    }
                    else if (newCategoryId !== currentCategoryId) {
                        console.log(`     Category change detected for ${customer.name}`);
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
                            console.log(`   ${customer.name} → Updated existing ${changeType} request (Sales: ₹${totalSales})`);
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
                            console.log(`   ${customer.name}  ${changeType} request created (Sales: ${totalSales})`);
                        }
                    }
                    else {
                        console.log(`     No category change needed for ${customer.name}`);
                        results.totalUnchanged++;
                    }
                }
                catch (error) {
                    results.totalFailed++;
                    console.error(` ${customer.name}: ${error.message}`);
                    console.error(` Full error:`, JSON.stringify(error, null, 2));
                    if (error.code === 'P2002') {
                        console.error(` Unique constraint violation`);
                    }
                    else if (error.code === 'P2003') {
                        console.error(` Foreign key constraint violation`);
                    }
                }
            }
            const endTime = new Date();
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;
            console.log(' Cron Customer Category Assignment Completed');
            console.log(` Duration: ${duration}s`);
            console.log(' Summary:', {
                processed: results.totalProcessed,
                requestsCreated: results.totalUpdated,
                unchanged: results.totalUnchanged,
                failed: results.totalFailed,
            });
        }
        catch (error) {
            console.error(' Cron: Customer Category Assignment Failed');
            console.error('Error:', error.message);
        }
    }, {
        timezone: 'Asia/Kolkata',
    });
    logger_1.default.info('Customer Category Assignment cronjob scheduled');
};
exports.scheduleCustomerCategoryAssignment = scheduleCustomerCategoryAssignment;
async function assignLowestCategoryToUncategorizedCustomers() {
    try {
        console.log('Starting one-time assignment of lowest category to uncategorized customers...');
        const lowestCategory = await getLowestCategory();
        if (!lowestCategory) {
            console.error('No active customer categories found');
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
        console.log(`Found ${uncategorizedCustomers.length} uncategorized customers`);
        let updated = 0;
        let failed = 0;
        for (const customer of uncategorizedCustomers) {
            try {
                await prisma_client_1.default.customers.update({
                    where: { id: customer.id },
                    data: {
                        customer_category_id: lowestCategory.id,
                        updatedate: new Date(),
                        updatedby: 1,
                    },
                });
                await prisma_client_1.default.customer_category_grading.create({
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
                updated++;
                console.log(`✓ ${customer.name} → ${lowestCategory.category_name}`);
            }
            catch (error) {
                failed++;
                console.error(`✗ ${customer.name}: ${error.message}`);
            }
        }
        console.log(`Assignment completed: ${updated} updated, ${failed} failed`);
        return { updated, failed };
    }
    catch (error) {
        console.error('One-time assignment failed:', error.message);
        throw error;
    }
}
//# sourceMappingURL=customerCategoryAssignment.job.js.map