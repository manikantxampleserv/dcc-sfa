import dayjs from 'dayjs';

export type OrderStatus = 'draft' | 'pending_approval' | 'approved' | 'in_transit' | 'delivered' | 'cancelled' | 'rejected';

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_sap_code: string;
  status: OrderStatus;
  items: OrderItem[];
  total_amount: number;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  delivery_date?: string;
  notes?: string;
}

const today = dayjs();

export const mockOrders: Order[] = [
  {
    id: 1,
    order_number: 'B2B-2026-0001',
    customer_name: 'Al-Rashid Distributors Ltd',
    customer_sap_code: 'SAP-001234',
    status: 'delivered',
    total_amount: 4850000,
    created_at: today.subtract(10, 'day').toISOString(),
    updated_at: today.subtract(7, 'day').toISOString(),
    approved_by: 'Grace Mwangi',
    approved_at: today.subtract(9, 'day').toISOString(),
    delivery_date: today.subtract(7, 'day').format('YYYY-MM-DD'),
    notes: 'Urgent delivery for festive season stock',
    items: [
      { id: 1, product_id: 1, product_name: 'Bonite Water 500ml', product_code: 'BNT-W-500', category: 'Water', quantity: 200, unit_price: 1500, total_price: 300000 },
      { id: 2, product_id: 2, product_name: 'Bonite Water 1.5L', product_code: 'BNT-W-1500', category: 'Water', quantity: 150, unit_price: 3000, total_price: 450000 },
      { id: 3, product_id: 5, product_name: 'Bonite Soda Orange 500ml', product_code: 'BNT-S-OR-500', category: 'Soda', quantity: 300, unit_price: 1800, total_price: 540000 },
      { id: 4, product_id: 7, product_name: 'Bonite Juice Mango 1L', product_code: 'BNT-J-MG-1L', category: 'Juice', quantity: 200, unit_price: 4200, total_price: 840000 },
      { id: 5, product_id: 9, product_name: 'Bonite Energy Drink 250ml', product_code: 'BNT-E-250', category: 'Energy', quantity: 400, unit_price: 2800, total_price: 1120000 },
      { id: 6, product_id: 11, product_name: 'Bonite Tonic Water 300ml', product_code: 'BNT-T-300', category: 'Tonic', quantity: 500, unit_price: 3200, total_price: 1600000 },
    ],
  },
  {
    id: 2,
    order_number: 'B2B-2026-0002',
    customer_name: 'Al-Rashid Distributors Ltd',
    customer_sap_code: 'SAP-001234',
    status: 'in_transit',
    total_amount: 2340000,
    created_at: today.subtract(3, 'day').toISOString(),
    updated_at: today.subtract(1, 'day').toISOString(),
    approved_by: 'Grace Mwangi',
    approved_at: today.subtract(2, 'day').toISOString(),
    delivery_date: today.add(1, 'day').format('YYYY-MM-DD'),
    items: [
      { id: 7, product_id: 1, product_name: 'Bonite Water 500ml', product_code: 'BNT-W-500', category: 'Water', quantity: 300, unit_price: 1500, total_price: 450000 },
      { id: 8, product_id: 3, product_name: 'Bonite Water 5L', product_code: 'BNT-W-5000', category: 'Water', quantity: 100, unit_price: 8500, total_price: 850000 },
      { id: 9, product_id: 6, product_name: 'Bonite Soda Lemon 500ml', product_code: 'BNT-S-LM-500', category: 'Soda', quantity: 240, unit_price: 1750, total_price: 420000 },
      { id: 10, product_id: 8, product_name: 'Bonite Juice Passion 1L', product_code: 'BNT-J-PS-1L', category: 'Juice', quantity: 150, unit_price: 4133, total_price: 620000 },
    ],
  },
  {
    id: 3,
    order_number: 'B2B-2026-0003',
    customer_name: 'Al-Rashid Distributors Ltd',
    customer_sap_code: 'SAP-001234',
    status: 'pending_approval',
    total_amount: 1875000,
    created_at: today.subtract(1, 'day').toISOString(),
    updated_at: today.subtract(1, 'day').toISOString(),
    notes: 'Please prioritize this order',
    items: [
      { id: 11, product_id: 2, product_name: 'Bonite Water 1.5L', product_code: 'BNT-W-1500', category: 'Water', quantity: 250, unit_price: 3000, total_price: 750000 },
      { id: 12, product_id: 5, product_name: 'Bonite Soda Orange 500ml', product_code: 'BNT-S-OR-500', category: 'Soda', quantity: 300, unit_price: 1800, total_price: 540000 },
      { id: 13, product_id: 10, product_name: 'Bonite Energy Drink 500ml', product_code: 'BNT-E-500', category: 'Energy', quantity: 165, unit_price: 3545, total_price: 585000 },
    ],
  },
  {
    id: 4,
    order_number: 'B2B-2026-0004',
    customer_name: 'Sunrise Traders',
    customer_sap_code: 'SAP-005678',
    status: 'pending_approval',
    total_amount: 3120000,
    created_at: today.subtract(2, 'day').toISOString(),
    updated_at: today.subtract(2, 'day').toISOString(),
    items: [
      { id: 14, product_id: 1, product_name: 'Bonite Water 500ml', product_code: 'BNT-W-500', category: 'Water', quantity: 500, unit_price: 1500, total_price: 750000 },
      { id: 15, product_id: 4, product_name: 'Bonite Water 20L', product_code: 'BNT-W-20000', category: 'Water', quantity: 30, unit_price: 25000, total_price: 750000 },
      { id: 16, product_id: 7, product_name: 'Bonite Juice Mango 1L', product_code: 'BNT-J-MG-1L', category: 'Juice', quantity: 360, unit_price: 4222, total_price: 1520000 },
      { id: 17, product_id: 11, product_name: 'Bonite Tonic Water 300ml', product_code: 'BNT-T-300', category: 'Tonic', quantity: 100, unit_price: 1000, total_price: 100000 },
    ],
  },
  {
    id: 5,
    order_number: 'B2B-2026-0005',
    customer_name: 'Kilimanjaro Wholesale',
    customer_sap_code: 'SAP-009012',
    status: 'approved',
    total_amount: 5670000,
    created_at: today.subtract(5, 'day').toISOString(),
    updated_at: today.subtract(4, 'day').toISOString(),
    approved_by: 'Grace Mwangi',
    approved_at: today.subtract(4, 'day').toISOString(),
    delivery_date: today.add(2, 'day').format('YYYY-MM-DD'),
    items: [
      { id: 18, product_id: 1, product_name: 'Bonite Water 500ml', product_code: 'BNT-W-500', category: 'Water', quantity: 1000, unit_price: 1500, total_price: 1500000 },
      { id: 19, product_id: 2, product_name: 'Bonite Water 1.5L', product_code: 'BNT-W-1500', category: 'Water', quantity: 500, unit_price: 3000, total_price: 1500000 },
      { id: 20, product_id: 5, product_name: 'Bonite Soda Orange 500ml', product_code: 'BNT-S-OR-500', category: 'Soda', quantity: 600, unit_price: 1800, total_price: 1080000 },
      { id: 21, product_id: 9, product_name: 'Bonite Energy Drink 250ml', product_code: 'BNT-E-250', category: 'Energy', quantity: 570, unit_price: 2754, total_price: 1569000 },
    ],
  },
  {
    id: 6,
    order_number: 'B2B-2026-0006',
    customer_name: 'Al-Rashid Distributors Ltd',
    customer_sap_code: 'SAP-001234',
    status: 'rejected',
    total_amount: 980000,
    created_at: today.subtract(14, 'day').toISOString(),
    updated_at: today.subtract(13, 'day').toISOString(),
    rejection_reason: 'Order exceeds current credit limit. Please clear outstanding balance first.',
    items: [
      { id: 22, product_id: 7, product_name: 'Bonite Juice Mango 1L', product_code: 'BNT-J-MG-1L', category: 'Juice', quantity: 100, unit_price: 4200, total_price: 420000 },
      { id: 23, product_id: 8, product_name: 'Bonite Juice Passion 1L', product_code: 'BNT-J-PS-1L', category: 'Juice', quantity: 100, unit_price: 4200, total_price: 420000 },
      { id: 24, product_id: 9, product_name: 'Bonite Energy Drink 250ml', product_code: 'BNT-E-250', category: 'Energy', quantity: 50, unit_price: 2800, total_price: 140000 },
    ],
  },
];
