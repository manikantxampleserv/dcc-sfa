/**
 * @fileoverview Customers Seeder
 * @description Creates 11 sample customers for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MockCustomer {
  name: string;
  code: string;
  type?: string;
  contact_person?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  zones_id?: number;
  is_active: string;
}

// Mock Customers Data (11 customers)
const mockCustomers: MockCustomer[] = [
  {
    name: 'ABC Retail Store',
    code: 'CUST-001',
    type: 'Retail',
    contact_person: 'John Smith',
    email: 'john@abcretail.com',
    phone_number: '+1-555-1001',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipcode: '10001',
    zones_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'XYZ Wholesale',
    code: 'CUST-002',
    type: 'Wholesale',
    contact_person: 'Jane Doe',
    email: 'jane@xyzwholesale.com',
    phone_number: '+1-555-1002',
    address: '456 Commerce Ave',
    city: 'Atlanta',
    state: 'GA',
    zipcode: '30301',
    zones_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Tech Solutions Inc',
    code: 'CUST-003',
    type: 'Corporate',
    contact_person: 'Mike Johnson',
    email: 'mike@techsolutions.com',
    phone_number: '+1-555-1003',
    address: '789 Tech Drive',
    city: 'Los Angeles',
    state: 'CA',
    zipcode: '90001',
    zones_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Food Mart Chain',
    code: 'CUST-004',
    type: 'Retail',
    contact_person: 'Sarah Wilson',
    email: 'sarah@foodmart.com',
    phone_number: '+1-555-1004',
    address: '321 Food Street',
    city: 'Chicago',
    state: 'IL',
    zipcode: '60601',
    zones_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Industrial Supplies Co',
    code: 'CUST-005',
    type: 'Industrial',
    contact_person: 'David Brown',
    email: 'david@industrialsupplies.com',
    phone_number: '+1-555-1005',
    address: '654 Industrial Blvd',
    city: 'Miami',
    state: 'FL',
    zipcode: '33101',
    zones_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Health Plus Pharmacy',
    code: 'CUST-006',
    type: 'Healthcare',
    contact_person: 'Lisa Garcia',
    email: 'lisa@healthplus.com',
    phone_number: '+1-555-1006',
    address: '987 Health Lane',
    city: 'Denver',
    state: 'CO',
    zipcode: '80201',
    zones_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Auto Parts Direct',
    code: 'CUST-007',
    type: 'Automotive',
    contact_person: 'Tom Anderson',
    email: 'tom@autopartsdirect.com',
    phone_number: '+1-555-1007',
    address: '147 Auto Street',
    city: 'Phoenix',
    state: 'AZ',
    zipcode: '85001',
    zones_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Office Supply Hub',
    code: 'CUST-008',
    type: 'Corporate',
    contact_person: 'Alex Martinez',
    email: 'alex@officesupplyhub.com',
    phone_number: '+1-555-1008',
    address: '258 Office Plaza',
    city: 'Seattle',
    state: 'WA',
    zipcode: '98101',
    zones_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Sports Equipment Store',
    code: 'CUST-009',
    type: 'Retail',
    contact_person: 'Emma Davis',
    email: 'emma@sportsequipment.com',
    phone_number: '+1-555-1009',
    address: '369 Sports Ave',
    city: 'Houston',
    state: 'TX',
    zipcode: '77001',
    zones_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Electronics Outlet',
    code: 'CUST-010',
    type: 'Retail',
    contact_person: 'Chris Taylor',
    email: 'chris@electronicsoutlet.com',
    phone_number: '+1-555-1010',
    address: '741 Electronics Blvd',
    city: 'Minneapolis',
    state: 'MN',
    zipcode: '55401',
    zones_id: undefined,
    is_active: 'Y',
  },
  {
    name: 'Closed Business',
    code: 'CUST-011',
    type: 'Retail',
    contact_person: 'Closed Owner',
    email: 'closed@business.com',
    phone_number: '+1-555-1011',
    address: '852 Closed Street',
    city: 'Cleveland',
    state: 'OH',
    zipcode: '44101',
    zones_id: undefined,
    is_active: 'N',
  },
];

/**
 * Seed Customers with mock data
 */
export async function seedCustomers(): Promise<void> {
  try {
    for (const customer of mockCustomers) {
      const existingCustomer = await prisma.customers.findFirst({
        where: { name: customer.name },
      });

      if (!existingCustomer) {
        await prisma.customers.create({
          data: {
            name: customer.name,
            code: customer.code,
            type: customer.type,
            contact_person: customer.contact_person,
            email: customer.email,
            phone_number: customer.phone_number,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zipcode: customer.zipcode,
            zones_id: customer.zones_id,
            is_active: customer.is_active,
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
 * Clear Customers data
 */
export async function clearCustomers(): Promise<void> {
  try {
    await prisma.customers.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockCustomers };
