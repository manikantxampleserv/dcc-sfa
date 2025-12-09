import ProtectedRoute from 'components/ProtectedRoute';
import PermissionGuard from 'shared/PermissionGuard';
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
import CustomerCategoryPage from 'pages/masters/CustomerCategory';
import CustomerTypePage from 'pages/masters/CustomerType';
import CustomerComplaintsPage from 'pages/masters/CustomerComplaints';
import CurrenciesManagement from 'pages/masters/Currencies';
import DepotsManagement from 'pages/masters/Depot';
import DepotDetail from 'pages/masters/Depot/DepotDetail';
import KpiTargetsManagement from 'pages/masters/KpiTargets';
import LoginHistoryPage from 'pages/masters/LoginHistory';
import OutletsManagement from 'pages/masters/Outlet';
import OutletDetail from 'pages/masters/Outlet/OutletDetail';
import OutletGroupsManagement from 'pages/masters/OutletGroups';
import PriceListsManagement from 'pages/masters/PriceLists';
import ProductCategoriesManagement from 'pages/masters/ProductCategories';
import ProductsManagement from 'pages/masters/Products';
import PromotionsManagement from 'pages/masters/Promotions';
import PromotionDetail from 'pages/masters/Promotions/PromotionDetail';
import ProductSubCategoriesManagement from 'pages/masters/ProductSubCategories';
import RolePermissions from 'pages/masters/RolePermissions';
import RoutesManagement from 'pages/masters/Routes';
import RouteDetail from 'pages/masters/Routes/RouteDetail';
import RouteTypesManagement from 'pages/masters/RouteTypes';
import SalesBonusRulesManagement from 'pages/masters/SalesBonusRules';
import SalesTargetGroupsManagement from 'pages/masters/SalesTargetGroups';
import SalesTargetsManagement from 'pages/masters/SalesTargets';
import StockMovementsManagement from 'pages/masters/StockMovements';
import StockTransferRequestsManagement from 'pages/masters/StockTransferRequests';
import SurveyBuilder from 'pages/masters/SurveyBuilder';
import SurveyDetail from 'pages/masters/SurveyBuilder/SurveyDetail';
import UnitOfMeasurementManagement from 'pages/masters/UnitOfMeasurement';
import Users from 'pages/masters/Users';
import UserDetail from 'pages/masters/Users/UserDetail';
import VanStockManagement from 'pages/masters/VanStock';
import VehiclesManagement from 'pages/masters/Vehicles';
import WarehousesManagement from 'pages/masters/Warehouses';
import ZonesManagement from 'pages/masters/Zone';
import NotFound from 'pages/NotFound';
import Unauthorized from 'pages/Unauthorized';
import Profile from 'pages/Profile';
import AssetMovementStatusReport from 'pages/reports/AssetMovementStatusReport';
import AttendanceReports from 'pages/reports/AttendanceReports';
import AuditLogs from 'pages/reports/AuditLogs';
import CompetitorAnalysisReport from 'pages/reports/CompetitorAnalysisReport';
import OrdersInvoicesReturnsReport from 'pages/reports/OrdersInvoicesReturnsReport';
import OutstandingCollectionReport from 'pages/reports/OutstandingCollectionReport';
import PromoEffectivenessReport from 'pages/reports/PromoEffectivenessReport';
import RegionTerritorySalesReport from 'pages/reports/RegionTerritorySalesReport';
import RepProductivityReport from 'pages/reports/RepProductivityReport';
import SalesVsTargetReport from 'pages/reports/SalesVsTargetReport';
import SurveyResponses from 'pages/reports/SurveyResponses';
import SurveyResponseDetail from 'pages/reports/SurveyResponses/SurveyResponseDetail';
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
import VisitDetail from 'pages/transactions/VisitLogging/VisitDetail';
import AlertsReminders from 'pages/workflows/AlertsReminders';
import ApprovalSetup from 'pages/workflows/ApprovalSetup';
import ApprovalWorkflows from 'pages/workflows/ApprovalWorkflows';
import RouteExceptions from 'pages/workflows/RouteExceptions';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SystemSettings from 'pages/settings/SystemSettings';
import UpdatedPromotionsManagement from 'pages/masters/UpdatedPromotions';
import UpdatedPromotionDetail from 'pages/masters/UpdatedPromotions/UpdatedPromotionDetail';

