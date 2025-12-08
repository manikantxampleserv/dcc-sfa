import type { IconType } from 'react-icons';
import {
  MdBarChart,
  MdDashboard,
  MdDomain,
  MdMap,
  MdNotifications,
  MdSettings,
  MdShoppingCart,
} from 'react-icons/md';

export interface MenuItem {
  id: string;
  label: string;
  icon?: IconType;
  children?: MenuItem[];
  href?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboards',
    label: 'Dashboards',
    icon: MdDashboard,
    children: [
      {
        id: 'executive-dashboard',
        label: 'Executive Dashboard',
        href: '/dashboard/executive',
      },
    ],
  },
  {
    id: 'masters',
    label: 'Masters',
    icon: MdDomain,
    children: [
      {
        id: 'organization-setup',
        label: 'Organization Setup',
        children: [
          {
            id: 'company-master',
            label: 'Company Master',
            href: '/masters/company',
          },
          { id: 'user-master', label: 'User Master', href: '/masters/users' },
          {
            id: 'role-permission',
            label: 'Role & Permission Setup',
            href: '/masters/roles',
          },
          { id: 'zones', label: 'Zones', href: '/masters/zones' },
          { id: 'depots', label: 'Depots', href: '/masters/depots' },
          { id: 'currency', label: 'Currency', href: '/masters/currency' },
        ],
      },
      {
        id: 'operations-logistics',
        label: 'Operations & Logistics',
        children: [
          {
            id: 'warehouse-master',
            label: 'Warehouse Master',
            href: '/masters/warehouses',
          },
          {
            id: 'vehicle-master',
            label: 'Vehicle Master',
            href: '/masters/vehicles',
          },
          {
            id: 'asset-types',
            label: 'Asset Types',
            href: '/masters/asset-types',
          },
          {
            id: 'asset-master',
            label: 'Asset Master',
            href: '/masters/asset-master',
          },
          {
            id: 'route-types',
            label: 'Route Types',
            href: '/masters/route-types',
          },
          { id: 'routes', label: 'Routes', href: '/masters/routes' },
        ],
      },
      {
        id: 'customer-outlet-management',
        label: 'Outlet Management',
        children: [
          {
            id: 'outlet-groups',
            label: 'Outlet Groups',
            href: '/masters/outlet-groups',
          },
          {
            id: 'outlet-master',
            label: 'Outlet Master',
            href: '/masters/outlets',
          },
          {
            id: 'outlet-type',
            label: 'Outlet Type',
            href: '/masters/outlet-type',
          },
          {
            id: 'outlet-category',
            label: 'Outlet Category',
            href: '/masters/outlet-category',
          },
        ],
      },
      {
        id: 'product-pricing-setup',
        label: 'Product & Pricing Setup',
        children: [
          {
            id: 'brands',
            label: 'Brands',
            href: '/masters/brands',
          },
          {
            id: 'product-categories',
            label: 'Product Categories',
            href: '/masters/product-categories',
          },
          {
            id: 'product-sub-categories',
            label: 'Product Sub Categories',
            href: '/masters/product-sub-categories',
          },
          {
            id: 'unit-of-measurement',
            label: 'Unit of Measurement',
            href: '/masters/unit-of-measurement',
          },
          {
            id: 'product-catalog',
            label: 'Product Catalog',
            href: '/masters/products',
          },
          {
            id: 'pricelists',
            label: 'Pricelists',
            href: '/masters/pricelists',
          },
        ],
      },
      {
        id: 'sales-planning-targets',
        label: 'Sales Planning & Targets',
        children: [
          {
            id: 'sales-target-groups',
            label: 'Sales Target Groups',
            href: '/masters/sales-target-groups',
          },
          {
            id: 'sales-targets',
            label: 'Sales Targets',
            href: '/masters/sales-targets',
          },
          {
            id: 'kpi-targets',
            label: 'KPI Targets',
            href: '/masters/kpi-targets',
          },
          {
            id: 'sales-bonus-rules',
            label: 'Sales Bonus Rules',
            href: '/masters/sales-bonus-rules',
          },
        ],
      },
      {
        id: 'feedback-engagement',
        label: 'Feedback & Engagement',
        children: [
          {
            id: 'survey-templates',
            label: 'Survey Templates',
            href: '/masters/surveys',
          },
          {
            id: 'customer-complaints',
            label: 'Customer Complaints',
            href: '/masters/customer-complaints',
          },
          {
            id: 'promotions',
            label: 'Promotions',
            href: '/masters/promotions',
          },
        ],
      },
    ],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: MdShoppingCart,
    children: [
      {
        id: 'sales-operations',
        label: 'Sales Operations',
        children: [
          {
            id: 'order-entry',
            label: 'Order Entry',
            href: '/transactions/orders',
          },
          {
            id: 'invoice-management',
            label: 'Invoice Management',
            href: '/transactions/invoices',
          },
          {
            id: 'credit-notes',
            label: 'Credit Notes',
            href: '/transactions/credit-notes',
          },
          {
            id: 'payment-collection',
            label: 'Payment Collection',
            href: '/transactions/payments',
          },
        ],
      },
      {
        id: 'delivery-returns',
        label: 'Delivery & Returns',
        children: [
          {
            id: 'delivery-scheduling',
            label: 'Delivery Scheduling',
            href: '/transactions/delivery',
          },
          {
            id: 'return-requests',
            label: 'Return Requests',
            href: '/transactions/returns',
          },
        ],
      },
      {
        id: 'asset-cooler-management',
        label: 'Asset & Cooler Management',
        children: [
          {
            id: 'asset-movement',
            label: 'Asset Movement',
            href: '/transactions/asset-movement',
          },
          {
            id: 'asset-maintenance',
            label: 'Asset Maintenance',
            href: '/transactions/maintenance',
          },
          {
            id: 'cooler-installations',
            label: 'Cooler Installations',
            href: '/transactions/installations',
          },
          {
            id: 'cooler-inspections',
            label: 'Cooler Inspections',
            href: '/transactions/inspections',
          },
        ],
      },
      {
        id: 'van-warehouse-stock',
        label: 'Van & Stock Operations',
        children: [
          {
            id: 'van-stock',
            label: 'Van Stock Load/Unload',
            href: '/transactions/van-stock',
          },
          {
            id: 'stock-movements',
            label: 'Stock Movements',
            href: '/transactions/stock-movements',
          },
          {
            id: 'stock-transfer-requests',
            label: 'Stock Transfer Requests',
            href: '/transactions/stock-transfer',
          },
        ],
      },
      {
        id: 'field-visit-market',
        label: 'Field Visit & Market Activities',
        children: [
          {
            id: 'visit-logging',
            label: 'Visit Logging',
            href: '/transactions/visits',
          },
          {
            id: 'competitor-activity',
            label: 'Competitor Activity',
            href: '/transactions/competitor',
          },
        ],
      },
    ],
  },
  {
    id: 'tracking',
    label: 'Tracking',
    icon: MdMap,
    children: [
      {
        id: 'rep-location',
        label: 'Rep Location Tracking',
        href: '/tracking/location',
      },
      {
        id: 'route-effectiveness',
        label: 'Route Effectiveness',
        href: '/tracking/routes',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: MdBarChart,
    children: [
      {
        id: 'orders-invoices-returns',
        label: 'Orders, Invoices, Returns',
        href: '/reports/orders',
      },
      {
        id: 'sales-vs-target',
        label: 'Sales vs Target',
        href: '/reports/sales-target',
      },
      {
        id: 'asset-movement-status',
        label: 'Asset Movement/Status',
        href: '/reports/asset-status',
      },
      {
        id: 'visit-frequency',
        label: 'Visit Frequency/Completion',
        href: '/reports/visits',
      },
      {
        id: 'promo-effectiveness',
        label: 'Promo Effectiveness',
        href: '/reports/promos',
      },
      {
        id: 'region-territory',
        label: 'Region/Territory Sales',
        href: '/reports/territory',
      },
      {
        id: 'rep-productivity',
        label: 'Rep Productivity',
        href: '/reports/productivity',
      },
      {
        id: 'competitor-analysis',
        label: 'Competitor Analysis',
        href: '/reports/competitor',
      },
      {
        id: 'outstanding-collection',
        label: 'Outstanding & Collection',
        href: '/reports/collection',
      },
      {
        id: 'attendance-history',
        label: 'Attendance History',
        href: '/reports/attendance-history',
      },
      {
        id: 'activity-logs',
        label: 'Audit Logs',
        href: '/reports/audit-logs',
      },
      {
        id: 'survey-responses',
        label: 'Survey Responses',
        href: '/reports/survey-responses',
      },
    ],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: MdNotifications,
    children: [
      {
        id: 'approval-setup',
        label: 'Approval Setup',
        href: '/workflows/approval-setup',
      },
      {
        id: 'approval-requests',
        label: 'Approval Requests',
        href: '/workflows/approvals',
      },
      {
        id: 'route-exceptions',
        label: 'Route Exceptions',
        href: '/workflows/exceptions',
      },
      {
        id: 'alerts-reminders',
        label: 'Alerts & Reminders',
        href: '/workflows/alerts',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: MdSettings,
    children: [
      {
        id: 'profile',
        label: 'My Profile',
        href: '/profile',
      },
      {
        id: 'login-history',
        label: 'Login History',
        href: '/settings/login-history',
      },
      { id: 'api-tokens', label: 'API Tokens', href: '/settings/tokens' },
      {
        id: 'system-settings',
        label: 'System Settings',
        href: '/settings/system',
      },
    ],
  },
];

export default menuItems;
