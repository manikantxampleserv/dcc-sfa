import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from 'layout';
import Login from 'pages/auth/Login';
import Dashboard from 'pages/Dashboard';
import PlaceOrder from 'pages/Orders/PlaceOrder';
import MyOrders from 'pages/Orders/MyOrders';
import OrderDetail from 'pages/Orders/OrderDetail';
import PendingApprovals from 'pages/Approvals/PendingApprovals';
import ApprovalHistory from 'pages/Approvals/ApprovalHistory';
import DeliverySchedule from 'pages/Deliveries/Schedule';
import ProofOfDelivery from 'pages/Deliveries/ProofOfDelivery';
import DriverExecution from 'pages/Deliveries/DriverExecution';
import Returns from 'pages/Deliveries/Returns';
import InvoiceList from 'pages/Invoices/InvoiceList';
import PaymentHistory from 'pages/Invoices/PaymentHistory';
import RaiseIssue from 'pages/Issues/RaiseIssue';
import MyIssues from 'pages/Issues/MyIssues';
import Feedback from 'pages/Feedback';
import OrderSummary from 'pages/Reports/OrderSummary';
import DeliveryPerformance from 'pages/Reports/DeliveryPerformance';
import KPIScorecard from 'pages/Reports/KPIScorecard';
import Profile from 'pages/Settings/Profile';
import Notifications from 'pages/Settings/Notifications';
import { useAuth } from 'context/AuthContext';

/** Protected route wrapper */
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Orders */}
        <Route path="/orders/place" element={<ProtectedRoute roles={['customer']}><PlaceOrder /></ProtectedRoute>} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />

        {/* Approvals */}
        <Route path="/approvals/pending" element={<ProtectedRoute roles={['sales_officer']}><PendingApprovals /></ProtectedRoute>} />
        <Route path="/approvals/history" element={<ProtectedRoute roles={['sales_officer']}><ApprovalHistory /></ProtectedRoute>} />

        {/* Deliveries */}
        <Route path="/deliveries/schedule" element={<DeliverySchedule />} />
        <Route path="/deliveries/execute/:id" element={<DriverExecution />} />
        <Route path="/deliveries/pod" element={<ProofOfDelivery />} />
        <Route path="/deliveries/returns" element={<Returns />} />

        {/* Invoices */}
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/invoices/payments" element={<ProtectedRoute roles={['customer']}><PaymentHistory /></ProtectedRoute>} />

        {/* Issues & Feedback */}
        <Route path="/issues/raise" element={<ProtectedRoute roles={['customer']}><RaiseIssue /></ProtectedRoute>} />
        <Route path="/issues" element={<MyIssues />} />
        <Route path="/feedback" element={<ProtectedRoute roles={['customer']}><Feedback /></ProtectedRoute>} />

        {/* Reports */}
        <Route path="/reports/orders" element={<OrderSummary />} />
        <Route path="/reports/delivery" element={<DeliveryPerformance />} />
        <Route path="/reports/kpi" element={<KPIScorecard />} />

        {/* Settings */}
        <Route path="/settings/profile" element={<Profile />} />
        <Route path="/settings/notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
