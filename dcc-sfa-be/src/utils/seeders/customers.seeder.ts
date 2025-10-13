/**
 * @fileoverview Customers Seeder
 * @description Creates 100,000 random customers for testing and development
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

// Sample data for random generation
const businessTypes = [
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
const firstNames = [
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
const lastNames = [
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
const cities = [
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
const states = [
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
const streetTypes = [
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
const businessSuffixes = [
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

// Generate random customer data
function generateRandomCustomer(index: number): MockCustomer {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const businessType =
    businessTypes[Math.floor(Math.random() * businessTypes.length)];
  const suffix =
    businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const streetType =
    streetTypes[Math.floor(Math.random() * streetTypes.length)];

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
    email: email,
    phone_number: phoneNumber,
    address: `${streetNumber} ${city} ${streetType}`,
    city: city,
    state: state,
    zipcode: zipcode.toString(),
    zones_id: Math.floor(Math.random() * 10) + 1, // Random zone between 1-10
    is_active: Math.random() > 0.1 ? 'Y' : 'N', // 90% active, 10% inactive
  };
}

/**
 * Seed Customers with 100,000 random customers
 */
export async function seedCustomers(): Promise<void> {
  try {
    const totalCustomers = 100000;
    const batchSize = 1000; // Process in batches of 1000
    const totalBatches = Math.ceil(totalCustomers / batchSize);

    console.log(
      `Starting to seed ${totalCustomers} customers in ${totalBatches} batches...`
    );

    for (let batch = 0; batch < totalBatches; batch++) {
      const startIndex = batch * batchSize;
      const endIndex = Math.min(startIndex + batchSize, totalCustomers);
      const batchSizeActual = endIndex - startIndex;

      console.log(
        `Processing batch ${batch + 1}/${totalBatches} (customers ${startIndex + 1}-${endIndex})...`
      );

      // Generate batch of customers
      const customers = [];
      for (let i = startIndex; i < endIndex; i++) {
        customers.push(generateRandomCustomer(i));
      }

      // Insert batch using createMany for better performance
      await prisma.customers.createMany({
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

      console.log(
        `Batch ${batch + 1} completed. Inserted ${batchSizeActual} customers.`
      );
    }

    console.log(`Successfully seeded ${totalCustomers} customers!`);
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

/**
 * Clear Customers data
 */
export async function clearCustomers(): Promise<void> {
  try {
    console.log('Clearing all customers...');
    const result = await prisma.customers.deleteMany({});
    console.log(`Cleared ${result.count} customers.`);
  } catch (error) {
    console.error('Error clearing customers:', error);
    throw error;
  }
}
