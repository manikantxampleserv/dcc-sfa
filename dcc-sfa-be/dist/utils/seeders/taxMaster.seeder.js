"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockTaxMasters = void 0;
exports.seedTaxMaster = seedTaxMaster;
exports.clearTaxMaster = clearTaxMaster;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const logger_1 = __importDefault(require("../../configs/logger"));
const mockTaxMasters = [
    {
        name: 'Standard Tax',
        code: 'TAX-STD',
        tax_rate: 18.0,
        description: 'Standard tax rate applicable to most products',
        is_active: 'Y',
    },
    {
        name: 'Zero Tax',
        code: 'TAX-ZERO',
        tax_rate: 0.0,
        description: 'Zero tax rate for exempted products',
        is_active: 'Y',
    },
    {
        name: 'Reduced Tax',
        code: 'TAX-RED',
        tax_rate: 5.0,
        description: 'Reduced tax rate for essential goods',
        is_active: 'Y',
    },
    {
        name: 'High Tax',
        code: 'TAX-HIGH',
        tax_rate: 28.0,
        description: 'High tax rate for luxury items',
        is_active: 'Y',
    },
    {
        name: 'Service Tax',
        code: 'TAX-SVC',
        tax_rate: 15.0,
        description: 'Tax rate for service-related products',
        is_active: 'Y',
    },
    {
        name: 'GST 5%',
        code: 'GST-5',
        tax_rate: 5.0,
        description: 'GST at 5% rate',
        is_active: 'Y',
    },
    {
        name: 'GST 12%',
        code: 'GST-12',
        tax_rate: 12.0,
        description: 'GST at 12% rate',
        is_active: 'Y',
    },
    {
        name: 'GST 18%',
        code: 'GST-18',
        tax_rate: 18.0,
        description: 'GST at 18% rate',
        is_active: 'Y',
    },
    {
        name: 'GST 28%',
        code: 'GST-28',
        tax_rate: 28.0,
        description: 'GST at 28% rate',
        is_active: 'Y',
    },
    {
        name: 'Exempt Tax',
        code: 'TAX-EXEMPT',
        tax_rate: 0.0,
        description: 'Tax exempted products',
        is_active: 'Y',
    },
];
exports.mockTaxMasters = mockTaxMasters;
async function seedTaxMaster() {
    try {
        for (const taxMaster of mockTaxMasters) {
            const existingTaxMaster = await prisma_client_1.default.tax_master.findFirst({
                where: { code: taxMaster.code },
            });
            if (!existingTaxMaster) {
                await prisma_client_1.default.tax_master.create({
                    data: {
                        name: taxMaster.name,
                        code: taxMaster.code,
                        tax_rate: taxMaster.tax_rate,
                        description: taxMaster.description || null,
                        is_active: taxMaster.is_active,
                        createdate: new Date(),
                        createdby: 1,
                        log_inst: 1,
                    },
                });
            }
        }
        logger_1.default.success('Tax masters seeded successfully!');
    }
    catch (error) {
        logger_1.default.error('Error seeding tax masters:', error);
        throw error;
    }
}
async function clearTaxMaster() {
    try {
        await prisma_client_1.default.tax_master.deleteMany({});
        logger_1.default.info('All tax masters cleared successfully');
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            logger_1.default.warn('⚠️  Could not clear all tax masters due to foreign key constraints. Some records may be in use by products.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=taxMaster.seeder.js.map