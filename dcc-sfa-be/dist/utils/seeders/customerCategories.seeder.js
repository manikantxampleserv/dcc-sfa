"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCustomerCategories = seedCustomerCategories;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const client_1 = require("@prisma/client");
async function seedCustomerCategories() {
    const categories = [
        {
            category_name: 'Bronze',
            category_code: 'BRONZE',
            level: 1,
            threshold: 100,
            is_active: 'Y',
            createdby: 1,
            createdate: new Date(),
            log_inst: 1,
        },
        {
            category_name: 'Silver',
            category_code: 'SILVER',
            level: 2,
            threshold: 1000,
            is_active: 'Y',
            createdby: 1,
            createdate: new Date(),
            log_inst: 1,
        },
        {
            category_name: 'Gold',
            category_code: 'GOLD',
            level: 3,
            threshold: 10000,
            is_active: 'Y',
            createdby: 1,
            createdate: new Date(),
            log_inst: 1,
        },
        {
            category_name: 'Platinum',
            category_code: 'PLATINUM',
            level: 4,
            threshold: 100000,
            is_active: 'Y',
            createdby: 1,
            createdate: new Date(),
            log_inst: 1,
        },
        {
            category_name: 'Crown',
            category_code: 'CROWN',
            level: 5,
            threshold: 1000000,
            is_active: 'Y',
            createdby: 1,
            createdate: new Date(),
            log_inst: 1,
        },
    ];
    for (const cat of categories) {
        const { threshold, ...categoryData } = cat;
        try {
            const existingCategory = await prisma_client_1.default.customer_category.findFirst({
                where: { category_code: cat.category_code },
            });
            let category;
            if (existingCategory) {
                category = await prisma_client_1.default.customer_category.update({
                    where: { id: existingCategory.id },
                    data: categoryData,
                });
                console.log(` Updated: ${cat.category_name}`);
            }
            else {
                category = await prisma_client_1.default.customer_category.create({
                    data: categoryData,
                });
                console.log(` Created: ${cat.category_name}`);
            }
            const existingCondition = await prisma_client_1.default.customer_category_condition.findFirst({
                where: {
                    customer_category_id: category.id,
                    condition_type: 'sales_amount',
                },
            });
            const conditionData = {
                condition_type: 'sales_amount',
                condition_operator: '>=',
                threshold_value: new client_1.Prisma.Decimal(threshold),
                condition_description: `Total sales >= ${threshold}`,
                is_active: 'Y',
            };
            if (existingCondition) {
                await prisma_client_1.default.customer_category_condition.update({
                    where: { id: existingCondition.id },
                    data: conditionData,
                });
            }
            else {
                await prisma_client_1.default.customer_category_condition.create({
                    data: {
                        ...conditionData,
                        customer_category_id: category.id,
                    },
                });
            }
            console.log(`   Condition: Sales >= ₹${threshold}\n`);
        }
        catch (error) {
            console.error(` Failed to create/update ${cat.category_name}:`, error.message);
        }
    }
    console.log(' Customer categories seeded successfully!\n');
}
if (require.main === module) {
    seedCustomerCategories()
        .then(() => {
        console.log('Done!');
        process.exit(0);
    })
        .catch(error => {
        console.error('Seeder failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=customerCategories.seeder.js.map