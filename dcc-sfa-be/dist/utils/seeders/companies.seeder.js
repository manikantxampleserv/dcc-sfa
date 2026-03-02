"use strict";
/**
 * @fileoverview Companies Seeder
 * @description Creates 11 sample companies for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockCompanies = void 0;
exports.seedCompanies = seedCompanies;
exports.clearCompanies = clearCompanies;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
// Mock Companies Data (11 companies)
const mockCompanies = [
    {
        name: 'Ampleserv Technologies Pvt Ltd',
        code: 'AMP-001',
        address: 'G-37, Sector 3, Noida, Uttar Pradesh, India',
        city: 'Noida',
        state: 'Uttar Pradesh',
        zipcode: '201301',
        phone_number: '+91-9818000000',
        email: 'info@ampleserv.com',
        is_active: 'Y',
    },
];
exports.mockCompanies = mockCompanies;
/**
 * Seed Companies with mock data
 */
async function seedCompanies() {
    try {
        for (const company of mockCompanies) {
            const existingCompany = await prisma_client_1.default.companies.findFirst({
                where: { name: company.name },
            });
            if (!existingCompany) {
                await prisma_client_1.default.companies.create({
                    data: {
                        name: company.name,
                        code: company.code,
                        address: company.address,
                        city: company.city,
                        state: company.state,
                        zipcode: company.zipcode,
                        phone_number: company.phone_number,
                        email: company.email,
                        is_active: company.is_active,
                        created_date: new Date(),
                        created_by: 1,
                        log_inst: 1,
                    },
                });
            }
        }
    }
    catch (error) {
        throw error;
    }
}
/**
 * Clear Companies data
 */
async function clearCompanies() {
    try {
        await prisma_client_1.default.companies.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=companies.seeder.js.map