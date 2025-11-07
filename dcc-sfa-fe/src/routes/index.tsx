import ProtectedRoute from 'components/ProtectedRoute';
import Layout from 'layout';
import Login from 'pages/auth/Login';
import PrivacyPolicy from 'pages/auth/PrivacyPolicy';
import ExecutiveDashboard from 'pages/dashboards/ExecutiveDashboard';
import ApiTokensPage from 'pages/masters/ApiTokens';
import AssetMaintenanceManagement from 'pages/masters/AssetMaintenance';
import AssetMasterManagement from 'pages/masters/AssetMaster';
import AssetMovementManagement from 'pages/masters/AssetMovement';
import AssetTypesManagement from 'pages/masters/AssetTypes';
import BrandsManagement from 'pages/masters/Brands';
import CompaniesManagement from 'pages/masters/Companies';
import CompetitorActivityManagement from 'pages/masters/CompetitorActivity';
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
import RouteTypesManagement from 'pages/masters/RouteTypes';
import SalesBonusRulesManagement from 'pages/masters/SalesBonusRules';
import SalesTargetGroupsManagement from 'pages/masters/SalesTargetGroups';
import SalesTargetsManagement from 'pages/masters/SalesTargets';
import StockMovementsManagement from 'pages/masters/StockMovements';
import StockTransferRequestsManagement from 'pages/masters/StockTransferRequests';
import SurveyBuilder from 'pages/masters/SurveyBuilder';
import UnitOfMeasurementManagement from 'pages/masters/UnitOfMeasurement';
import Users from 'pages/masters/Users';
import UserDetail from 'pages/masters/Users/UserDetail';
import VanStockManagement from 'pages/masters/VanStock';
import VehiclesManagement from 'pages/masters/Vehicles';
import WarehousesManagement from 'pages/masters/Warehouses';
import ZonesManagement from 'pages/masters/Zone';
import Profile from 'pages/Profile';
import AssetMovementStatusReport from 'pages/reports/AssetMovementStatusReport';
import CompetitorAnalysisReport from 'pages/reports/CompetitorAnalysisReport';
import OrdersInvoicesReturnsReport from 'pages/reports/OrdersInvoicesReturnsReport';
import OutstandingCollectionReport from 'pages/reports/OutstandingCollectionReport';
import PromoEffectivenessReport from 'pages/reports/PromoEffectivenessReport';
import RegionTerritorySalesReport from 'pages/reports/RegionTerritorySalesReport';
import RepProductivityReport from 'pages/reports/RepProductivityReport';
import SalesVsTargetReport from 'pages/reports/SalesVsTargetReport';
import VisitFrequencyCompletionReport from 'pages/reports/VisitFrequencyCompletionReport';
import RepLocationTracking from 'pages/tracking/RepLocationTracking';
import RouteEffectiveness from 'pages/tracking/RouteEffectiveness';
import CoolerInspectionsManagement from 'pages/transactions/CoolerInspections';
import CoolerInspectionDetail from 'pages/transactions/CoolerInspections/CoolerInspectionDetail';
import CoolerInstallationsManagement from 'pages/transactions/CoolerInstallations';
import CoolerInstallationDetail from 'pages/transactions/CoolerInstallations/CoolerInstallationDetail';
import CreditNotesManagement from 'pages/transactions/CreditNotes';
import DeliveryScheduling from 'pages/transactions/DeliveryScheduling';
import InvoicesManagement from 'pages/transactions/Invoices';
import OrdersManagement from 'pages/transactions/Orders';
import OrderDetail from 'pages/transactions/Orders/OrderDetail';
import PaymentCollection from 'pages/transactions/PaymentCollection';
import PaymentDetail from 'pages/transactions/PaymentCollection/PaymentDetail';
import ReturnRequests from 'pages/transactions/ReturnRequests';
import ReturnRequestDetail from 'pages/transactions/ReturnRequests/ReturnRequestDetail';
import SurveyAnswers from 'pages/transactions/VisitLogging';
import AuditLogs from 'pages/reports/AuditLogs';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ApprovalWorkflows from 'pages/workflows/ApprovalWorkflows';
import RouteExceptions from 'pages/workflows/RouteExceptions';
import AlertsReminders from 'pages/workflows/AlertsReminders';
import NotFound from 'pages/NotFound';
const SystemSettings = () => <h1>System Settings</h1>;

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
        element: <BrandsManagement />,
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
        path: '/masters/route-types',
        element: <RouteTypesManagement />,
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
        path: '/masters/sales-bonus-rules',
        element: <SalesBonusRulesManagement />,
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
        path: '/transactions/orders/:id',
        element: <OrderDetail />,
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
        path: '/transactions/returns/:id',
        element: <ReturnRequestDetail />,
      },
      {
        path: '/transactions/payments',
        element: <PaymentCollection />,
      },
      {
        path: '/transactions/payments/:id',
        element: <PaymentDetail />,
      },
      {
        path: '/transactions/invoices',
        element: <InvoicesManagement />,
      },
      {
        path: '/transactions/credit-notes',
        element: <CreditNotesManagement />,
      },
      {
        path: '/transactions/visits',
        element: <SurveyAnswers />,
      },
      {
        path: '/transactions/asset-movement',
        element: <AssetMovementManagement />,
      },
      {
        path: '/transactions/competitor',
        element: <CompetitorActivityManagement />,
      },
      {
        path: '/transactions/maintenance',
        element: <AssetMaintenanceManagement />,
      },
      {
        path: '/transactions/installations',
        element: <CoolerInstallationsManagement />,
      },
      {
        path: '/transactions/installations/:id',
        element: <CoolerInstallationDetail />,
      },
      {
        path: '/transactions/inspections',
        element: <CoolerInspectionsManagement />,
      },
      {
        path: '/transactions/inspections/:id',
        element: <CoolerInspectionDetail />,
      },
      {
        path: '/transactions/stock-transfer',
        element: <StockTransferRequestsManagement />,
      },
      {
        path: '/transactions/stock-movements',
        element: <StockMovementsManagement />,
      },
      {
        path: '/transactions/van-stock',
        element: <VanStockManagement />,
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
        path: '/reports/orders',
        element: <OrdersInvoicesReturnsReport />,
      },
      {
        path: '/reports/sales-target',
        element: <SalesVsTargetReport />,
      },
      {
        path: '/reports/asset-status',
        element: <AssetMovementStatusReport />,
      },
      {
        path: '/reports/visits',
        element: <VisitFrequencyCompletionReport />,
      },
      {
        path: '/reports/promos',
        element: <PromoEffectivenessReport />,
      },
      {
        path: '/reports/territory',
        element: <RegionTerritorySalesReport />,
      },
      {
        path: '/reports/productivity',
        element: <RepProductivityReport />,
      },
      {
        path: '/reports/competitor',
        element: <CompetitorAnalysisReport />,
      },
      {
        path: '/reports/collection',
        element: <OutstandingCollectionReport />,
      },
      {
        path: '/reports/audit-logs',
        element: <AuditLogs />,
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
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
