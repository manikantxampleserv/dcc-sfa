import prisma from '../../configs/prisma.client';

interface MockOrder {
  order_number: string;
  customer_name: string;
  order_date?: Date;
  delivery_date?: Date;
  status?: string;
  priority?: string;
  order_type?: string;
  payment_method?: string;
  payment_terms?: string;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_amount?: number;
  total_amount?: number;
  notes?: string;
  shipping_address?: string;
  approval_status?: string;
  approved_at?: Date;
  is_active: string;
}

const mockOrders: MockOrder[] = [
  {
    order_number: 'ORD-001',
    customer_name: 'Retail Store 1',
    order_date: new Date('2024-01-15'),
    delivery_date: new Date('2024-01-20'),
    status: 'delivered',
    priority: 'high',
    order_type: 'regular',
    payment_method: 'credit',
    payment_terms: 'Net 30',
    subtotal: 925.0,
    discount_amount: 0.0,
    tax_amount: 74.99,
    shipping_amount: 0.0,
    total_amount: 999.99,
    notes: 'Priority delivery requested',
    shipping_address: '123 Main Street, New York, NY 10001',
    approval_status: 'approved',
    approved_at: new Date('2024-01-15'),
    is_active: 'Y',
  },
  {
    order_number: 'ORD-002',
    customer_name: 'Wholesale Hub 2',
    order_date: new Date('2024-01-16'),
    delivery_date: new Date('2024-01-22'),
    status: 'pending',
    priority: 'medium',
    order_type: 'regular',
    payment_method: 'cash',
    payment_terms: 'COD',
    subtotal: 1150.0,
    discount_amount: 50.0,
    tax_amount: 88.0,
    shipping_amount: 12.0,
    total_amount: 1200.0,
    notes: 'Standard delivery',
    shipping_address: '456 Oak Avenue, Los Angeles, CA 90210',
    approval_status: 'pending',
    approved_at: undefined,
    is_active: 'Y',
  },
  {
    order_number: 'ORD-003',
    customer_name: 'Corporate Center 3',
    order_date: new Date('2024-01-17'),
    delivery_date: new Date('2024-01-25'),
    status: 'shipped',
    priority: 'low',
    order_type: 'bulk',
    payment_method: 'check',
    payment_terms: 'Net 15',
    subtotal: 2400.0,
    discount_amount: 100.0,
    tax_amount: 184.0,
    shipping_amount: 16.0,
    total_amount: 2500.0,
    notes: 'Bulk order discount applied',
    shipping_address: '789 Pine Street, Chicago, IL 60601',
    approval_status: 'approved',
    approved_at: new Date('2024-01-17'),
    is_active: 'Y',
  },
  {
    order_number: 'ORD-004',
    customer_name: 'Industrial Supplies Co 5',
    order_date: new Date('2024-01-18'),
    delivery_date: new Date('2024-01-26'),
    status: 'processing',
    priority: 'high',
    order_type: 'express',
    payment_method: 'credit',
    payment_terms: 'Net 30',
    subtotal: 750.0,
    discount_amount: 0.0,
    tax_amount: 60.0,
    shipping_amount: 40.0,
    total_amount: 850.0,
    notes: 'Express shipping required',
    shipping_address: '321 Elm Drive, Houston, TX 77001',
    approval_status: 'approved',
    approved_at: new Date('2024-01-18'),
    is_active: 'Y',
  },
  {
    order_number: 'ORD-005',
    customer_name: 'Healthcare Solutions 6',
    order_date: new Date('2024-01-19'),
    delivery_date: new Date('2024-01-28'),
    status: 'delivered',
    priority: 'medium',
    order_type: 'regular',
    payment_method: 'wire',
    payment_terms: 'Prepaid',
    subtotal: 1800.0,
    discount_amount: 0.0,
    tax_amount: 144.0,
    shipping_amount: 6.0,
    total_amount: 1950.0,
    notes: 'Wire transfer payment',
    shipping_address: '654 Maple Lane, Phoenix, AZ 85001',
    approval_status: 'approved',
    approved_at: new Date('2024-01-19'),
    is_active: 'Y',
  },
  {
    order_number: 'ORD-006',
    customer_name: 'Automotive Parts 7',
    order_date: new Date('2024-01-20'),
    delivery_date: new Date('2024-01-30'),
    status: 'cancelled',
    priority: 'low',
    order_type: 'regular',
    payment_method: 'credit',
    payment_terms: 'Net 30',
    subtotal: 450.0,
    discount_amount: 0.0,
    tax_amount: 36.0,
    shipping_amount: 14.0,
    total_amount: 500.0,
    notes: 'Customer requested cancellation',
    shipping_address: '987 Cedar Court, Philadelphia, PA 19101',
    approval_status: 'rejected',
    approved_at: undefined,
    is_active: 'N',
  },
  {
    order_number: 'ORD-007',
    customer_name: 'Restaurant Chain 8',
    order_date: new Date('2024-01-21'),
    delivery_date: new Date('2024-02-01'),
    status: 'pending',
    priority: 'high',
    order_type: 'special',
    payment_method: 'cash',
    payment_terms: 'COD',
    subtotal: 3200.0,
    discount_amount: 200.0,
    tax_amount: 240.0,
    shipping_amount: 60.0,
    total_amount: 3300.0,
    notes: 'Special handling required',
    shipping_address: '147 Beach Road, Miami, FL 33101',
    approval_status: 'pending',
    approved_at: undefined,
    is_active: 'Y',
  },
  {
    order_number: 'ORD-008',
    customer_name: 'Service Providers 9',
    order_date: new Date('2024-01-22'),
    delivery_date: new Date('2024-02-02'),
    status: 'shipped',
    priority: 'medium',
    order_type: 'regular',
    payment_method: 'check',
    payment_terms: 'Net 15',
    subtotal: 680.0,
    discount_amount: 30.0,
    tax_amount: 52.0,
    shipping_amount: 8.0,
    total_amount: 710.0,
    notes: 'Standard processing',
    shipping_address: '258 Ocean View, San Diego, CA 92101',
    approval_status: 'approved',
    approved_at: new Date('2024-01-22'),
    is_active: 'Y',
  },
  {
    order_number: 'ORD-009',
    customer_name: 'Manufacturing Co 10',
    order_date: new Date('2024-01-23'),
    delivery_date: new Date('2024-02-05'),
    status: 'processing',
    priority: 'low',
    order_type: 'bulk',
    payment_method: 'wire',
    payment_terms: 'Prepaid',
    subtotal: 5500.0,
    discount_amount: 500.0,
    tax_amount: 400.0,
    shipping_amount: 100.0,
    total_amount: 5500.0,
    notes: 'Large bulk order',
    shipping_address: '369 Mountain Pass, Denver, CO 80201',
    approval_status: 'approved',
    approved_at: new Date('2024-01-23'),
    is_active: 'Y',
  },
  {
    order_number: 'ORD-010',
    customer_name: 'Distribution Hub 11',
    order_date: new Date('2024-01-24'),
    delivery_date: new Date('2024-02-08'),
    status: 'delivered',
    priority: 'medium',
    order_type: 'regular',
    payment_method: 'credit',
    payment_terms: 'Net 30',
    subtotal: 1350.0,
    discount_amount: 0.0,
    tax_amount: 108.0,
    shipping_amount: 42.0,
    total_amount: 1500.0,
    notes: 'Regular delivery completed',
    shipping_address: '741 Valley Road, Salt Lake City, UT 84101',
    approval_status: 'approved',
    approved_at: new Date('2024-01-24'),
    is_active: 'Y',
  },
  {
    order_number: 'ORD-011',
    customer_name: 'Closed Business',
    order_date: new Date('2020-01-01'),
    delivery_date: new Date('2020-01-10'),
    status: 'cancelled',
    priority: 'low',
    order_type: 'regular',
    payment_method: 'credit',
    payment_terms: 'Net 30',
    subtotal: 0.0,
    discount_amount: 0.0,
    tax_amount: 0.0,
    shipping_amount: 0.0,
    total_amount: 0.0,
    notes: 'Cancelled due to company closure',
    shipping_address: 'N/A',
    approval_status: 'rejected',
    approved_at: undefined,
    is_active: 'N',
  },
];

