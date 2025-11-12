/**
 * @fileoverview Visits Seeder
 * @description Creates 11 sample visits for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockVisit {
  customer_name: string;
  route_name: string;
  zone_name: string;
  visit_date?: Date;
  visit_time?: string;
  purpose?: string;
  status?: string;
  start_time?: Date;
  end_time?: Date;
  duration?: number;
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
  check_in_time?: Date;
  check_out_time?: Date;
  orders_created?: number;
  amount_collected?: number;
  visit_notes?: string;
  customer_feedback?: string;
  next_visit_date?: Date;
  is_active: string;
}

// Mock Visits Data (11 visits)
const mockVisits: MockVisit[] = [
  {
    customer_name: 'TechCorp Solutions',
    route_name: 'North Downtown Route',
    zone_name: 'North Zone',
    visit_date: new Date('2024-01-15'),
    visit_time: '09:00',
    purpose: 'sales',
    status: 'completed',
    start_time: new Date('2024-01-15T09:00:00'),
    end_time: new Date('2024-01-15T10:30:00'),
    duration: 90,
    start_latitude: 40.7128,
    start_longitude: -74.006,
    end_latitude: 40.7128,
    end_longitude: -74.006,
    check_in_time: new Date('2024-01-15T09:00:00'),
    check_out_time: new Date('2024-01-15T10:30:00'),
    orders_created: 1,
    amount_collected: 999.99,
    visit_notes: 'Successful sales call, customer interested in new products',
    customer_feedback: 'Very satisfied with the service',
    next_visit_date: new Date('2024-02-15'),
    is_active: 'Y',
  },
  {
    customer_name: 'Global Industries',
    route_name: 'South Business District',
    zone_name: 'South Zone',
    visit_date: new Date('2024-01-16'),
    visit_time: '10:00',
    purpose: 'delivery',
    status: 'completed',
    start_time: new Date('2024-01-16T10:00:00'),
    end_time: new Date('2024-01-16T11:00:00'),
    duration: 60,
    start_latitude: 40.7589,
    start_longitude: -73.9851,
    end_latitude: 40.7589,
    end_longitude: -73.9851,
    check_in_time: new Date('2024-01-16T10:00:00'),
    check_out_time: new Date('2024-01-16T11:00:00'),
    orders_created: 0,
    amount_collected: 1200.0,
    visit_notes: 'Delivery completed successfully',
    customer_feedback: 'Good service',
    next_visit_date: new Date('2024-02-16'),
    is_active: 'Y',
  },
  {
    customer_name: 'Metro Logistics',
    route_name: 'West Industrial Zone',
    zone_name: 'West Zone',
    visit_date: new Date('2024-01-17'),
    visit_time: '14:00',
    purpose: 'collection',
    status: 'completed',
    start_time: new Date('2024-01-17T14:00:00'),
    end_time: new Date('2024-01-17T15:30:00'),
    duration: 90,
    start_latitude: 40.7282,
    start_longitude: -74.0776,
    end_latitude: 40.7282,
    end_longitude: -74.0776,
    check_in_time: new Date('2024-01-17T14:00:00'),
    check_out_time: new Date('2024-01-17T15:30:00'),
    orders_created: 2,
    amount_collected: 2500.0,
    visit_notes: 'Payment collected, new orders placed',
    customer_feedback: 'Excellent service',
    next_visit_date: new Date('2024-02-17'),
    is_active: 'Y',
  },
  {
    customer_name: 'Coastal Enterprises',
    route_name: 'East Residential Area',
    zone_name: 'East Zone',
    visit_date: new Date('2024-01-18'),
    visit_time: '11:00',
    purpose: 'survey',
    status: 'completed',
    start_time: new Date('2024-01-18T11:00:00'),
    end_time: new Date('2024-01-18T12:00:00'),
    duration: 60,
    start_latitude: 40.6892,
    start_longitude: -74.0445,
    end_latitude: 40.6892,
    end_longitude: -74.0445,
    check_in_time: new Date('2024-01-18T11:00:00'),
    check_out_time: new Date('2024-01-18T12:00:00'),
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Market survey conducted',
    customer_feedback: 'Cooperative customer',
    next_visit_date: new Date('2024-02-18'),
    is_active: 'Y',
  },
  {
    customer_name: 'Mountain Supply Co',
    route_name: 'Central Mall Circuit',
    zone_name: 'Central Zone',
    visit_date: new Date('2024-01-19'),
    visit_time: '13:00',
    purpose: 'maintenance',
    status: 'completed',
    start_time: new Date('2024-01-19T13:00:00'),
    end_time: new Date('2024-01-19T14:30:00'),
    duration: 90,
    start_latitude: 40.7505,
    start_longitude: -73.9934,
    end_latitude: 40.7505,
    end_longitude: -73.9934,
    check_in_time: new Date('2024-01-19T13:00:00'),
    check_out_time: new Date('2024-01-19T14:30:00'),
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Equipment maintenance completed',
    customer_feedback: 'Satisfied with maintenance',
    next_visit_date: new Date('2024-02-19'),
    is_active: 'Y',
  },
  {
    customer_name: 'TechCorp Solutions',
    route_name: 'Suburban Express',
    zone_name: 'Suburban Zone',
    visit_date: new Date('2024-01-20'),
    visit_time: '15:00',
    purpose: 'sales',
    status: 'pending',
    start_time: new Date('2024-01-20T15:00:00'),
    end_time: undefined,
    duration: 0,
    start_latitude: 40.7831,
    start_longitude: -73.9712,
    end_latitude: undefined,
    end_longitude: undefined,
    check_in_time: new Date('2024-01-20T15:00:00'),
    check_out_time: undefined,
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Visit in progress',
    customer_feedback: undefined,
    next_visit_date: undefined,
    is_active: 'Y',
  },
  {
    customer_name: 'Global Industries',
    route_name: 'University District',
    zone_name: 'University Zone',
    visit_date: new Date('2024-01-21'),
    visit_time: '16:00',
    purpose: 'delivery',
    status: 'scheduled',
    start_time: undefined,
    end_time: undefined,
    duration: 0,
    start_latitude: undefined,
    start_longitude: undefined,
    end_latitude: undefined,
    end_longitude: undefined,
    check_in_time: undefined,
    check_out_time: undefined,
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Scheduled for delivery',
    customer_feedback: undefined,
    next_visit_date: undefined,
    is_active: 'Y',
  },
  {
    customer_name: 'Metro Logistics',
    route_name: 'Coastal Highway',
    zone_name: 'Coastal Zone',
    visit_date: new Date('2024-01-22'),
    visit_time: '08:00',
    purpose: 'collection',
    status: 'cancelled',
    start_time: undefined,
    end_time: undefined,
    duration: 0,
    start_latitude: undefined,
    start_longitude: undefined,
    end_latitude: undefined,
    end_longitude: undefined,
    check_in_time: undefined,
    check_out_time: undefined,
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Visit cancelled due to weather',
    customer_feedback: undefined,
    next_visit_date: new Date('2024-01-29'),
    is_active: 'N',
  },
  {
    customer_name: 'Coastal Enterprises',
    route_name: 'Port Authority Route',
    zone_name: 'Port Zone',
    visit_date: new Date('2024-01-23'),
    visit_time: '12:00',
    purpose: 'survey',
    status: 'completed',
    start_time: new Date('2024-01-23T12:00:00'),
    end_time: new Date('2024-01-23T13:15:00'),
    duration: 75,
    start_latitude: 40.6441,
    start_longitude: -74.0123,
    end_latitude: 40.6441,
    end_longitude: -74.0123,
    check_in_time: new Date('2024-01-23T12:00:00'),
    check_out_time: new Date('2024-01-23T13:15:00'),
    orders_created: 1,
    amount_collected: 850.0,
    visit_notes: 'Survey completed, new order placed',
    customer_feedback: 'Good experience',
    next_visit_date: new Date('2024-02-23'),
    is_active: 'Y',
  },
  {
    customer_name: 'Mountain Supply Co',
    route_name: 'Mountain Pass Route',
    zone_name: 'Mountain Zone',
    visit_date: new Date('2024-01-24'),
    visit_time: '07:00',
    purpose: 'maintenance',
    status: 'completed',
    start_time: new Date('2024-01-24T07:00:00'),
    end_time: new Date('2024-01-24T09:00:00'),
    duration: 120,
    start_latitude: 39.7392,
    start_longitude: -104.9903,
    end_latitude: 39.7392,
    end_longitude: -104.9903,
    check_in_time: new Date('2024-01-24T07:00:00'),
    check_out_time: new Date('2024-01-24T09:00:00'),
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Equipment servicing completed',
    customer_feedback: 'Professional service',
    next_visit_date: new Date('2024-03-24'),
    is_active: 'Y',
  },
  {
    customer_name: 'Defunct Industries',
    route_name: 'Discontinued Route',
    zone_name: 'Closed Zone',
    visit_date: new Date('2020-01-01'),
    visit_time: '00:00',
    purpose: 'closure',
    status: 'cancelled',
    start_time: undefined,
    end_time: undefined,
    duration: 0,
    start_latitude: undefined,
    start_longitude: undefined,
    end_latitude: undefined,
    end_longitude: undefined,
    check_in_time: undefined,
    check_out_time: undefined,
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Route discontinued',
    customer_feedback: undefined,
    next_visit_date: undefined,
    is_active: 'N',
  },
];

/**
 * Seed Visits with mock data
 */
export async function seedVisits(): Promise<void> {
  try {
    // Get all customers, routes, and zones for lookup
    const customers = await prisma.customers.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const routes = await prisma.routes.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const zones = await prisma.zones.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    if (customers.length === 0) {
      logger.warn('No active customers found. Skipping visits seeding.');
      return;
    }

    if (routes.length === 0) {
      logger.warn('No active routes found. Skipping visits seeding.');
      return;
    }

    if (zones.length === 0) {
      logger.warn('No active zones found. Skipping visits seeding.');
      return;
    }

    let visitsCreated = 0;
    let visitsSkipped = 0;

    for (let i = 0; i < mockVisits.length; i++) {
      const visit = mockVisits[i];

      // Use actual customers, routes, and zones by cycling through them
      const customer = customers[i % customers.length];
      const route =
        routes.find(r => r.name === visit.route_name) ||
        routes[i % routes.length];
      const zone = zones[i % zones.length];

      const existingVisit = await prisma.visits.findFirst({
        where: {
          AND: [{ customer_id: customer.id }, { visit_date: visit.visit_date }],
        },
      });

      if (!existingVisit) {
        await prisma.visits.create({
          data: {
            customer_id: customer.id,
            sales_person_id: 1, // Use admin user ID
            route_id: route.id,
            zones_id: zone.id,
            visit_date: visit.visit_date,
            visit_time: visit.visit_time,
            purpose: visit.purpose,
            status: visit.status,
            start_time: visit.start_time,
            end_time: visit.end_time,
            duration: visit.duration,
            start_latitude: visit.start_latitude,
            start_longitude: visit.start_longitude,
            end_latitude: visit.end_latitude,
            end_longitude: visit.end_longitude,
            check_in_time: visit.check_in_time,
            check_out_time: visit.check_out_time,
            orders_created: visit.orders_created,
            amount_collected: visit.amount_collected,
            visit_notes: visit.visit_notes,
            customer_feedback: visit.customer_feedback,
            next_visit_date: visit.next_visit_date,
            is_active: visit.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });

        visitsCreated++;
      } else {
        visitsSkipped++;
      }
    }

    logger.info(
      `Visits seeding completed: ${visitsCreated} created, ${visitsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding visits:', error);
    throw error;
  }
}

/**
 * Clear Visits data
 */
export async function clearVisits(): Promise<void> {
  try {
    await prisma.visits.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockVisits };
