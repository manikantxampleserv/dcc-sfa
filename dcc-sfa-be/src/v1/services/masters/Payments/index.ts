import { prisma } from '../../../configs/database';

export interface Payment {
  id: number;
  payment_number: string;
  customer_id: number;
  payment_date: string;
  collected_by: number;
  method: string;
  reference_number?: string;
  total_amount: number;
  notes?: string;
  is_active: string;
  createdate?: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  currency_id?: number;
  customer?: {
    id: number;
    name: string;
    code: string;
  };
  collected_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  currency?: {
    id: number;
    name: string;
    code: string;
  };
  payment_lines?: {
    id: number;
    invoice_id: number;
    invoice_number?: string;
    invoice_date?: string;
    amount_applied: number;
    notes?: string;
    invoice?: {
      id: number;
      invoice_number: string;
      total_amount: number;
      balance_due: number;
    };
  }[];
}

export interface ManagePaymentPayload {
  customer_id: number;
  payment_date: string;
  collected_by: number;
  method: string;
  reference_number?: string;
  total_amount: number;
  notes?: string;
  currency_id?: number;
  payment_lines?: {
    invoice_id: number;
    amount_applied: number;
    notes?: string;
  }[];
}

export interface UpdatePaymentPayload extends Partial<ManagePaymentPayload> {
  id: number;
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  customer_id?: number;
  collected_by?: number;
  method?: string;
  payment_date_from?: string;
  payment_date_to?: string;
  currency_id?: number;
  is_active?: string;
}

export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  payments_this_month: number;
  amount_this_month: number;
  pending_collections: number;
  overdue_amount: number;
}

export interface PaymentSerialized {
  id: number;
  payment_number: string;
  customer_id: number;
  payment_date: string;
  collected_by: number;
  method: string;
  reference_number?: string;
  total_amount: number;
  notes?: string;
  is_active: string;
  createdate?: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  currency_id?: number;
  customer?: {
    id: number;
    name: string;
    code: string;
  };
  collected_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  currency?: {
    id: number;
    name: string;
    code: string;
  };
  payment_lines?: {
    id: number;
    invoice_id: number;
    invoice_number?: string;
    invoice_date?: string;
    amount_applied: number;
    notes?: string;
    invoice?: {
      id: number;
      invoice_number: string;
      total_amount: number;
      balance_due: number;
    };
  }[];
}

/**
 * Serialize payment data for API response
 * @param payment - Payment data from database
 * @returns Serialized payment data
 */
export const serializePayment = (payment: any): PaymentSerialized => ({
  id: payment.id,
  payment_number: payment.payment_number,
  customer_id: payment.customer_id,
  payment_date: payment.payment_date?.toISOString() || '',
  collected_by: payment.collected_by,
  method: payment.method,
  reference_number: payment.reference_number,
  total_amount: Number(payment.total_amount),
  notes: payment.notes,
  is_active: payment.is_active,
  createdate: payment.createdate?.toISOString(),
  createdby: payment.createdby,
  updatedate: payment.updatedate?.toISOString(),
  updatedby: payment.updatedby,
  log_inst: payment.log_inst,
  currency_id: payment.currency_id,
  customer: payment.payments_customers
    ? {
        id: payment.payments_customers.id,
        name: payment.payments_customers.name,
        code: payment.payments_customers.code,
      }
    : undefined,
  collected_by_user: payment.users_payments_collected_byTousers
    ? {
        id: payment.users_payments_collected_byTousers.id,
        name: payment.users_payments_collected_byTousers.name,
        email: payment.users_payments_collected_byTousers.email,
      }
    : undefined,
  currency: payment.currencies
    ? {
        id: payment.currencies.id,
        name: payment.currencies.name,
        code: payment.currencies.code,
      }
    : undefined,
  payment_lines:
    payment.payment_lines?.map((line: any) => ({
      id: line.id,
      invoice_id: line.invoice_id,
      invoice_number: line.invoice_number,
      invoice_date: line.invoice_date?.toISOString(),
      amount_applied: Number(line.amount_applied),
      notes: line.notes,
      invoice: line.invoices
        ? {
            id: line.invoices.id,
            invoice_number: line.invoices.invoice_number,
            total_amount: Number(line.invoices.total_amount),
            balance_due: Number(line.invoices.balance_due),
          }
        : undefined,
    })) || [],
});

