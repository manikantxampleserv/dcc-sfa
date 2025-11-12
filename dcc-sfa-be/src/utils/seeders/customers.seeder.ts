import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

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

const BUSINESS_TYPES = [
  'Retail',
  'Wholesale',
  'Corporate',
  'Industrial',
  'Healthcare',
  'Automotive',
  'Restaurant',
  'Service',
  'Manufacturing',
  'Distribution',
];

const FIRST_NAMES = [
  'John',
  'Jane',
  'Mike',
  'Sarah',
  'David',
  'Lisa',
  'Tom',
  'Alex',
  'Emma',
  'Chris',
  'Maria',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Elizabeth',
  'James',
  'Patricia',
  'Richard',
];

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
];

const CITIES = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose',
  'Austin',
  'Jacksonville',
  'Fort Worth',
  'Columbus',
  'Charlotte',
  'San Francisco',
  'Indianapolis',
  'Seattle',
  'Denver',
  'Washington',
];

const STATES = [
  'NY',
  'CA',
  'IL',
  'TX',
  'AZ',
  'PA',
  'FL',
  'OH',
  'NC',
  'WA',
  'CO',
  'DC',
  'IN',
  'GA',
  'MI',
  'VA',
  'TN',
  'MA',
  'MD',
  'WI',
];

const STREET_TYPES = [
  'Street',
  'Avenue',
  'Road',
  'Drive',
  'Lane',
  'Boulevard',
  'Court',
  'Place',
  'Way',
  'Circle',
];

const BUSINESS_SUFFIXES = [
  'Store',
  'Shop',
  'Mart',
  'Center',
  'Hub',
  'Outlet',
  'Market',
  'Plaza',
  'Mall',
  'Depot',
  'Warehouse',
  'Distributors',
  'Suppliers',
  'Services',
  'Solutions',
  'Group',
  'Corp',
  'Inc',
  'LLC',
  'Co',
];

function generateRandomCustomer(
  index: number,
  zoneIds: number[]
): MockCustomer {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const businessType =
    BUSINESS_TYPES[Math.floor(Math.random() * BUSINESS_TYPES.length)];
  const suffix =
    BUSINESS_SUFFIXES[Math.floor(Math.random() * BUSINESS_SUFFIXES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const state = STATES[Math.floor(Math.random() * STATES.length)];
  const streetType =
    STREET_TYPES[Math.floor(Math.random() * STREET_TYPES.length)];

  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const zipcode = Math.floor(Math.random() * 90000) + 10000;
  const phoneNumber = `+1-555-${Math.floor(Math.random() * 9000) + 1000}`;
  const businessName = `${businessType} ${suffix} ${index + 1}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${businessName.toLowerCase().replace(/\s+/g, '')}.com`;

  return {
    name: businessName,
    code: `CUST-${(index + 1).toString().padStart(6, '0')}`,
    type: businessType,
    contact_person: `${firstName} ${lastName}`,
    email,
    phone_number: phoneNumber,
    address: `${streetNumber} ${city} ${streetType}`,
    city,
    state,
    zipcode: zipcode.toString(),
    zones_id: zoneIds[Math.floor(Math.random() * zoneIds.length)],
    is_active: Math.random() > 0.1 ? 'Y' : 'N',
  };
}

export async function seedCustomers(): Promise<void> {
  const TOTAL_CUSTOMERS = 100000;
  const BATCH_SIZE = 1000;
  const totalBatches = Math.ceil(TOTAL_CUSTOMERS / BATCH_SIZE);

  // Get available zone IDs to ensure valid foreign key references
  const availableZones = await prisma.zones.findMany({
    select: { id: true },
    where: { is_active: 'Y' },
  });

  if (availableZones.length === 0) {
    return;
  }

  const zoneIds = availableZones.map(zone => zone.id);

  for (let batch = 0; batch < totalBatches; batch++) {
    const startIndex = batch * BATCH_SIZE;
    const endIndex = Math.min(startIndex + BATCH_SIZE, TOTAL_CUSTOMERS);

    const customers = Array.from({ length: endIndex - startIndex }, (_, i) =>
      generateRandomCustomer(startIndex + i, zoneIds)
    );

    try {
      const result = await prisma.customers.createMany({
        data: customers.map(customer => ({
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
        })),
      });
      logger.info(
        `Batch ${batch + 1}/${totalBatches} completed (${result.count} customers created)`
      );
    } catch (error: any) {
      logger.info(`Batch ${batch + 1}/${totalBatches} Skipped`);
    }
  }
}

export async function clearCustomers(): Promise<void> {
  await prisma.customers.deleteMany({});
}
