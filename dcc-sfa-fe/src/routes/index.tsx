import ProtectedRoute from 'components/ProtectedRoute';
import Layout from 'layout';
import Login from 'pages/auth/Login';
import ExecutiveDashboard from 'pages/dashboards/ExecutiveDashboard';
import CompaniesManagement from 'pages/masters/Companies';
import DepotsManagement from 'pages/masters/Depot';
import OutletsManagement from 'pages/masters/Outlet';
import ProductsManagement from 'pages/masters/Product';
import RolePermissions from 'pages/masters/RolePermissions';
import RoutesManagement from 'pages/masters/Routes';
import SurveyBuilder from 'pages/masters/SurveyBuilder';
import Users from 'pages/masters/Users';
import ZonesManagement from 'pages/masters/Zone';
import OrdersManagement from 'pages/transactions/Orders';
import SurveyAnswers from 'pages/transactions/VisitLogging';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const OutletGroups = () => <h1>Outlet Groups</h1>;
const AssetTypes = () => <h1>Asset Types</h1>;
const AssetMaster = () => <h1>Asset Master</h1>;
const WarehouseMaster = () => <h1>Warehouse Master</h1>;
const VehicleMaster = () => <h1>Vehicle Master</h1>;
const Pricelists = () => <h1>Pricelists</h1>;
const SalesTargetGroups = () => <h1>Sales Target Groups</h1>;
const SalesBonusRules = () => <h1>Sales Bonus Rules</h1>;
const KPITargets = () => <h1>KPI Targets</h1>;

// Transaction Components
const DeliveryScheduling = () => <h1>Delivery Scheduling</h1>;
const ReturnRequests = () => <h1>Return Requests</h1>;
const PaymentCollection = () => <h1>Payment Collection</h1>;
const InvoiceManagement = () => <h1>Invoice Management</h1>;
const CreditNotes = () => <h1>Credit Notes</h1>;
const AssetMovement = () => <h1>Asset Movement</h1>;
const AssetMaintenance = () => <h1>Asset Maintenance</h1>;
const CoolerInstallations = () => <h1>Cooler Installations</h1>;
const VanStock = () => <h1>Van Stock Load/Unload</h1>;
const CompetitorActivity = () => <h1>Competitor Activity</h1>;

// Tracking Components
const RepLocationTracking = () => <h1>Rep Location Tracking</h1>;
const RouteEffectiveness = () => <h1>Route Effectiveness</h1>;

// Integration Components
const ERPSyncLog = () => <h1>ERP Sync Log</h1>;

// Reports Components
const OrdersInvoicesReturns = () => <h1>Orders, Invoices, Returns</h1>;
const SalesVsTarget = () => <h1>Sales vs Target</h1>;
const AssetMovementStatus = () => <h1>Asset Movement/Status</h1>;
const VisitFrequency = () => <h1>Visit Frequency/Completion</h1>;
const PromoEffectiveness = () => <h1>Promo Effectiveness</h1>;
const RegionTerritory = () => <h1>Region/Territory Sales Report</h1>;
const RepProductivity = () => <h1>Rep Productivity Report</h1>;
const CompetitorAnalysis = () => <h1>Competitor Analysis Report</h1>;
const OutstandingCollection = () => <h1>Outstanding & Collection Report</h1>;
const ActivityLogs = () => <h1>Activity Logs</h1>;

// Workflows Components
const ApprovalWorkflows = () => <h1>Approval Workflows</h1>;
const RouteExceptions = () => <h1>Route Exceptions</h1>;
const AlertsReminders = () => <h1>Alerts & Reminders</h1>;

// Settings Components
const LoginHistory = () => <h1>Login History</h1>;
const APITokens = () => <h1>API Tokens</h1>;
const SystemSettings = () => <h1>System Settings</h1>;

const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <Login />,
  },
  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard Routes
      {
        path: '/',
        element: <ExecutiveDashboard />,
      },
      {
        path: '/dashboard/executive',
        element: <ExecutiveDashboard />,
      },

      // Masters Routes
      {
        path: '/masters/company',
        element: <CompaniesManagement />,
      },
      {
        path: '/masters/users',
        element: <Users />,
      },
      {
        path: '/masters/roles',
        element: <RolePermissions />,
      },
      {
        path: '/masters/depots',
        element: <DepotsManagement />,
      },
      {
        path: '/masters/zones',
        element: <ZonesManagement />,
      },
      {
        path: '/masters/routes',
        element: <RoutesManagement />,
      },
      {
        path: '/masters/outlets',
        element: <OutletsManagement />,
      },
      {
        path: '/masters/outlet-groups',
        element: <OutletGroups />,
      },
      {
        path: '/masters/asset-types',
        element: <AssetTypes />,
      },
      {
        path: '/masters/assets',
        element: <AssetMaster />,
      },
      {
        path: '/masters/warehouses',
        element: <WarehouseMaster />,
      },
      {
        path: '/masters/vehicles',
        element: <VehicleMaster />,
      },
      {
        path: '/masters/products',
        element: <ProductsManagement />,
      },
      {
        path: '/masters/pricelists',
        element: <Pricelists />,
      },
      {
        path: '/masters/sales-targets',
        element: <SalesTargetGroups />,
      },
      {
        path: '/masters/bonus-rules',
        element: <SalesBonusRules />,
      },
      {
        path: '/masters/kpi-targets',
        element: <KPITargets />,
      },
      {
        path: '/masters/surveys',
        element: <SurveyBuilder />,
      },

      // Transaction Routes
      {
        path: '/transactions/orders',
        element: <OrdersManagement />,
      },
      {
        path: '/transactions/delivery',
        element: <DeliveryScheduling />,
      },
      {
        path: '/transactions/returns',
        element: <ReturnRequests />,
      },
      {
        path: '/transactions/payments',
        element: <PaymentCollection />,
      },
      {
        path: '/transactions/invoices',
        element: <InvoiceManagement />,
      },
      {
        path: '/transactions/credit-notes',
        element: <CreditNotes />,
      },
      {
        path: '/transactions/visits',
        element: <SurveyAnswers />,
      },
      {
        path: '/transactions/asset-movement',
        element: <AssetMovement />,
      },
      {
        path: '/transactions/maintenance',
        element: <AssetMaintenance />,
      },
      {
        path: '/transactions/installations',
        element: <CoolerInstallations />,
      },
      {
        path: '/transactions/van-stock',
        element: <VanStock />,
      },
      {
        path: '/transactions/competitor',
        element: <CompetitorActivity />,
      },

      // Tracking Routes
      {
        path: '/tracking/location',
        element: <RepLocationTracking />,
      },
      {
        path: '/tracking/routes',
        element: <RouteEffectiveness />,
      },

      // Integration Routes
      {
        path: '/integration/erp-sync',
        element: <ERPSyncLog />,
      },

      // Reports Routes
      {
        path: '/reports/orders',
        element: <OrdersInvoicesReturns />,
      },
      {
        path: '/reports/sales-target',
        element: <SalesVsTarget />,
      },
      {
        path: '/reports/asset-status',
        element: <AssetMovementStatus />,
      },
      {
        path: '/reports/visits',
        element: <VisitFrequency />,
      },
      {
        path: '/reports/promos',
        element: <PromoEffectiveness />,
      },
      {
        path: '/reports/territory',
        element: <RegionTerritory />,
      },
      {
        path: '/reports/productivity',
        element: <RepProductivity />,
      },
      {
        path: '/reports/competitor',
        element: <CompetitorAnalysis />,
      },
      {
        path: '/reports/collection',
        element: <OutstandingCollection />,
      },
      {
        path: '/reports/activity',
        element: <ActivityLogs />,
      },

      // Workflows Routes
      {
        path: '/workflows/approvals',
        element: <ApprovalWorkflows />,
      },
      {
        path: '/workflows/exceptions',
        element: <RouteExceptions />,
      },
      {
        path: '/workflows/alerts',
        element: <AlertsReminders />,
      },

      // Settings Routes
      {
        path: '/settings/login-history',
        element: <LoginHistory />,
      },
      {
        path: '/settings/tokens',
        element: <APITokens />,
      },
      {
        path: '/settings/system',
        element: <SystemSettings />,
      },
    ],
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
