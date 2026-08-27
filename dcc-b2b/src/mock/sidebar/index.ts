import type { IconType } from 'react-icons';
import {
  MdDashboard,
  MdShoppingCart,
  MdCheckCircle,
  MdLocalShipping,
  MdReceipt,
  MdReport,
  MdFeedback,
  MdBarChart,
  MdSettings,
  MdWarning,
} from 'react-icons/md';

export interface MenuItem {
  id: string;
  label: string;
  icon?: IconType;
  children?: MenuItem[];
  href?: string;
  roles?: ('customer' | 'sales_officer')[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard-group',
    label: 'Overview',
    children: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: MdDashboard,
        href: '/dashboard',
        roles: ['customer', 'sales_officer'],
      },
    ],
  },
  {
    id: 'orders-group',
    label: 'Orders',
    children: [
      {
        id: 'place-order',
        label: 'Place New Order',
        icon: MdShoppingCart,
        href: '/orders/place',
        roles: ['customer'],
      },
      {
        id: 'my-orders',
        label: 'My Orders',
        icon: MdShoppingCart,
        href: '/orders',
        roles: ['customer', 'sales_officer'],
      },
    ],
  },
  {
    id: 'approvals-group',
    label: 'Approvals',
    children: [
      {
        id: 'pending-approvals',
        label: 'Pending Approvals',
        icon: MdCheckCircle,
        href: '/approvals/pending',
        roles: ['sales_officer'],
      },
      {
        id: 'approval-history',
        label: 'Approval History',
        icon: MdCheckCircle,
        href: '/approvals/history',
        roles: ['sales_officer'],
      },
    ],
  },
  {
    id: 'deliveries-group',
    label: 'Deliveries',
    children: [
      {
        id: 'delivery-schedule',
        label: 'Delivery Schedule',
        icon: MdLocalShipping,
        href: '/deliveries/schedule',
        roles: ['customer', 'sales_officer'],
      },
      {
        id: 'proof-of-delivery',
        label: 'Proof of Delivery',
        icon: MdLocalShipping,
        href: '/deliveries/pod',
        roles: ['customer', 'sales_officer'],
      },
      {
        id: 'returns',
        label: 'Returns Management',
        icon: MdLocalShipping,
        href: '/deliveries/returns',
        roles: ['customer', 'sales_officer'],
      },
    ],
  },
  {
    id: 'invoices-group',
    label: 'Invoices & Payments',
    children: [
      {
        id: 'invoices',
        label: 'Invoices',
        icon: MdReceipt,
        href: '/invoices',
        roles: ['customer', 'sales_officer'],
      },
      {
        id: 'payment-history',
        label: 'Payment History',
        icon: MdReceipt,
        href: '/invoices/payments',
        roles: ['customer'],
      },
    ],
  },
  {
    id: 'issues-group',
    label: 'Issues & Feedback',
    children: [
      {
        id: 'raise-issue',
        label: 'Raise an Issue',
        icon: MdWarning,
        href: '/issues/raise',
        roles: ['customer'],
      },
      {
        id: 'my-issues',
        label: 'My Issues',
        icon: MdReport,
        href: '/issues',
        roles: ['customer', 'sales_officer'],
      },
      {
        id: 'feedback',
        label: 'Feedback',
        icon: MdFeedback,
        href: '/feedback',
        roles: ['customer'],
      },
    ],
  },
  {
    id: 'reports-group',
    label: 'Reports',
    children: [
      {
        id: 'order-summary',
        label: 'Order Summary',
        icon: MdBarChart,
        href: '/reports/orders',
        roles: ['customer', 'sales_officer'],
      },
      {
        id: 'delivery-performance',
        label: 'Delivery Performance',
        icon: MdBarChart,
        href: '/reports/delivery',
        roles: ['customer', 'sales_officer'],
      },
      {
        id: 'kpi-scorecard',
        label: 'KPI Scorecard',
        icon: MdBarChart,
        href: '/reports/kpi',
        roles: ['customer', 'sales_officer'],
      },
    ],
  },
  {
    id: 'settings-group',
    label: 'Settings',
    children: [
      {
        id: 'profile',
        label: 'My Profile',
        icon: MdSettings,
        href: '/settings/profile',
        roles: ['customer', 'sales_officer'],
      },
      {
        id: 'notifications-settings',
        label: 'Notifications',
        icon: MdSettings,
        href: '/settings/notifications',
        roles: ['customer', 'sales_officer'],
      },
    ],
  },
];

export default menuItems;
