"use strict";
/**
 * @fileoverview Currencies Seeder
 * @description Creates 11 sample currencies for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockCurrencies = void 0;
exports.seedCurrencies = seedCurrencies;
exports.clearCurrencies = clearCurrencies;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
// Mock Currencies Data (11 currencies)
const mockCurrencies = [
    {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        exchange_rate_to_base: 1.0,
        is_base: 'Y',
        is_active: 'Y',
    },
    {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        exchange_rate_to_base: 0.85,
        is_base: 'N',
        is_active: 'Y',
    },
    {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        exchange_rate_to_base: 0.73,
        is_base: 'N',
        is_active: 'Y',
    },
    {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        exchange_rate_to_base: 110.0,
        is_base: 'N',
        is_active: 'Y',
    },
    {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        exchange_rate_to_base: 1.25,
        is_base: 'N',
        is_active: 'Y',
    },
    {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        exchange_rate_to_base: 1.35,
        is_base: 'N',
        is_active: 'Y',
    },
    {
        code: 'CHF',
        name: 'Swiss Franc',
        symbol: 'CHF',
        exchange_rate_to_base: 0.92,
        is_base: 'N',
        is_active: 'Y',
    },
    {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        exchange_rate_to_base: 6.45,
        is_base: 'N',
        is_active: 'Y',
    },
    {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        exchange_rate_to_base: 74.5,
        is_base: 'N',
        is_active: 'Y',
    },
    {
        code: 'BRL',
        name: 'Brazilian Real',
        symbol: 'R$',
        exchange_rate_to_base: 5.2,
        is_base: 'N',
        is_active: 'Y',
    },
    {
        code: 'DEM',
        name: 'German Mark',
        symbol: 'DM',
        exchange_rate_to_base: 0.0,
        is_base: 'N',
        is_active: 'N',
    },
];
exports.mockCurrencies = mockCurrencies;
/**
 * Seed Currencies with mock data
 */
async function seedCurrencies() {
    try {
        for (const currency of mockCurrencies) {
            const existingCurrency = await prisma_client_1.default.currencies.findFirst({
                where: { code: currency.code },
            });
            if (!existingCurrency) {
                await prisma_client_1.default.currencies.create({
                    data: {
                        code: currency.code,
                        name: currency.name,
                        symbol: currency.symbol,
                        exchange_rate_to_base: currency.exchange_rate_to_base,
                        is_base: currency.is_base,
                        is_active: currency.is_active,
                        createdate: new Date(),
                        createdby: 1,
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
 * Clear Currencies data
 */
async function clearCurrencies() {
    try {
        await prisma_client_1.default.currencies.deleteMany({});
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=currencies.seeder.js.map