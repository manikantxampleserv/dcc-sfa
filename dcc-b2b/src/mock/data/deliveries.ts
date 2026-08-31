import dayjs from 'dayjs';

export type DeliveryStatus = 'scheduled' | 'out_for_delivery' | 'delivered' | 'failed' | 'rescheduled';
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type ReturnReason = 'damaged' | 'shortage' | 'wrong_product' | 'quality_issue' | 'late_delivery';

export interface Delivery {
  id: number;
  order_number: string;
  driver_name: string;
  driver_phone: string;
  vehicle_plate: string;
  status: DeliveryStatus;
  scheduled_date: string;
  delivered_at?: string;
  delivery_address: string;
  pod_image?: string;
  pod_lat?: number;
  pod_lng?: number;
  notes?: string;
  items_count: number;
  total_amount: number;
}

export interface ReturnRequest {
  id: number;
  order_number: string;
  reason: ReturnReason;
  description: string;
  items_count: number;
  total_value: number;
  status: ReturnStatus;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

const today = dayjs();

export const mockDeliveries: Delivery[] = [
  {
    id: 1,
    order_number: 'B2B-2026-0001',
    driver_name: 'John Mbeki',
    driver_phone: '+255 713 456 789',
    vehicle_plate: 'T 234 XYZ',
    status: 'delivered',
    scheduled_date: today.subtract(7, 'day').format('YYYY-MM-DD'),
    delivered_at: today.subtract(7, 'day').format('YYYY-MM-DD HH:mm'),
    delivery_address: '45 Kariakoo Market Street, Dar es Salaam',
    pod_lat: -6.8235,
    pod_lng: 39.2695,
    notes: 'Delivered to warehouse manager. All items confirmed.',
    items_count: 1350,
    total_amount: 4850000,
  },
  {
    id: 2,
    order_number: 'B2B-2026-0002',
    driver_name: 'Peter Odhiambo',
    driver_phone: '+255 756 789 012',
    vehicle_plate: 'T 567 ABC',
    status: 'out_for_delivery',
    scheduled_date: today.add(1, 'day').format('YYYY-MM-DD'),
    delivery_address: '45 Kariakoo Market Street, Dar es Salaam',
    items_count: 790,
    total_amount: 2340000,
  },
  {
    id: 3,
    order_number: 'B2B-2026-0005',
    driver_name: 'James Kiiza',
    driver_phone: '+255 768 234 567',
    vehicle_plate: 'T 890 DEF',
    status: 'scheduled',
    scheduled_date: today.add(2, 'day').format('YYYY-MM-DD'),
    delivery_address: '12 Mwembe Tayari Road, Mombasa',
    items_count: 2670,
    total_amount: 5670000,
  },
  {
    id: 4,
    order_number: 'B2B-2026-OLD-01',
    driver_name: 'John Mbeki',
    driver_phone: '+255 713 456 789',
    vehicle_plate: 'T 234 XYZ',
    status: 'failed',
    scheduled_date: today.subtract(20, 'day').format('YYYY-MM-DD'),
    delivery_address: '33 Uhuru Street, Dodoma',
    notes: 'Customer not available. Rescheduled for next week.',
    items_count: 400,
    total_amount: 1200000,
  },
];

export const mockReturns: ReturnRequest[] = [
  {
    id: 1,
    order_number: 'B2B-2026-0001',
    reason: 'damaged',
    description: 'Received 20 bottles of Bonite Water 500ml with broken caps. Cannot be sold.',
    items_count: 20,
    total_value: 30000,
    status: 'approved',
    created_at: today.subtract(6, 'day').toISOString(),
    resolved_at: today.subtract(4, 'day').toISOString(),
    resolution_notes: 'Credit note CN-2026-0045 issued. Will be deducted from next invoice.',
  },
  {
    id: 2,
    order_number: 'B2B-2026-OLD-01',
    reason: 'shortage',
    description: 'Order shows 300 units of Energy Drink 250ml but only 260 units received.',
    items_count: 40,
    total_value: 112000,
    status: 'completed',
    created_at: today.subtract(15, 'day').toISOString(),
    resolved_at: today.subtract(10, 'day').toISOString(),
    resolution_notes: 'Missing 40 units delivered in follow-up shipment.',
  },
  {
    id: 3,
    order_number: 'B2B-2026-0002',
    reason: 'quality_issue',
    description: 'Soda Lemon batch has unusual taste – possibly expired stock.',
    items_count: 48,
    total_value: 84000,
    status: 'pending',
    created_at: today.subtract(1, 'day').toISOString(),
  },
];
