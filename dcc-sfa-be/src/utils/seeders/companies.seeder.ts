/**
 * @fileoverview Companies Seeder
 * @description Creates 11 sample companies for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockCompany {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  phone_number?: string;
  email?: string;
  is_active: string;
}

const mockCompanies: MockCompany[] = [
  {
    name: 'BONITE BOTTLERS LIMITED',
    code: 'BBL001',
    address: 'Moshi Tanzania',
    city: 'Moshi',
    state: 'Kilimanjaro',
    zipcode: '1352',
    phone_number: '',
    email: 'admin@bbl.co.tz',
    is_active: 'Y',
  },
];

/**
 * Seed Companies with mock data
 */
export async function seedCompanies(): Promise<void> {
  try {
    for (const company of mockCompanies) {
      const existingCompany = await prisma.companies.findFirst({
        where: { name: company.name },
      });

      if (!existingCompany) {
        await prisma.companies.create({
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
  } catch (error) {
    throw error;
  }
}

/**
 * Clear Companies data
 */
export async function clearCompanies(): Promise<void> {
  try {
    await prisma.companies.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockCompanies };
