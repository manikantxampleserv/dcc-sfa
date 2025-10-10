/**
 * @fileoverview Visits Seeder
 * @description Creates 11 sample visits for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MockVisit {
  customer_id: number;
  sales_person_id: number;
  route_id?: number;
  zones_id?: number;
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
    customer_id: 1,
    sales_person_id: 1,
    route_id: 1,
    zones_id: 1,
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
    customer_id: 2,
    sales_person_id: 2,
    route_id: 2,
    zones_id: 2,
    visit_date: new Date('2024-01-16'),
    visit_time: '10:30',
    purpose: 'delivery',
    status: 'completed',
    start_time: new Date('2024-01-16T10:30:00'),
    end_time: new Date('2024-01-16T11:15:00'),
    duration: 45,
    start_latitude: 33.749,
    start_longitude: -84.388,
    end_latitude: 33.749,
    end_longitude: -84.388,
    check_in_time: new Date('2024-01-16T10:30:00'),
    check_out_time: new Date('2024-01-16T11:15:00'),
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Product delivery completed successfully',
    customer_feedback: 'Delivery was on time',
    next_visit_date: new Date('2024-02-16'),
    is_active: 'Y',
  },
  {
    customer_id: 3,
    sales_person_id: 3,
    route_id: 3,
    zones_id: 3,
    visit_date: new Date('2024-01-17'),
    visit_time: '14:00',
    purpose: 'follow-up',
    status: 'completed',
    start_time: new Date('2024-01-17T14:00:00'),
    end_time: new Date('2024-01-17T15:00:00'),
    duration: 60,
    start_latitude: 34.0522,
    start_longitude: -118.2437,
    end_latitude: 34.0522,
    end_longitude: -118.2437,
    check_in_time: new Date('2024-01-17T14:00:00'),
    check_out_time: new Date('2024-01-17T15:00:00'),
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Follow-up visit for previous order',
    customer_feedback: 'Good follow-up service',
    next_visit_date: new Date('2024-02-17'),
    is_active: 'Y',
  },
  {
    customer_id: 4,
    sales_person_id: 4,
    route_id: 4,
    zones_id: 4,
    visit_date: new Date('2024-01-18'),
    visit_time: '11:15',
    purpose: 'service',
    status: 'completed',
    start_time: new Date('2024-01-18T11:15:00'),
    end_time: new Date('2024-01-18T12:00:00'),
    duration: 45,
    start_latitude: 41.8781,
    start_longitude: -87.6298,
    end_latitude: 41.8781,
    end_longitude: -87.6298,
    check_in_time: new Date('2024-01-18T11:15:00'),
    check_out_time: new Date('2024-01-18T12:00:00'),
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Resolved customer complaint',
    customer_feedback: 'Issue resolved satisfactorily',
    next_visit_date: new Date('2024-02-18'),
    is_active: 'Y',
  },
  {
    customer_id: 5,
    sales_person_id: 5,
    route_id: 5,
    zones_id: 5,
    visit_date: new Date('2024-01-19'),
    visit_time: '13:45',
    purpose: 'demo',
    status: 'completed',
    start_time: new Date('2024-01-19T13:45:00'),
    end_time: new Date('2024-01-19T14:30:00'),
    duration: 45,
    start_latitude: 25.7617,
    start_longitude: -80.1918,
    end_latitude: 25.7617,
    end_longitude: -80.1918,
    check_in_time: new Date('2024-01-19T13:45:00'),
    check_out_time: new Date('2024-01-19T14:30:00'),
    orders_created: 1,
    amount_collected: 199.99,
    visit_notes: 'Product demonstration completed',
    customer_feedback: 'Demo was very informative',
    next_visit_date: new Date('2024-02-19'),
    is_active: 'Y',
  },
  {
    customer_id: 6,
    sales_person_id: 6,
    route_id: 6,
    zones_id: 6,
    visit_date: new Date('2024-01-20'),
    visit_time: '08:30',
    purpose: 'collection',
    status: 'completed',
    start_time: new Date('2024-01-20T08:30:00'),
    end_time: new Date('2024-01-20T09:00:00'),
    duration: 30,
    start_latitude: 39.7392,
    start_longitude: -104.9903,
    end_latitude: 39.7392,
    end_longitude: -104.9903,
    check_in_time: new Date('2024-01-20T08:30:00'),
    check_out_time: new Date('2024-01-20T09:00:00'),
    orders_created: 0,
    amount_collected: 500.0,
    visit_notes: 'Payment collection visit',
    customer_feedback: 'Payment process was smooth',
    next_visit_date: new Date('2024-02-20'),
    is_active: 'Y',
  },
  {
    customer_id: 7,
    sales_person_id: 7,
    route_id: 7,
    zones_id: 7,
    visit_date: new Date('2024-01-21'),
    visit_time: '15:20',
    purpose: 'survey',
    status: 'completed',
    start_time: new Date('2024-01-21T15:20:00'),
    end_time: new Date('2024-01-21T16:00:00'),
    duration: 40,
    start_latitude: 33.4484,
    start_longitude: -112.074,
    end_latitude: 33.4484,
    end_longitude: -112.074,
    check_in_time: new Date('2024-01-21T15:20:00'),
    check_out_time: new Date('2024-01-21T16:00:00'),
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Customer satisfaction survey conducted',
    customer_feedback: 'Overall satisfaction is high',
    next_visit_date: new Date('2024-02-21'),
    is_active: 'Y',
  },
  {
    customer_id: 8,
    sales_person_id: 8,
    route_id: 8,
    zones_id: 8,
    visit_date: new Date('2024-01-22'),
    visit_time: '12:00',
    purpose: 'sales',
    status: 'in-progress',
    start_time: new Date('2024-01-22T12:00:00'),
    end_time: undefined,
    duration: undefined,
    start_latitude: 47.6062,
    start_longitude: -122.3321,
    end_latitude: undefined,
    end_longitude: undefined,
    check_in_time: new Date('2024-01-22T12:00:00'),
    check_out_time: undefined,
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Ongoing sales discussion',
    customer_feedback: undefined,
    next_visit_date: new Date('2024-02-22'),
    is_active: 'Y',
  },
  {
    customer_id: 9,
    sales_person_id: 9,
    route_id: 9,
    zones_id: 9,
    visit_date: new Date('2024-01-23'),
    visit_time: '16:30',
    purpose: 'delivery',
    status: 'scheduled',
    start_time: undefined,
    end_time: undefined,
    duration: undefined,
    start_latitude: undefined,
    start_longitude: undefined,
    end_latitude: undefined,
    end_longitude: undefined,
    check_in_time: undefined,
    check_out_time: undefined,
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Scheduled delivery for tomorrow',
    customer_feedback: undefined,
    next_visit_date: new Date('2024-01-24'),
    is_active: 'Y',
  },
  {
    customer_id: 10,
    sales_person_id: 10,
    route_id: 10,
    zones_id: 10,
    visit_date: new Date('2024-01-24'),
    visit_time: '09:45',
    purpose: 'follow-up',
    status: 'completed',
    start_time: new Date('2024-01-24T09:45:00'),
    end_time: new Date('2024-01-24T10:30:00'),
    duration: 45,
    start_latitude: 44.9778,
    start_longitude: -93.265,
    end_latitude: 44.9778,
    end_longitude: -93.265,
    check_in_time: new Date('2024-01-24T09:45:00'),
    check_out_time: new Date('2024-01-24T10:30:00'),
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Follow-up visit completed successfully',
    customer_feedback: 'Good follow-up service',
    next_visit_date: new Date('2024-02-24'),
    is_active: 'Y',
  },
  {
    customer_id: 11,
    sales_person_id: 11,
    route_id: 11,
    zones_id: 11,
    visit_date: new Date('2024-01-25'),
    visit_time: '10:00',
    purpose: 'sales',
    status: 'cancelled',
    start_time: undefined,
    end_time: undefined,
    duration: undefined,
    start_latitude: undefined,
    start_longitude: undefined,
    end_latitude: undefined,
    end_longitude: undefined,
    check_in_time: undefined,
    check_out_time: undefined,
    orders_created: 0,
    amount_collected: 0.0,
    visit_notes: 'Visit cancelled by customer',
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
    for (const visit of mockVisits) {
      const existingVisit = await prisma.visits.findFirst({
        where: {
          visit_date: visit.visit_date,
          customer_id: visit.customer_id,
          sales_person_id: visit.sales_person_id,
        },
      });

      if (!existingVisit) {
        await prisma.visits.create({
          data: {
            customer_id: visit.customer_id,
            sales_person_id: visit.sales_person_id,
            route_id: visit.route_id,
            zones_id: visit.zones_id,
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
      }
    }
  } catch (error) {
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
