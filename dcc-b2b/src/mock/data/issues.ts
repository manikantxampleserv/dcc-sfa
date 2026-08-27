import dayjs from 'dayjs';

export type IssueType = 'shortage' | 'damage' | 'wrong_product' | 'late_delivery' | 'pricing_dispute' | 'other';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Issue {
  id: number;
  issue_number: string;
  order_number: string;
  type: IssueType;
  priority: IssuePriority;
  subject: string;
  description: string;
  status: IssueStatus;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  assigned_to?: string;
  resolution_notes?: string;
}

export interface Feedback {
  id: number;
  order_number: string;
  rating: number;
  delivery_rating: number;
  product_quality_rating: number;
  comment: string;
  submitted_at: string;
}

const today = dayjs();

export const mockIssues: Issue[] = [
  {
    id: 1,
    issue_number: 'ISS-2026-0012',
    order_number: 'B2B-2026-0001',
    type: 'damage',
    priority: 'high',
    subject: 'Damaged water bottles on delivery',
    description: '20 units of Bonite Water 500ml received with broken seals and leaking caps. Product is unusable.',
    status: 'resolved',
    created_at: today.subtract(6, 'day').toISOString(),
    updated_at: today.subtract(4, 'day').toISOString(),
    resolved_at: today.subtract(4, 'day').toISOString(),
    assigned_to: 'Grace Mwangi',
    resolution_notes: 'Credit note issued and replacement units scheduled for next delivery.',
  },
  {
    id: 2,
    issue_number: 'ISS-2026-0015',
    order_number: 'B2B-2026-0002',
    type: 'shortage',
    priority: 'medium',
    subject: 'Short delivery – Soda Lemon',
    description: 'Ordered 240 units of Soda Lemon but only 200 units were delivered. Missing 40 units.',
    status: 'in_progress',
    created_at: today.subtract(2, 'day').toISOString(),
    updated_at: today.subtract(1, 'day').toISOString(),
    assigned_to: 'Grace Mwangi',
  },
  {
    id: 3,
    issue_number: 'ISS-2026-0018',
    order_number: 'B2B-2026-0002',
    type: 'late_delivery',
    priority: 'low',
    subject: 'Delivery delayed by 2 days',
    description: 'Order B2B-2026-0002 was supposed to be delivered yesterday but is still in transit.',
    status: 'open',
    created_at: today.subtract(1, 'day').toISOString(),
    updated_at: today.subtract(1, 'day').toISOString(),
  },
  {
    id: 4,
    issue_number: 'ISS-2026-0007',
    order_number: 'B2B-2026-OLD-02',
    type: 'pricing_dispute',
    priority: 'critical',
    subject: 'Wrong price charged – Energy Drink',
    description: 'Energy Drink 250ml was charged at TZS 3,200 per unit instead of agreed price of TZS 2,800.',
    status: 'resolved',
    created_at: today.subtract(20, 'day').toISOString(),
    updated_at: today.subtract(16, 'day').toISOString(),
    resolved_at: today.subtract(16, 'day').toISOString(),
    assigned_to: 'Grace Mwangi',
    resolution_notes: 'Pricing error confirmed. Credit of TZS 160,000 applied to account.',
  },
];

export const mockFeedback: Feedback[] = [
  {
    id: 1,
    order_number: 'B2B-2026-0001',
    rating: 4,
    delivery_rating: 5,
    product_quality_rating: 4,
    comment: 'Overall great service. Delivery was on time and products were in good condition. Minor packaging issue with a few bottles.',
    submitted_at: today.subtract(6, 'day').toISOString(),
  },
];
