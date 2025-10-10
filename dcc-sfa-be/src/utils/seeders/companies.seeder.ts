/**
 * @fileoverview Companies Seeder
 * @description Creates 11 sample companies for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

// Mock Companies Data (11 companies)
const mockCompanies: MockCompany[] = [
  {
    name: 'DCC Corporation',
    code: 'DCC-001',
    address: '123 Business District, Tower A',
    city: 'New York',
    state: 'NY',
    zipcode: '10001',
    phone_number: '+1-212-555-0100',
    email: 'info@dcc-corp.com',
    is_active: 'Y',
  },
  {
    name: 'Tech Solutions Inc',
    code: 'TSI-002',
    address: '456 Innovation Drive, Suite 200',
    city: 'San Francisco',
    state: 'CA',
    zipcode: '94102',
    phone_number: '+1-415-555-0200',
    email: 'contact@techsolutions.com',
    is_active: 'Y',
  },
  {
    name: 'Global Trading Ltd',
    code: 'GTL-003',
    address: '789 Commerce Plaza, Floor 15',
    city: 'Chicago',
    state: 'IL',
    zipcode: '60601',
    phone_number: '+1-312-555-0300',
    email: 'info@globaltrading.com',
    is_active: 'Y',
  },
  {
    name: 'Manufacturing Plus',
    code: 'MP-004',
    address: '321 Industrial Park, Building B',
    city: 'Detroit',
    state: 'MI',
    zipcode: '48201',
    phone_number: '+1-313-555-0400',
    email: 'sales@manufacturingplus.com',
    is_active: 'Y',
  },
  {
    name: 'Retail Masters',
    code: 'RM-005',
    address: '654 Shopping Center, Unit 300',
    city: 'Miami',
    state: 'FL',
    zipcode: '33101',
    phone_number: '+1-305-555-0500',
    email: 'support@retailmasters.com',
    is_active: 'Y',
  },
  {
    name: 'Logistics Pro',
    code: 'LP-006',
    address: '987 Distribution Hub, Warehouse 1',
    city: 'Atlanta',
    state: 'GA',
    zipcode: '30301',
    phone_number: '+1-404-555-0600',
    email: 'logistics@logisticspro.com',
    is_active: 'Y',
  },
  {
    name: 'Healthcare Solutions',
    code: 'HS-007',
    address: '147 Medical Center, Office 500',
    city: 'Boston',
    state: 'MA',
    zipcode: '02101',
    phone_number: '+1-617-555-0700',
    email: 'info@healthcaresolutions.com',
    is_active: 'Y',
  },
  {
    name: 'Financial Services Group',
    code: 'FSG-008',
    address: '258 Wall Street, Suite 1000',
    city: 'New York',
    state: 'NY',
    zipcode: '10005',
    phone_number: '+1-212-555-0800',
    email: 'contact@financialservices.com',
    is_active: 'Y',
  },
  {
    name: 'Education First',
    code: 'EF-009',
    address: '369 Campus Drive, Building A',
    city: 'Austin',
    state: 'TX',
    zipcode: '73301',
    phone_number: '+1-512-555-0900',
    email: 'info@educationfirst.com',
    is_active: 'Y',
  },
  {
    name: 'Energy Corp',
    code: 'EC-010',
    address: '741 Power Plant Road, Control Room',
    city: 'Houston',
    state: 'TX',
    zipcode: '77001',
    phone_number: '+1-713-555-1000',
    email: 'operations@energycorp.com',
    is_active: 'Y',
  },
  {
    name: 'Defunct Industries',
    code: 'DI-011',
    address: '852 Closed Street, Empty Building',
    city: 'Cleveland',
    state: 'OH',
    zipcode: '44101',
    phone_number: '+1-216-555-1100',
    email: 'info@defunctindustries.com',
    is_active: 'N',
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