const router = createBrowserRouter(
  [
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
          element: (
            <PermissionGuard module="brand" action="read">
              <BrandsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/company',
          element: (
            <PermissionGuard module="company" action="read">
              <CompaniesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/users',
          element: (
            <PermissionGuard module="user" action="read">
              <Users />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/users/:id',
          element: (
            <PermissionGuard module="user" action="read">
              <UserDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/roles',
          element: (
            <PermissionGuard module="role" action="read">
              <RolePermissions />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/depots',
          element: (
            <PermissionGuard module="depot" action="read">
              <DepotsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/depots/:id',
          element: (
            <PermissionGuard module="depot" action="read">
              <DepotDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/zones',
          element: (
            <PermissionGuard module="zone" action="read">
              <ZonesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/currency',
          element: (
            <PermissionGuard module="currency" action="read">
              <CurrenciesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/routes',
          element: (
            <PermissionGuard module="route" action="read">
              <RoutesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/routes/:id',
          element: (
            <PermissionGuard module="route" action="read">
              <RouteDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/route-types',
          element: (
            <PermissionGuard module="route-type" action="read">
              <RouteTypesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/outlets',
          element: (
            <PermissionGuard module="outlet" action="read">
              <OutletsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/outlets/:id',
          element: (
            <PermissionGuard module="outlet" action="read">
              <OutletDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/outlet-groups',
          element: (
            <PermissionGuard module="outlet-group" action="read">
              <OutletGroupsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/outlet-category',
          element: (
            <PermissionGuard module="customer-category" action="read">
              <CustomerCategoryPage />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/outlet-type',
          element: (
            <PermissionGuard module="customer-type" action="read">
              <CustomerTypePage />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/asset-types',
          element: (
            <PermissionGuard module="asset-type" action="read">
              <AssetTypesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/asset-master',
          element: (
            <PermissionGuard module="asset-master" action="read">
              <AssetMasterManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/warehouses',
          element: (
            <PermissionGuard module="warehouse" action="read">
              <WarehousesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/vehicles',
          element: (
            <PermissionGuard module="vehicle" action="read">
              <VehiclesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/products',
          element: (
            <PermissionGuard module="product" action="read">
              <ProductsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/product-categories',
          element: (
            <PermissionGuard module="product-category" action="read">
              <ProductCategoriesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/product-sub-categories',
          element: (
            <PermissionGuard module="product-sub-category" action="read">
              <ProductSubCategoriesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/unit-of-measurement',
          element: (
            <PermissionGuard module="unit-of-measurement" action="read">
              <UnitOfMeasurementManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/pricelists',
          element: (
            <PermissionGuard module="pricelist" action="read">
              <PriceListsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/promotions',
          element: (
            <PermissionGuard module="promotions" action="read">
              <PromotionsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/promotions/:id',
          element: (
            <PermissionGuard module="promotions" action="read">
              <PromotionDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/updated-promotions',
          element: (
            <PermissionGuard module="updated-promotion" action="read">
              <UpdatedPromotionsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/updated-promotions/:id',
          element: (
            <PermissionGuard module="updated-promotion" action="read">
              <UpdatedPromotionDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/settings/login-history',
          element: (
            <PermissionGuard module="login-history" action="read">
              <LoginHistoryPage />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/sales-target-groups',
          element: (
            <PermissionGuard module="sales-target-group" action="read">
              <SalesTargetGroupsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/sales-targets',
          element: (
            <PermissionGuard module="sales-target" action="read">
              <SalesTargetsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/sales-bonus-rules',
          element: (
            <PermissionGuard module="sales-bonus-rule" action="read">
              <SalesBonusRulesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/kpi-targets',
          element: (
            <PermissionGuard module="kpi-target" action="read">
              <KpiTargetsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/surveys',
          element: (
            <PermissionGuard module="survey" action="read">
              <SurveyBuilder />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/surveys/:id',
          element: (
            <PermissionGuard module="survey" action="read">
              <SurveyDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/customer-complaints',
          element: (
            <PermissionGuard module="customer-complaint" action="read">
              <CustomerComplaintsPage />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/orders',
          element: (
            <PermissionGuard module="order" action="read">
              <OrdersManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/orders/:id',
          element: (
            <PermissionGuard module="order" action="read">
              <OrderDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/delivery',
          element: (
            <PermissionGuard module="delivery" action="read">
              <DeliveryScheduling />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/returns',
          element: (
            <PermissionGuard module="return" action="read">
              <ReturnRequests />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/returns/:id',
          element: (
            <PermissionGuard module="return" action="read">
              <ReturnRequestDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/payments',
          element: (
            <PermissionGuard module="payment" action="read">
              <PaymentCollection />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/payments/:id',
          element: (
            <PermissionGuard module="payment" action="read">
              <PaymentDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/invoices',
          element: (
            <PermissionGuard module="invoice" action="read">
              <InvoicesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/credit-notes',
          element: (
            <PermissionGuard module="credit-note" action="read">
              <CreditNotesManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/visits',
          element: (
            <PermissionGuard module="visit" action="read">
              <SurveyAnswers />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/visits/:id',
          element: (
            <PermissionGuard module="visit" action="read">
              <VisitDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/asset-movement',
          element: (
            <PermissionGuard module="asset-movement" action="read">
              <AssetMovementManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/competitor',
          element: (
            <PermissionGuard module="competitor" action="read">
              <CompetitorActivityManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/maintenance',
          element: (
            <PermissionGuard module="maintenance" action="read">
              <AssetMaintenanceManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/installations',
          element: (
            <PermissionGuard module="installation" action="read">
              <CoolerInstallationsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/installations/:id',
          element: (
            <PermissionGuard module="installation" action="read">
              <CoolerInstallationDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/inspections',
          element: (
            <PermissionGuard module="inspection" action="read">
              <CoolerInspectionsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/inspections/:id',
          element: (
            <PermissionGuard module="inspection" action="read">
              <CoolerInspectionDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/stock-transfer',
          element: (
            <PermissionGuard module="stock-transfer" action="read">
              <StockTransferRequestsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/stock-movements',
          element: (
            <PermissionGuard module="stock-movement" action="read">
              <StockMovementsManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/transactions/van-stock',
          element: (
            <PermissionGuard module="van-stock" action="read">
              <VanStockManagement />
            </PermissionGuard>
          ),
        },
        {
          path: '/tracking/location',
          element: (
            <PermissionGuard module="report" action="read">
              <RepLocationTracking />
            </PermissionGuard>
          ),
        },
        {
          path: '/tracking/routes',
          element: (
            <PermissionGuard module="route-effectiveness" action="read">
              <RouteEffectiveness />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/orders',
          element: (
            <PermissionGuard module="report" action="read">
              <OrdersInvoicesReturnsReport />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/sales-target',
          element: (
            <PermissionGuard module="report" action="read">
              <SalesVsTargetReport />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/asset-status',
          element: (
            <PermissionGuard module="report" action="read">
              <AssetMovementStatusReport />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/visits',
          element: (
            <PermissionGuard module="report" action="read">
              <VisitFrequencyCompletionReport />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/promos',
          element: (
            <PermissionGuard module="report" action="read">
              <PromoEffectivenessReport />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/territory',
          element: (
            <PermissionGuard module="report" action="read">
              <RegionTerritorySalesReport />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/productivity',
          element: (
            <PermissionGuard module="report" action="read">
              <RepProductivityReport />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/competitor',
          element: (
            <PermissionGuard module="report" action="read">
              <CompetitorAnalysisReport />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/collection',
          element: (
            <PermissionGuard module="report" action="read">
              <OutstandingCollectionReport />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/attendance-history',
          element: (
            <PermissionGuard module="report" action="read">
              <AttendanceReports />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/audit-logs',
          element: (
            <PermissionGuard module="report" action="read">
              <AuditLogs />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/survey-responses',
          element: (
            <PermissionGuard module="survey" action="read">
              <SurveyResponses />
            </PermissionGuard>
          ),
        },
        {
          path: '/reports/survey-responses/:id',
          element: (
            <PermissionGuard module="survey" action="read">
              <SurveyResponseDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/workflows/approvals',
          element: (
            <PermissionGuard module="approval" action="read">
              <ApprovalWorkflows />
            </PermissionGuard>
          ),
        },
        {
          path: '/workflows/approval-setup',
          element: (
            <PermissionGuard module="approval" action="read">
              <ApprovalSetup />
            </PermissionGuard>
          ),
        },
        {
          path: '/workflows/exceptions',
          element: (
            <PermissionGuard module="exception" action="read">
              <RouteExceptions />
            </PermissionGuard>
          ),
        },
        {
          path: '/workflows/alerts',
          element: (
            <PermissionGuard module="alert" action="read">
              <AlertsReminders />
            </PermissionGuard>
          ),
        },
        {
          path: '/settings/tokens',
          element: (
            <PermissionGuard module="token" action="read">
              <ApiTokensPage />
            </PermissionGuard>
          ),
        },
        {
          path: '/settings/system',
          element: (
            <PermissionGuard module="setting" action="read">
              <SystemSettings />
            </PermissionGuard>
          ),
        },
        {
          path: '/profile',
          element: (
            <PermissionGuard module="profile" action="read">
              <Profile />
            </PermissionGuard>
          ),
        },
        {
          path: '/unauthorized',
          element: <Unauthorized />,
        },
        {
          path: '*',
          element: <NotFound />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
