"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executiveDashboardController = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
/**
 * Executive Dashboard Controller
 * Provides aggregated statistics and analytics for the executive dashboard
 */
exports.executiveDashboardController = {
    /**
     * Retrieves aggregated overview statistics, sales performance, top products, and order status in a single query pass
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>} JSON response containing aggregated dashboard data
     */
    async getExecutiveDashboardOverview(req, res) {
        try {
            const { period = '30', top_products_limit = '5' } = req.query;
            const days = parseInt(period, 10) || 30;
            const topN = parseInt(top_products_limit, 10) || 5;
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const user = req.user;
            const zoneId = user?.zone_id ? Number(user.zone_id) : null;
            const [customerStatsRows, invoiceStatsRows, visitStatsRows, dailySalesRows, topProductsRows, salesmanRows,] = await Promise.all([
                prisma_client_1.default.$queryRaw `
          SELECT 
            COUNT(1) AS total_customers,
            COUNT(CASE WHEN createdate >= ${startOfMonth} THEN 1 END) AS this_month_customers,
            COUNT(CASE WHEN createdate >= ${sevenDaysAgo} THEN 1 END) AS this_week_customers
          FROM customers
          WHERE is_active = 'Y'
            ${zoneId ? client_1.Prisma.sql `AND zones_id = ${zoneId}` : client_1.Prisma.empty}
        `,
                prisma_client_1.default.$queryRaw `
          SELECT 
            COUNT(1) AS total_invoices,
            COUNT(CASE WHEN invoice_date >= ${startOfMonth} THEN 1 END) AS this_month_count,
            COUNT(CASE WHEN invoice_date >= ${startOfLastMonth} AND invoice_date <= ${endOfLastMonth} THEN 1 END) AS last_month_count,
            SUM(CASE WHEN invoice_date >= ${startOfMonth} THEN CAST(total_amount AS FLOAT) ELSE 0 END) AS this_month_revenue,
            SUM(CASE WHEN invoice_date >= ${startOfLastMonth} AND invoice_date <= ${endOfLastMonth} THEN CAST(total_amount AS FLOAT) ELSE 0 END) AS last_month_revenue
          FROM invoices
          WHERE is_active = 'Y'
        `,
                prisma_client_1.default.$queryRaw `
          SELECT 
            COUNT(CASE WHEN status = 'completed' THEN 1 END) AS total_deliveries,
            COUNT(CASE WHEN status = 'completed' AND visit_date >= ${startOfMonth} THEN 1 END) AS this_month_completed,
            COUNT(CASE WHEN visit_date >= ${startOfMonth} THEN 1 END) AS this_month_all
          FROM visits
          WHERE is_active = 'Y'
        `,
                prisma_client_1.default.$queryRaw `
          SELECT 
            CAST(invoice_date AS DATE) AS sale_date,
            SUM(CAST(total_amount AS FLOAT)) AS total_sales
          FROM invoices
          WHERE is_active = 'Y'
            AND invoice_date >= ${startDate}
          GROUP BY CAST(invoice_date AS DATE)
          ORDER BY sale_date ASC
        `,
                prisma_client_1.default.$queryRaw `
          SELECT TOP (${topN})
            p.name,
            SUM(CAST(ii.quantity AS BIGINT)) AS qty
          FROM invoice_items ii
          INNER JOIN invoices i ON ii.parent_id = i.id
          INNER JOIN products p ON ii.product_id = p.id
          WHERE i.is_active = 'Y'
            AND i.invoice_date >= ${startDate}
          GROUP BY p.id, p.name
          ORDER BY qty DESC
        `,
                prisma_client_1.default.$queryRaw `
          SELECT TOP 5
            u.name,
            COUNT(i.id) AS invoice_count
          FROM invoices i
          INNER JOIN users u ON i.salesperson_id = u.id
          WHERE i.is_active = 'Y'
            AND u.name IS NOT NULL
          GROUP BY u.id, u.name
          ORDER BY invoice_count DESC
        `,
            ]);
            const customerStats = customerStatsRows[0] || {};
            const invoiceStats = invoiceStatsRows[0] || {};
            const visitStats = visitStatsRows[0] || {};
            const totalCustomers = Number(customerStats.total_customers || 0);
            const activeOutletsThisMonth = Number(customerStats.this_month_customers || 0);
            const activeOutletsThisWeek = Number(customerStats.this_week_customers || 0);
            const totalInvoices = Number(invoiceStats.total_invoices || 0);
            const invoicesThisMonthCount = Number(invoiceStats.this_month_count || 0);
            const invoicesLastMonthCount = Number(invoiceStats.last_month_count || 0);
            const salesRevenue = Number(invoiceStats.this_month_revenue || 0);
            const salesRevenueLastMonth = Number(invoiceStats.last_month_revenue || 0);
            const totalDeliveries = Number(visitStats.total_deliveries || 0);
            const successfulDeliveriesThisMonth = Number(visitStats.this_month_completed || 0);
            const allVisitsThisMonth = Number(visitStats.this_month_all || 0);
            const invoicesGrowthPercentage = invoicesLastMonthCount > 0
                ? ((invoicesThisMonthCount - invoicesLastMonthCount) /
                    invoicesLastMonthCount) *
                    100
                : 0;
            const revenueGrowthPercentage = salesRevenueLastMonth > 0
                ? ((salesRevenue - salesRevenueLastMonth) / salesRevenueLastMonth) *
                    100
                : 0;
            const salesTarget = salesRevenueLastMonth * 1.1;
            const targetProgress = salesTarget > 0 ? (salesRevenue / salesTarget) * 100 : 0;
            const deliverySuccessRate = allVisitsThisMonth > 0
                ? (successfulDeliveriesThisMonth / allVisitsThisMonth) * 100
                : 0;
            const salesByDate = {};
            dailySalesRows.forEach(row => {
                if (row.sale_date) {
                    const key = row.sale_date instanceof Date
                        ? row.sale_date.toISOString().split('T')[0]
                        : String(row.sale_date).split('T')[0];
                    salesByDate[key] = Number(row.total_sales || 0);
                }
            });
            const salesLabels = [];
            const salesValues = [];
            for (let i = 0; i < days; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];
                const monthDay = `${d.getMonth() + 1}/${d.getDate()}`;
                salesLabels.push(monthDay);
                salesValues.push(salesByDate[dateStr] || 0);
            }
            const topProductsData = {
                products: topProductsRows.map(p => p.name || 'Unknown'),
                quantities: topProductsRows.map(p => Number(p.qty || 0)),
            };
            const orderStatusData = {
                labels: salesmanRows.map(r => r.name),
                values: salesmanRows.map(r => Number(r.invoice_count || 0)),
            };
            res.json({
                success: true,
                message: 'Executive dashboard overview retrieved successfully',
                data: {
                    statistics: {
                        totalInvoices: {
                            value: totalInvoices,
                            thisMonth: invoicesThisMonthCount,
                            growthPercentage: invoicesGrowthPercentage.toFixed(1),
                        },
                        salesRevenue: {
                            value: salesRevenue,
                            formatted: salesRevenue > 0
                                ? `₹${(salesRevenue / 100000).toFixed(1)}L`
                                : '₹0.0L',
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
                    salesPerformance: {
                        labels: salesLabels,
                        sales: salesValues,
                        period: days,
                    },
                    topProducts: topProductsData,
                    orderStatus: orderStatusData,
                },
            });
        }
        catch (error) {
            console.error('Get Executive Dashboard Overview Error:', error);
            res.status(500).json({
                success: false,
                message: error.message ||
                    'Failed to retrieve executive dashboard overview data',
            });
        }
    },
    /**
     * Get Dashboard Statistics
     * GET /api/v1/dashboard/statistics
     * Returns overall system statistics
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>}
     */
    async getStatistics(req, res) {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const user = req.user;
            const zoneId = user?.zone_id ? Number(user.zone_id) : null;
            const [customerStatsRows, invoiceStatsRows, visitStatsRows] = await Promise.all([
                prisma_client_1.default.$queryRaw `
          SELECT 
            COUNT(1) AS total_customers,
            COUNT(CASE WHEN createdate >= ${startOfMonth} THEN 1 END) AS this_month_customers,
            COUNT(CASE WHEN createdate >= ${sevenDaysAgo} THEN 1 END) AS this_week_customers
          FROM customers
          WHERE is_active = 'Y'
            ${zoneId ? client_1.Prisma.sql `AND zones_id = ${zoneId}` : client_1.Prisma.empty}
        `,
                prisma_client_1.default.$queryRaw `
          SELECT 
            COUNT(1) AS total_invoices,
            COUNT(CASE WHEN invoice_date >= ${startOfMonth} THEN 1 END) AS this_month_count,
            COUNT(CASE WHEN invoice_date >= ${startOfLastMonth} AND invoice_date <= ${endOfLastMonth} THEN 1 END) AS last_month_count,
            SUM(CASE WHEN invoice_date >= ${startOfMonth} THEN CAST(total_amount AS FLOAT) ELSE 0 END) AS this_month_revenue,
            SUM(CASE WHEN invoice_date >= ${startOfLastMonth} AND invoice_date <= ${endOfLastMonth} THEN CAST(total_amount AS FLOAT) ELSE 0 END) AS last_month_revenue
          FROM invoices
          WHERE is_active = 'Y'
        `,
                prisma_client_1.default.$queryRaw `
          SELECT 
            COUNT(CASE WHEN status = 'completed' THEN 1 END) AS total_deliveries,
            COUNT(CASE WHEN status = 'completed' AND visit_date >= ${startOfMonth} THEN 1 END) AS this_month_completed,
            COUNT(CASE WHEN visit_date >= ${startOfMonth} THEN 1 END) AS this_month_all
          FROM visits
          WHERE is_active = 'Y'
        `,
            ]);
            const customerStats = customerStatsRows[0] || {};
            const invoiceStats = invoiceStatsRows[0] || {};
            const visitStats = visitStatsRows[0] || {};
            const totalCustomers = Number(customerStats.total_customers || 0);
            const activeOutletsThisMonth = Number(customerStats.this_month_customers || 0);
            const activeOutletsThisWeek = Number(customerStats.this_week_customers || 0);
            const totalInvoices = Number(invoiceStats.total_invoices || 0);
            const invoicesThisMonthCount = Number(invoiceStats.this_month_count || 0);
            const invoicesLastMonthCount = Number(invoiceStats.last_month_count || 0);
            const salesRevenue = Number(invoiceStats.this_month_revenue || 0);
            const salesRevenueLastMonth = Number(invoiceStats.last_month_revenue || 0);
            const totalDeliveries = Number(visitStats.total_deliveries || 0);
            const successfulDeliveriesThisMonth = Number(visitStats.this_month_completed || 0);
            const allVisitsThisMonth = Number(visitStats.this_month_all || 0);
            const invoicesGrowthPercentage = invoicesLastMonthCount > 0
                ? ((invoicesThisMonthCount - invoicesLastMonthCount) /
                    invoicesLastMonthCount) *
                    100
                : 0;
            const revenueGrowthPercentage = salesRevenueLastMonth > 0
                ? ((salesRevenue - salesRevenueLastMonth) / salesRevenueLastMonth) *
                    100
                : 0;
            const salesTarget = salesRevenueLastMonth * 1.1;
            const targetProgress = salesTarget > 0 ? (salesRevenue / salesTarget) * 100 : 0;
            const deliverySuccessRate = allVisitsThisMonth > 0
                ? (successfulDeliveriesThisMonth / allVisitsThisMonth) * 100
                : 0;
            res.json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: {
                    totalInvoices: {
                        value: totalInvoices,
                        thisMonth: invoicesThisMonthCount,
                        growthPercentage: invoicesGrowthPercentage.toFixed(1),
                    },
                    salesRevenue: {
                        value: salesRevenue,
                        formatted: salesRevenue > 0
                            ? `₹${(salesRevenue / 100000).toFixed(1)}L`
                            : '₹0.0L',
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
     * Returns sales data for charts
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>}
     */
    async getSalesPerformance(req, res) {
        try {
            const { period = '30' } = req.query;
            const days = parseInt(period, 10) || 30;
            const now = new Date();
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const dailySalesRows = await prisma_client_1.default.$queryRaw `
        SELECT 
          CAST(invoice_date AS DATE) AS sale_date,
          SUM(CAST(total_amount AS FLOAT)) AS total_sales
        FROM invoices
        WHERE is_active = 'Y'
          AND invoice_date >= ${startDate}
        GROUP BY CAST(invoice_date AS DATE)
        ORDER BY sale_date ASC
      `;
            const salesByDate = {};
            dailySalesRows.forEach(row => {
                if (row.sale_date) {
                    const key = row.sale_date instanceof Date
                        ? row.sale_date.toISOString().split('T')[0]
                        : String(row.sale_date).split('T')[0];
                    salesByDate[key] = Number(row.total_sales || 0);
                }
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
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>}
     */
    async getTopProducts(req, res) {
        try {
            const { period = '30', limit = 5 } = req.query;
            const days = parseInt(period, 10) || 30;
            const topN = parseInt(limit, 10) || 5;
            const now = new Date();
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const topProductsRows = await prisma_client_1.default.$queryRaw `
        SELECT TOP (${topN})
          p.name,
          SUM(CAST(ii.quantity AS BIGINT)) AS qty
        FROM invoice_items ii
        INNER JOIN invoices i ON ii.parent_id = i.id
        INNER JOIN products p ON ii.product_id = p.id
        WHERE i.is_active = 'Y'
          AND i.invoice_date >= ${startDate}
        GROUP BY p.id, p.name
        ORDER BY qty DESC
      `;
            res.json({
                success: true,
                message: 'Top products data retrieved successfully',
                data: {
                    products: topProductsRows.map(p => p.name || 'Unknown'),
                    quantities: topProductsRows.map(p => Number(p.qty || 0)),
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
     * Returns invoice counts by salesman
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>}
     */
    async getOrderStatus(req, res) {
        try {
            const salesmanRows = await prisma_client_1.default.$queryRaw `
        SELECT TOP 5
          u.name,
          COUNT(i.id) AS invoice_count
        FROM invoices i
        INNER JOIN users u ON i.salesperson_id = u.id
        WHERE i.is_active = 'Y'
          AND u.name IS NOT NULL
        GROUP BY u.id, u.name
        ORDER BY invoice_count DESC
      `;
            res.json({
                success: true,
                message: 'Invoices by salesman data retrieved successfully',
                data: {
                    labels: salesmanRows.map(r => r.name),
                    values: salesmanRows.map(r => Number(r.invoice_count || 0)),
                },
            });
        }
        catch (error) {
            console.error('Get Invoices by Salesman Error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve invoices by salesman data',
            });
        }
    },
};
//# sourceMappingURL=executiveDashboard.controller.js.map