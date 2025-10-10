import ProtectedRoute from 'components/ProtectedRoute';
import Layout from 'layout';
import Login from 'pages/auth/Login';
import PrivacyPolicy from 'pages/auth/PrivacyPolicy';
import ExecutiveDashboard from 'pages/dashboards/ExecutiveDashboard';
import ApiTokensPage from 'pages/masters/ApiTokens';
import AssetMasterManagement from 'pages/masters/AssetMaster';
import AssetTypesManagement from 'pages/masters/AssetTypes';
import CompaniesManagement from 'pages/masters/Companies';
import CurrenciesManagement from 'pages/masters/Currencies';
import DepotsManagement from 'pages/masters/Depot';
import KpiTargetsManagement from 'pages/masters/KpiTargets';
import LoginHistoryPage from 'pages/masters/LoginHistory';
import OutletsManagement from 'pages/masters/Outlet';
import OutletDetail from 'pages/masters/Outlet/OutletDetail';
import OutletGroupsManagement from 'pages/masters/OutletGroups';
import PriceListsManagement from 'pages/masters/PriceLists';
import ProductCategoriesManagement from 'pages/masters/ProductCategories';
import ProductsManagement from 'pages/masters/Products';
import ProductSubCategoriesManagement from 'pages/masters/ProductSubCategories';
import RolePermissions from 'pages/masters/RolePermissions';
import RoutesManagement from 'pages/masters/Routes';
import SalesTargetGroupsManagement from 'pages/masters/SalesTargetGroups';
import SalesTargetsManagement from 'pages/masters/SalesTargets';
import SurveyBuilder from 'pages/masters/SurveyBuilder';
import Users from 'pages/masters/Users';
import UserDetail from 'pages/masters/Users/UserDetail';
import VehiclesManagement from 'pages/masters/Vehicles';
import WarehousesManagement from 'pages/masters/Warehouses';
import ZonesManagement from 'pages/masters/Zone';
import Profile from 'pages/Profile';
import OrdersManagement from 'pages/transactions/Orders';
import SurveyAnswers from 'pages/transactions/VisitLogging';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const BrandManagement = () => <h1>Brand Management</h1>;
const SalesBonusRules = () => <h1>Sales Bonus Rules</h1>;
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
const RepLocationTracking = () => <h1>Rep Location Tracking</h1>;
const RouteEffectiveness = () => <h1>Route Effectiveness</h1>;
const ERPSyncLog = () => <h1>ERP Sync Log</h1>;
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
const ApprovalWorkflows = () => <h1>Approval Workflows</h1>;
const RouteExceptions = () => <h1>Route Exceptions</h1>;
const AlertsReminders = () => <h1>Alerts & Reminders</h1>;
const SystemSettings = () => <h1>System Settings</h1>;
const UnitOfMeasurementManagement = () => <h1>Unit of Measurement</h1>;

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicy />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <ExecutiveDashboard />,
      },
      {
        path: '/dashboard/executive',
        element: <ExecutiveDashboard />,
      },

      {
        path: '/masters/brands',
        element: <BrandManagement />,
      },
      {
        path: '/masters/company',
        element: <CompaniesManagement />,
      },
      {
        path: '/masters/users',
        element: <Users />,
      },
      {
        path: '/masters/users/:id',
        element: <UserDetail />,
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
        path: '/masters/currency',
        element: <CurrenciesManagement />,
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
        path: '/masters/outlets/:id',
        element: <OutletDetail />,
      },
      {
        path: '/masters/outlet-groups',
        element: <OutletGroupsManagement />,
      },
      {
        path: '/masters/asset-types',
        element: <AssetTypesManagement />,
      },
      {
        path: '/masters/asset-master',
        element: <AssetMasterManagement />,
      },
      {
        path: '/masters/warehouses',
        element: <WarehousesManagement />,
      },
      {
        path: '/masters/vehicles',
        element: <VehiclesManagement />,
      },
      {
        path: '/masters/products',
        element: <ProductsManagement />,
      },
      {
        path: '/masters/product-categories',
        element: <ProductCategoriesManagement />,
      },
      {
        path: '/masters/product-sub-categories',
        element: <ProductSubCategoriesManagement />,
      },
      {
        path: '/masters/unit-of-measurement',
        element: <UnitOfMeasurementManagement />,
      },
      {
        path: '/masters/pricelists',
        element: <PriceListsManagement />,
      },
      {
        path: '/settings/login-history',
        element: <LoginHistoryPage />,
      },
      {
        path: '/masters/sales-target-groups',
        element: <SalesTargetGroupsManagement />,
      },
      {
        path: '/masters/sales-targets',
        element: <SalesTargetsManagement />,
      },
      {
        path: '/masters/bonus-rules',
        element: <SalesBonusRules />,
      },
      {
        path: '/masters/kpi-targets',
        element: <KpiTargetsManagement />,
      },
      {
        path: '/masters/surveys',
        element: <SurveyBuilder />,
      },
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
      {
        path: '/tracking/location',
        element: <RepLocationTracking />,
      },
      {
        path: '/tracking/routes',
        element: <RouteEffectiveness />,
      },
      {
        path: '/integration/erp-sync',
        element: <ERPSyncLog />,
      },
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
      {
        path: '/settings/tokens',
        element: <ApiTokensPage />,
      },
      {
        path: '/settings/system',
        element: <SystemSettings />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
    ],
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