export async function seedOrders(): Promise<void> {
  const customers = await prisma.customers.findMany({
    select: { id: true, name: true },
    take: 11, // Only get first 11 customers
  });

  if (customers.length === 0) {
    console.log('No customers found. Please run customers seeder first.');
    return;
  }

  for (let i = 0; i < mockOrders.length; i++) {
    const order = mockOrders[i];
    const existingOrder = await prisma.orders.findFirst({
      where: { order_number: order.order_number },
    });

    if (!existingOrder) {
      // Use the customer at the same index, or cycle through if we have fewer customers
      const customer = customers[i % customers.length];

      await prisma.orders.create({
        data: {
          order_number: order.order_number,
          parent_id: customer.id,
          salesperson_id: 1,
          order_date: order.order_date,
          delivery_date: order.delivery_date,
          status: order.status,
          priority: order.priority,
          order_type: order.order_type,
          payment_method: order.payment_method,
          payment_terms: order.payment_terms,
          subtotal: order.subtotal,
          discount_amount: order.discount_amount,
          tax_amount: order.tax_amount,
          shipping_amount: order.shipping_amount,
          total_amount: order.total_amount,
          notes: order.notes,
          shipping_address: order.shipping_address,
          approval_status: order.approval_status,
          approved_by: order.approval_status === 'approved' ? 1 : null,
          approved_at: order.approved_at,
          is_active: order.is_active,
          createdate: new Date(),
          createdby: 1,
          log_inst: 1,
        },
      });
    }
  }
}

export async function clearOrders(): Promise<void> {
  // Delete order items first due to foreign key constraints
  await prisma.order_items.deleteMany({});
  // Then delete orders
  await prisma.orders.deleteMany({});
}

export { mockOrders };