/**
 * Generate unique payment number
 * @returns Unique payment number
 */
export const generatePaymentNumber = async (): Promise<string> => {
  const count = await prisma.payments.count();
  const nextNumber = count + 1;
  return `PAY-${nextNumber.toString().padStart(6, '0')}`;
};

/**
 * Get all payments with filtering and pagination
 * @param params - Query parameters
 * @returns Paginated payments data
 */
export const getAllPayments = async (params: GetPaymentsParams) => {
  const {
    page = 1,
    limit = 10,
    search,
    customer_id,
    collected_by,
    method,
    payment_date_from,
    payment_date_to,
    currency_id,
    is_active = 'Y',
  } = params;

  const skip = (page - 1) * limit;
  const filters: any = {};

  if (is_active) {
    filters.is_active = is_active;
  }

  if (customer_id) {
    filters.customer_id = customer_id;
  }

  if (collected_by) {
    filters.collected_by = collected_by;
  }

  if (method) {
    filters.method = method;
  }

  if (currency_id) {
    filters.currency_id = currency_id;
  }

  if (payment_date_from || payment_date_to) {
    filters.payment_date = {};
    if (payment_date_from) {
      filters.payment_date.gte = new Date(payment_date_from);
    }
    if (payment_date_to) {
      filters.payment_date.lte = new Date(payment_date_to);
    }
  }

  const whereClause = search
    ? {
        ...filters,
        OR: [
          { payment_number: { contains: search } },
          { reference_number: { contains: search } },
          { notes: { contains: search } },
          { payments_customers: { name: { contains: search } } },
          {
            users_payments_collected_byTousers: { name: { contains: search } },
          },
        ],
      }
    : filters;

  const [data, totalCount] = await Promise.all([
    prisma.payments.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdate: 'desc' },
      include: {
        payments_customers: true,
        users_payments_collected_byTousers: true,
        currencies: true,
        payment_lines: {
          include: {
            invoices: true,
          },
        },
      },
    }),
    prisma.payments.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: data.map(serializePayment),
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_count: totalCount,
      has_next: page < totalPages,
      has_previous: page > 1,
    },
  };
};

/**
 * Get payment by ID
 * @param id - Payment ID
 * @returns Payment data
 */
export const getPaymentById = async (id: number) => {
  const payment = await prisma.payments.findUnique({
    where: { id },
    include: {
      payments_customers: true,
      users_payments_collected_byTousers: true,
      currencies: true,
      payment_lines: {
        include: {
          invoices: true,
        },
      },
    },
  });

  return payment ? serializePayment(payment) : null;
};

/**
 * Create new payment
 * @param paymentData - Payment data
 * @param userId - User ID creating the payment
 * @returns Created payment
 */
export const createPayment = async (
  paymentData: ManagePaymentPayload,
  userId: number
) => {
  const paymentNumber = await generatePaymentNumber();

  const payment = await prisma.payments.create({
    data: {
      payment_number: paymentNumber,
      customer_id: paymentData.customer_id,
      payment_date: new Date(paymentData.payment_date),
      collected_by: paymentData.collected_by,
      method: paymentData.method,
      reference_number: paymentData.reference_number,
      total_amount: paymentData.total_amount,
      notes: paymentData.notes,
      currency_id: paymentData.currency_id,
      is_active: 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
      payment_lines: paymentData.payment_lines
        ? {
            create: paymentData.payment_lines.map(line => ({
              invoice_id: line.invoice_id,
              amount_applied: line.amount_applied,
              notes: line.notes,
            })),
          }
        : undefined,
    },
    include: {
      payments_customers: true,
      users_payments_collected_byTousers: true,
      currencies: true,
      payment_lines: {
        include: {
          invoices: true,
        },
      },
    },
  });

  // Update invoice amounts if payment lines exist
  if (paymentData.payment_lines) {
    for (const line of paymentData.payment_lines) {
      await prisma.invoices.update({
        where: { id: line.invoice_id },
        data: {
          amount_paid: {
            increment: line.amount_applied,
          },
          balance_due: {
            decrement: line.amount_applied,
          },
        },
      });
    }
  }

  return serializePayment(payment);
};

/**
 * Update payment
 * @param id - Payment ID
 * @param paymentData - Updated payment data
 * @param userId - User ID updating the payment
 * @returns Updated payment
 */
export const updatePayment = async (
  id: number,
  paymentData: UpdatePaymentPayload,
  userId: number
) => {
  const existingPayment = await prisma.payments.findUnique({
    where: { id },
    include: { payment_lines: true },
  });

  if (!existingPayment) {
    throw new Error('Payment not found');
  }

  // Revert previous invoice updates
  for (const line of existingPayment.payment_lines) {
    await prisma.invoices.update({
      where: { id: line.invoice_id },
      data: {
        amount_paid: {
          decrement: line.amount_applied,
        },
        balance_due: {
          increment: line.amount_applied,
        },
      },
    });
  }

  // Delete existing payment lines
  await prisma.payment_lines.deleteMany({
    where: { parent_id: id },
  });

  const payment = await prisma.payments.update({
    where: { id },
    data: {
      customer_id: paymentData.customer_id,
      payment_date: paymentData.payment_date
        ? new Date(paymentData.payment_date)
        : undefined,
      collected_by: paymentData.collected_by,
      method: paymentData.method,
      reference_number: paymentData.reference_number,
      total_amount: paymentData.total_amount,
      notes: paymentData.notes,
      currency_id: paymentData.currency_id,
      updatedate: new Date(),
      updatedby: userId,
      payment_lines: paymentData.payment_lines
        ? {
            create: paymentData.payment_lines.map(line => ({
              invoice_id: line.invoice_id,
              amount_applied: line.amount_applied,
              notes: line.notes,
            })),
          }
        : undefined,
    },
    include: {
      payments_customers: true,
      users_payments_collected_byTousers: true,
      currencies: true,
      payment_lines: {
        include: {
          invoices: true,
        },
      },
    },
  });

  // Apply new invoice updates
  if (paymentData.payment_lines) {
    for (const line of paymentData.payment_lines) {
      await prisma.invoices.update({
        where: { id: line.invoice_id },
        data: {
          amount_paid: {
            increment: line.amount_applied,
          },
          balance_due: {
            decrement: line.amount_applied,
          },
        },
      });
    }
  }

  return serializePayment(payment);
};

/**
 * Delete payment
 * @param id - Payment ID
 * @param userId - User ID deleting the payment
 */
export const deletePayment = async (id: number, userId: number) => {
  const existingPayment = await prisma.payments.findUnique({
    where: { id },
    include: { payment_lines: true },
  });

  if (!existingPayment) {
    throw new Error('Payment not found');
  }

  // Revert invoice updates
  for (const line of existingPayment.payment_lines) {
    await prisma.invoices.update({
      where: { id: line.invoice_id },
      data: {
        amount_paid: {
          decrement: line.amount_applied,
        },
        balance_due: {
          increment: line.amount_applied,
        },
      },
    });
  }

  await prisma.payments.update({
    where: { id },
    data: {
      is_active: 'N',
      updatedate: new Date(),
      updatedby: userId,
    },
  });
};

/**
 * Get payment statistics
 * @param filters - Filter parameters
 * @returns Payment statistics
 */
export const getPaymentStats = async (
  filters: any = {}
): Promise<PaymentStats> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    totalPayments,
    totalAmount,
    paymentsThisMonth,
    amountThisMonth,
    pendingCollections,
    overdueAmount,
  ] = await Promise.all([
    prisma.payments.count({ where: { ...filters, is_active: 'Y' } }),
    prisma.payments.aggregate({
      where: { ...filters, is_active: 'Y' },
      _sum: { total_amount: true },
    }),
    prisma.payments.count({
      where: {
        ...filters,
        is_active: 'Y',
        payment_date: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    }),
    prisma.payments.aggregate({
      where: {
        ...filters,
        is_active: 'Y',
        payment_date: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      _sum: { total_amount: true },
    }),
    prisma.invoices.count({
      where: {
        ...filters,
        is_active: 'Y',
        balance_due: { gt: 0 },
      },
    }),
    prisma.invoices.aggregate({
      where: {
        ...filters,
        is_active: 'Y',
        balance_due: { gt: 0 },
      },
      _sum: { balance_due: true },
    }),
  ]);

  return {
    total_payments: totalPayments,
    total_amount: Number(totalAmount._sum.total_amount || 0),
    payments_this_month: paymentsThisMonth,
    amount_this_month: Number(amountThisMonth._sum.total_amount || 0),
    pending_collections: pendingCollections,
    overdue_amount: Number(overdueAmount._sum.balance_due || 0),
  };
};
