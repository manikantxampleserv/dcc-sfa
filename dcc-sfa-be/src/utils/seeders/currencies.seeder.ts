/**
 * @fileoverview Currencies Seeder
 * @description Creates 11 sample currencies for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockCurrency {
  code: string;
  name: string;
  symbol?: string;
  exchange_rate_to_base?: number;
  is_base?: string;
  is_active: string;
}

// Mock Currencies Data (11 currencies)
const mockCurrencies: MockCurrency[] = [
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

/**
 * Seed Currencies with mock data
 */
export async function seedCurrencies(): Promise<void> {
  try {
    for (const currency of mockCurrencies) {
      const existingCurrency = await prisma.currencies.findFirst({
        where: { code: currency.code },
      });

      if (!existingCurrency) {
        await prisma.currencies.create({
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
  } catch (error) {
    throw error;
  }
}

/**
 * Clear Currencies data
 */
export async function clearCurrencies(): Promise<void> {
  try {
    await prisma.currencies.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockCurrencies };
