import dayjs from 'dayjs';

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'partial';
export type PaymentMethod = 'bank_transfer' | 'mobile_money' | 'cash' | 'cheque';

export interface Invoice {
  id: number;
  invoice_number: string;
  order_number: string;
  customer_name: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: InvoiceStatus;
  sap_reference?: string;
}

export interface Payment {
  id: number;
  payment_number: string;
  invoice_number: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  paid_at: string;
  confirmed_by?: string;
}

const today = dayjs();

export const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoice_number: 'INV-2026-0087',
    order_number: 'B2B-2026-0001',
    customer_name: 'Al-Rashid Distributors Ltd',
    issue_date: today.subtract(7, 'day').format('YYYY-MM-DD'),
    due_date: today.add(23, 'day').format('YYYY-MM-DD'),
    total_amount: 4850000,
    amount_paid: 4850000,
    balance_due: 0,
    status: 'paid',
    sap_reference: 'SAP-INV-98741',
  },
  {
    id: 2,
    invoice_number: 'INV-2026-0094',
    order_number: 'B2B-2026-0002',
    customer_name: 'Al-Rashid Distributors Ltd',
    issue_date: today.subtract(1, 'day').format('YYYY-MM-DD'),
    due_date: today.add(29, 'day').format('YYYY-MM-DD'),
    total_amount: 2340000,
    amount_paid: 0,
    balance_due: 2340000,
    status: 'unpaid',
    sap_reference: 'SAP-INV-99012',
  },
  {
    id: 3,
    invoice_number: 'INV-2026-0068',
    order_number: 'B2B-2026-OLD-02',
    customer_name: 'Al-Rashid Distributors Ltd',
    issue_date: today.subtract(40, 'day').format('YYYY-MM-DD'),
    due_date: today.subtract(10, 'day').format('YYYY-MM-DD'),
    total_amount: 3200000,
    amount_paid: 1500000,
    balance_due: 1700000,
    status: 'overdue',
    sap_reference: 'SAP-INV-97234',
  },
  {
    id: 4,
    invoice_number: 'INV-2026-0055',
    order_number: 'B2B-2026-OLD-03',
    customer_name: 'Al-Rashid Distributors Ltd',
    issue_date: today.subtract(55, 'day').format('YYYY-MM-DD'),
    due_date: today.subtract(25, 'day').format('YYYY-MM-DD'),
    total_amount: 1890000,
    amount_paid: 1890000,
    balance_due: 0,
    status: 'paid',
    sap_reference: 'SAP-INV-96108',
  },
  {
    id: 5,
    invoice_number: 'INV-2026-0101',
    order_number: 'B2B-2026-0005',
    customer_name: 'Kilimanjaro Wholesale',
    issue_date: today.subtract(4, 'day').format('YYYY-MM-DD'),
    due_date: today.add(26, 'day').format('YYYY-MM-DD'),
    total_amount: 5670000,
    amount_paid: 2000000,
    balance_due: 3670000,
    status: 'partial',
    sap_reference: 'SAP-INV-99234',
  },
];

export const mockPayments: Payment[] = [
  {
    id: 1,
    payment_number: 'PAY-2026-0041',
    invoice_number: 'INV-2026-0087',
    amount: 4850000,
    method: 'bank_transfer',
    reference: 'TRF-CRDB-20260817',
    paid_at: today.subtract(6, 'day').toISOString(),
    confirmed_by: 'Grace Mwangi',
  },
  {
    id: 2,
    payment_number: 'PAY-2026-0028',
    invoice_number: 'INV-2026-0068',
    amount: 1500000,
    method: 'mobile_money',
    reference: 'M-PESA-TZ-9923411',
    paid_at: today.subtract(30, 'day').toISOString(),
    confirmed_by: 'Grace Mwangi',
  },
  {
    id: 3,
    payment_number: 'PAY-2026-0022',
    invoice_number: 'INV-2026-0055',
    amount: 1890000,
    method: 'cheque',
    reference: 'CHQ-00234-CRDB',
    paid_at: today.subtract(22, 'day').toISOString(),
    confirmed_by: 'Grace Mwangi',
  },
  {
    id: 4,
    payment_number: 'PAY-2026-0045',
    invoice_number: 'INV-2026-0101',
    amount: 2000000,
    method: 'bank_transfer',
    reference: 'TRF-NBC-20260823',
    paid_at: today.subtract(3, 'day').toISOString(),
    confirmed_by: 'Grace Mwangi',
  },
];
