"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCategoryAssignmentService = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
class CustomerCategoryAssignmentService {
    async calculateCustomerSales(customerId) {
        const orderSales = await prisma_client_1.default.orders.aggregate({
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
        });
        const invoiceSales = await prisma_client_1.default.invoices.aggregate({
            where: {
                customer_id: customerId,
                status: {
                    in: ['paid', 'completed'],
                },
                is_active: 'Y',
            },
            _sum: {
                amount_paid: true,
            },
        });
        // Choose which one to use or combine both
        // For now, using orders total amount
        return Number(orderSales._sum.total_amount || 0);
    }
    async getCategoryLevels() {
        const categories = await prisma_client_1.default.customer_category.findMany({
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
        return categories
            .filter(cat => cat.customer_category_condition_customer_category.length > 0)
            .map(cat => ({
            id: cat.id,
            categoryName: cat.category_name,
            level: cat.level || 1,
            thresholdValue: Number(cat.customer_category_condition_customer_category[0]
                ?.threshold_value || 0),
        }))
            .sort((a, b) => a.thresholdValue - b.thresholdValue);
    }
    determineCategory(totalSales, categoryLevels) {
        for (let i = categoryLevels.length - 1; i >= 0; i--) {
            if (totalSales >= categoryLevels[i].thresholdValue) {
                return categoryLevels[i];
            }
        }
        return null;
    }
    async assignCustomerCategories() {
        const startTime = new Date();
        console.log(`[${startTime.toISOString()}] Starting customer category assignment...`);
        const results = {
            totalProcessed: 0,
            totalUpdated: 0,
            totalUnchanged: 0,
            totalFailed: 0,
            details: [],
        };
        try {
            const categoryLevels = await this.getCategoryLevels();
            if (categoryLevels.length === 0) {
                console.warn('No active customer categories found with sales conditions');
                return results;
            }
            console.log(`Found ${categoryLevels.length} category levels:`, categoryLevels);
            // Get all active customers
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
            console.log(`Processing ${customers.length} customers...`);
            for (const customer of customers) {
                results.totalProcessed++;
                try {
                    const totalSales = await this.calculateCustomerSales(customer.id);
                    const assignedCategory = this.determineCategory(totalSales, categoryLevels);
                    const newCategoryId = assignedCategory?.id || null;
                    const currentCategoryId = customer.customer_category_id;
                    if (newCategoryId !== currentCategoryId) {
                        await prisma_client_1.default.customers.update({
                            where: { id: customer.id },
                            data: {
                                customer_category_id: newCategoryId,
                                updatedate: new Date(),
                                updatedby: 1, // System user
                            },
                        });
                        results.totalUpdated++;
                        results.details.push({
                            customerId: customer.id,
                            customerName: customer.name,
                            totalSales,
                            previousCategory: currentCategoryId,
                            newCategory: newCategoryId,
                            newCategoryName: assignedCategory?.categoryName || 'None',
                            status: 'updated',
                        });
                        console.log(` Customer ${customer.name} (ID: ${customer.id}) - Sales: ${totalSales} - Category: ${assignedCategory?.categoryName || 'None'}`);
                    }
                    else {
                        results.totalUnchanged++;
                    }
                }
                catch (error) {
                    results.totalFailed++;
                    console.error(` Failed to process customer ${customer.id}:`, error.message);
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
            console.log(`\n[${endTime.toISOString()}] Category assignment completed in ${duration}s`);
            console.log(`Total Processed: ${results.totalProcessed}`);
            console.log(`Total Updated: ${results.totalUpdated}`);
            console.log(`Total Unchanged: ${results.totalUnchanged}`);
            console.log(`Total Failed: ${results.totalFailed}`);
            return results;
        }
        catch (error) {
            console.error('Fatal error in category assignment:', error);
            throw error;
        }
    }
    async assignSingleCustomerCategory(customerId) {
        const categoryLevels = await this.getCategoryLevels();
        const totalSales = await this.calculateCustomerSales(customerId);
        const assignedCategory = this.determineCategory(totalSales, categoryLevels);
        if (assignedCategory) {
            await prisma_client_1.default.customers.update({
                where: { id: customerId },
                data: {
                    customer_category_id: assignedCategory.id,
                    updatedate: new Date(),
                },
            });
        }
        return {
            customerId,
            totalSales,
            assignedCategory: assignedCategory?.categoryName || 'None',
        };
    }
}
exports.CustomerCategoryAssignmentService = CustomerCategoryAssignmentService;
exports.default = new CustomerCategoryAssignmentService();
//# sourceMappingURL=customerCategoryAssignment.service.js.map