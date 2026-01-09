import type { IconType } from 'react-icons';
import {
  MdAssignment,
  MdAttachMoney,
  MdBarChart,
  MdBuild,
  MdBusiness,
  MdCategory,
  MdDashboard,
  // MdDeliveryDining,
  MdFolder,
  MdLocalShipping,
  MdLocationOn,
  MdMap,
  MdNotifications,
  MdPayment,
  MdPeople,
  MdPerson,
  MdReceipt,
  MdRoute,
  MdSettings,
  MdShoppingCart,
  MdStore,
  MdSwapHoriz,
  MdTrendingUp,
  MdWarehouse,
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
    children: [
      {
        id: 'executive-dashboard',
        label: 'Executive Dashboard',
        icon: MdDashboard,
        href: '/dashboard/executive',
      },
    ],
  },
  {
    id: 'masters',
    label: 'Masters',
    children: [
      {
        id: 'organization-setup',
        label: 'Organization Setup',
        icon: MdBusiness,
        children: [
          // {
          //   id: 'company-master',
          //   label: 'Company Master',
          //   href: '/masters/company',
          // },
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
        icon: MdLocalShipping,
        children: [
          // {
          //   id: 'warehouse-master',
          //   label: 'Warehouse Master',
          //   href: '/masters/warehouses',
          // },
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
        icon: MdStore,
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
            id: 'outlet-channel',
            label: 'Outlet Channel',
            href: '/masters/outlet-channel',
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
        icon: MdCategory,
        children: [
          {
            id: 'brands',
            label: 'Brands',
            href: '/masters/brands',
          },
          {
            id: 'product-categories',
            label: 'Categories',
            href: '/masters/product-categories',
          },
          {
            id: 'product-sub-categories',
            label: 'Sub Categories',
            href: '/masters/product-sub-categories',
          },
          {
            id: 'unit-of-measurement',
            label: 'Unit of Measurement',
            href: '/masters/unit-of-measurement',
          },
          {
            id: 'product-flavours',
            label: 'Flavours',
            href: '/masters/product-flavours',
          },
          {
            id: 'product-volumes',
            label: 'Volumes',
            href: '/masters/product-volumes',
          },
          {
            id: 'product-shelf-life',
            label: 'Shelf Life',
            href: '/masters/product-shelf-life',
          },
          {
            id: 'product-types',
            label: 'Product Types',
            href: '/masters/product-types',
          },
          {
            id: 'product-target-groups',
            label: 'Product Target Groups',
            href: '/masters/product-target-groups',
          },
          {
            id: 'product-web-orders',
            label: 'Web Orders',
            href: '/masters/product-web-orders',
          },
          {
            id: 'product-catalog',
            label: 'Product Catalog',
            href: '/masters/products',
          },

          {
            id: 'batch-lots',
            label: 'Batch & Lot Management',
            href: '/masters/batch-lots',
          },
          {
            id: 'tax-master',
            label: 'Tax Master',
            href: '/masters/tax-master',
          },
          // {
          //   id: 'pricelists',
          //   label: 'Pricelists',
          //   href: '/masters/pricelists',
          // },
        ],
      },
      {
        id: 'sales-planning-targets',
        label: 'Sales Planning & Targets',
        icon: MdTrendingUp,
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
        icon: MdAssignment,
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
    children: [
      {
        id: 'sales-operations',
        label: 'Sales Operations',
        icon: MdShoppingCart,
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
            id: 'inventory-items',
            label: 'Inventory Items',
            href: '/masters/inventory-items',
          },
          // {
          //   id: 'credit-notes',
          //   label: 'Credit Notes',
          //   href: '/transactions/credit-notes',
          // },
          {
            id: 'payment-collection',
            label: 'Payment Collection',
            href: '/transactions/payments',
          },
        ],
      },
      // {
      //   id: 'delivery-returns',
      //   label: 'Delivery & Returns',
      //   icon: MdDeliveryDining,
      //   children: [
      //     {
      //       id: 'delivery-scheduling',
      //       label: 'Delivery Scheduling',
      //       href: '/transactions/delivery',
      //     },
      //     {
      //       id: 'return-requests',
      //       label: 'Return Requests',
      //       href: '/transactions/returns',
      //     },
      //   ],
      // },
      {
        id: 'asset-cooler-management',
        label: 'Asset & Cooler Management',
        icon: MdBuild,
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
            id: 'cooler-types',
            label: 'Cooler Types',
            href: '/masters/cooler-types',
          },
          {
            id: 'cooler-sub-types',
            label: 'Cooler Sub Types',
            href: '/masters/cooler-sub-types',
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
        icon: MdWarehouse,
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
          // {
          //   id: 'stock-transfer-requests',
          //   label: 'Stock Transfer Requests',
          //   href: '/transactions/stock-transfer',
          // },
        ],
      },
      {
        id: 'field-visit-market',
        label: 'Field Visit & Market Activities',
        icon: MdLocationOn,
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
    children: [
      {
        id: 'rep-location',
        label: 'Rep Location Tracking',
        icon: MdMap,
        href: '/tracking/location',
      },
      {
        id: 'route-effectiveness',
        label: 'Route Effectiveness',
        icon: MdRoute,
        href: '/tracking/routes',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    children: [
      {
        id: 'orders-invoices-returns',
        label: 'Orders, Invoices, Returns',
        icon: MdReceipt,
        href: '/reports/orders',
      },
      {
        id: 'sales-vs-target',
        label: 'Sales vs Target',
        icon: MdTrendingUp,
        href: '/reports/sales-target',
      },
      {
        id: 'asset-movement-status',
        label: 'Asset Movement/Status',
        icon: MdSwapHoriz,
        href: '/reports/asset-status',
      },
      {
        id: 'visit-frequency',
        label: 'Visit Frequency/Completion',
        icon: MdLocationOn,
        href: '/reports/visits',
      },
      {
        id: 'promo-effectiveness',
        label: 'Promo Effectiveness',
        icon: MdAttachMoney,
        href: '/reports/promos',
      },
      {
        id: 'region-territory',
        label: 'Region/Territory Sales',
        icon: MdMap,
        href: '/reports/territory',
      },
      {
        id: 'rep-productivity',
        label: 'Rep Productivity',
        icon: MdPeople,
        href: '/reports/productivity',
      },
      {
        id: 'competitor-analysis',
        label: 'Competitor Analysis',
        icon: MdBarChart,
        href: '/reports/competitor',
      },
      {
        id: 'outstanding-collection',
        label: 'Outstanding & Collection',
        icon: MdPayment,
        href: '/reports/collection',
      },
      {
        id: 'attendance-history',
        label: 'Attendance History',
        icon: MdAssignment,
        href: '/reports/attendance-history',
      },
      {
        id: 'activity-logs',
        label: 'Audit Logs',
        icon: MdFolder,
        href: '/reports/audit-logs',
      },
      {
        id: 'survey-responses',
        label: 'Survey Responses',
        icon: MdAssignment,
        href: '/reports/survey-responses',
      },
    ],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    children: [
      {
        id: 'approval-setup',
        label: 'Approval Setup',
        icon: MdSettings,
        href: '/workflows/approval-setup',
      },
      {
        id: 'approval-requests',
        label: 'Approval Requests',
        icon: MdNotifications,
        href: '/workflows/approvals',
      },
      {
        id: 'route-exceptions',
        label: 'Route Exceptions',
        icon: MdRoute,
        href: '/workflows/exceptions',
      },
      {
        id: 'alerts-reminders',
        label: 'Alerts & Reminders',
        icon: MdNotifications,
        href: '/workflows/alerts',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    children: [
      {
        id: 'profile',
        label: 'My Profile',
        icon: MdPerson,
        href: '/profile',
      },
      {
        id: 'login-history',
        label: 'Login History',
        icon: MdAssignment,
        href: '/settings/login-history',
      },
      {
        id: 'api-tokens',
        label: 'API Tokens',
        icon: MdSettings,
        href: '/settings/tokens',
      },
      {
        id: 'system-settings',
        label: 'System Settings',
        icon: MdSettings,
        href: '/settings/system',
      },
    ],
  },
];

export default menuItems;
