"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executiveDashboardController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
/**
 * Executive Dashboard Controller
 * Provides aggregated statistics and analytics for the executive dashboard
 */
exports.executiveDashboardController = {
    /**
     * Get Dashboard Statistics
     * GET /api/v1/dashboard/statistics
     * Returns overall system statistics
     */
    async getStatistics(req, res) {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            const user = req.user;
            const depotFilter = user?.depot_id ? { depot_id: user.depot_id } : {};
            const zoneFilter = user?.zone_id ? { zones_id: user.zone_id } : {};
            const totalCustomers = await prisma_client_1.default.customers.count({
                where: { is_active: 'Y', ...zoneFilter },
            });
            const activeOutletsThisMonth = await prisma_client_1.default.customers.count({
                where: {
                    is_active: 'Y',
                    createdate: { gte: startOfMonth },
                    ...zoneFilter,
                },
            });
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const activeOutletsThisWeek = await prisma_client_1.default.customers.count({
                where: {
                    is_active: 'Y',
                    createdate: { gte: sevenDaysAgo },
                    ...zoneFilter,
                },
            });
            const totalOrders = await prisma_client_1.default.orders.count({
                where: { is_active: 'Y' },
            });
            const ordersThisMonth = await prisma_client_1.default.orders.count({
                where: { is_active: 'Y', order_date: { gte: startOfMonth } },
            });
            const ordersLastMonth = await prisma_client_1.default.orders.count({
                where: {
                    is_active: 'Y',
                    order_date: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            });
            const ordersGrowthPercentage = ordersLastMonth > 0
                ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
                : 0;
            const invoicesThisMonth = await prisma_client_1.default.invoices.findMany({
                where: {
                    is_active: 'Y',
                    invoice_date: { gte: startOfMonth },
                },
                select: {
                    total_amount: true,
                },
            });
            const salesRevenue = invoicesThisMonth.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
            const invoicesLastMonth = await prisma_client_1.default.invoices.findMany({
                where: {
                    is_active: 'Y',
                    invoice_date: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
                select: {
                    total_amount: true,
                },
            });
            const salesRevenueLastMonth = invoicesLastMonth.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
            const revenueGrowthPercentage = salesRevenueLastMonth > 0
                ? ((salesRevenue - salesRevenueLastMonth) / salesRevenueLastMonth) *
                    100
                : 0;
            const salesTarget = salesRevenueLastMonth * 1.1;
            const targetProgress = salesTarget > 0 ? (salesRevenue / salesTarget) * 100 : 0;
            const totalDeliveries = await prisma_client_1.default.visits.count({
                where: { is_active: 'Y', status: 'completed' },
            });
            const successfulDeliveriesThisMonth = await prisma_client_1.default.visits.count({
                where: {
                    is_active: 'Y',
                    status: 'completed',
                    visit_date: { gte: startOfMonth },
                },
            });
            const allVisitsThisMonth = await prisma_client_1.default.visits.count({
                where: {
                    is_active: 'Y',
                    visit_date: { gte: startOfMonth },
                },
            });
            const deliverySuccessRate = allVisitsThisMonth > 0
                ? (successfulDeliveriesThisMonth / allVisitsThisMonth) * 100
                : 0;
            res.json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: {
                    totalOrders: {
                        value: totalOrders,
                        thisMonth: ordersThisMonth,
                        growthPercentage: ordersGrowthPercentage.toFixed(1),
                    },
                    salesRevenue: {
                        value: salesRevenue,
                        formatted: `₹${(salesRevenue / 100000).toFixed(1)}L`,
                        growthPercentage: revenueGrowthPercentage.toFixed(1),
                        target: salesTarget,
                        targetProgress: targetProgress.toFixed(1),
                    },
                    deliveries: {
                        value: totalDeliveries,
                        thisMonth: successfulDeliveriesThisMonth,
                        successRate: deliverySuccessRate.toFixed(1),
                    },
                    activeOutlets: {
                        value: totalCustomers,
                        thisMonth: activeOutletsThisMonth,
                        thisWeek: activeOutletsThisWeek,
                    },
                },
            });
        }
        catch (error) {
            console.error('Get Dashboard Statistics Error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve dashboard statistics',
            });
        }
    },
    /**
     * Get Sales Performance Data
     * GET /api/v1/dashboard/sales-performance
     * Returns sales data for charts (last 7 days, last 30 days)
     */
    async getSalesPerformance(req, res) {
        try {
            const { period = '30' } = req.query;
            const days = parseInt(period);
            const now = new Date();
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const invoices = await prisma_client_1.default.invoices.findMany({
                where: {
                    is_active: 'Y',
                    invoice_date: { gte: startDate },
                },
                select: {
                    invoice_date: true,
                    total_amount: true,
                },
                orderBy: {
                    invoice_date: 'asc',
                },
            });
            const salesByDate = {};
            invoices.forEach(inv => {
                const date = inv.invoice_date
                    ? inv.invoice_date.toISOString().split('T')[0]
                    : 'unknown';
                salesByDate[date] =
                    (salesByDate[date] || 0) + Number(inv.total_amount || 0);
            });
            const labels = [];
            const data = [];
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
                labels.push(monthDay);
                data.push(salesByDate[dateStr] || 0);
            }
            res.json({
                success: true,
                message: 'Sales performance data retrieved successfully',
                data: {
                    labels,
                    sales: data,
                    period: days,
                },
            });
        }
        catch (error) {
            console.error('Get Sales Performance Error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve sales performance data',
            });
        }
    },
    /**
     * Get Top Products Data
     * GET /api/v1/dashboard/top-products
     * Returns top selling products
     */
    async getTopProducts(req, res) {
        try {
            const { period = '30', limit = 5 } = req.query;
            const days = parseInt(period);
            const topN = parseInt(limit);
            const now = new Date();
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const orderItems = await prisma_client_1.default.order_items.findMany({
                where: {
                    orders: {
                        is_active: 'Y',
                        order_date: { gte: startDate },
                    },
                },
                select: {
                    product_id: true,
                    quantity: true,
                    product_name: true,
                    products: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            const productSales = {};
            orderItems.forEach(item => {
                if (item.products) {
                    const productId = item.products.id;
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            name: item.products.name,
                            code: item.products.code,
                            qty: 0,
                        };
                    }
                    productSales[productId].qty += Number(item.quantity || 0);
                }
            });
            const topProducts = Object.values(productSales)
                .sort((a, b) => b.qty - a.qty)
                .slice(0, topN);
            res.json({
                success: true,
                message: 'Top products data retrieved successfully',
                data: {
                    products: topProducts.map(p => p.name),
                    quantities: topProducts.map(p => p.qty),
                },
            });
        }
        catch (error) {
            console.error('Get Top Products Error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve top products data',
            });
        }
    },
    /**
     * Get Order Status Distribution
     * GET /api/v1/dashboard/order-status
     * Returns order counts by status
     */
    async getOrderStatus(req, res) {
        try {
            const orders = await prisma_client_1.default.orders.findMany({
                where: { is_active: 'Y' },
                select: {
                    status: true,
                },
            });
            const statusCounts = {};
            orders.forEach(order => {
                const status = order.status || 'unknown';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            res.json({
                success: true,
                message: 'Order status data retrieved successfully',
                data: {
                    labels: Object.keys(statusCounts),
                    values: Object.values(statusCounts),
                },
            });
        }
        catch (error) {
            console.error('Get Order Status Error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve order status data',
            });
        }
    },
};
//# sourceMappingURL=executiveDashboard.controller.js.map