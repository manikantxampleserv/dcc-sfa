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
            const zoneFilter = user?.zone_id ? { zones_id: user.zone_id } : {};
            const [[totalCustomers, activeOutletsThisMonth, activeOutletsThisWeek, totalInvoices, invoicesThisMonthCount, invoicesLastMonthCount, revenueThisMonthAgg, revenueLastMonthAgg, totalDeliveries, successfulDeliveriesThisMonth, allVisitsThisMonth,], dailySalesRows, topProductsRows, salesmanRows,] = await Promise.all([
                Promise.all([
                    prisma_client_1.default.customers.count({
                        where: { is_active: 'Y', ...zoneFilter },
                    }),
                    prisma_client_1.default.customers.count({
                        where: {
                            is_active: 'Y',
                            createdate: { gte: startOfMonth },
                            ...zoneFilter,
                        },
                    }),
                    prisma_client_1.default.customers.count({
                        where: {
                            is_active: 'Y',
                            createdate: { gte: sevenDaysAgo },
                            ...zoneFilter,
                        },
                    }),
                    prisma_client_1.default.invoices.count({
                        where: { is_active: 'Y' },
                    }),
                    prisma_client_1.default.invoices.count({
                        where: { is_active: 'Y', invoice_date: { gte: startOfMonth } },
                    }),
                    prisma_client_1.default.invoices.count({
                        where: {
                            is_active: 'Y',
                            invoice_date: { gte: startOfLastMonth, lte: endOfLastMonth },
                        },
                    }),
                    prisma_client_1.default.invoices.aggregate({
                        where: {
                            is_active: 'Y',
                            invoice_date: { gte: startOfMonth },
                        },
                        _sum: {
                            total_amount: true,
                        },
                    }),
                    prisma_client_1.default.invoices.aggregate({
                        where: {
                            is_active: 'Y',
                            invoice_date: { gte: startOfLastMonth, lte: endOfLastMonth },
                        },
                        _sum: {
                            total_amount: true,
                        },
                    }),
                    prisma_client_1.default.visits.count({
                        where: { is_active: 'Y', status: 'completed' },
                    }),
                    prisma_client_1.default.visits.count({
                        where: {
                            is_active: 'Y',
                            status: 'completed',
                            visit_date: { gte: startOfMonth },
                        },
                    }),
                    prisma_client_1.default.visits.count({
                        where: {
                            is_active: 'Y',
                            visit_date: { gte: startOfMonth },
                        },
                    }),
                ]),
                prisma_client_1.default.$queryRaw `
          SELECT 
            CONVERT(VARCHAR(10), invoice_date, 120) AS sale_date,
            SUM(CAST(total_amount AS FLOAT)) AS total_sales
          FROM invoices
          WHERE is_active = 'Y'
            AND invoice_date >= ${startDate}
          GROUP BY CONVERT(VARCHAR(10), invoice_date, 120)
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
            const invoicesGrowthPercentage = invoicesLastMonthCount > 0
                ? ((invoicesThisMonthCount - invoicesLastMonthCount) /
                    invoicesLastMonthCount) *
                    100
                : 0;
            const salesRevenue = Number(revenueThisMonthAgg._sum.total_amount || 0);
            const salesRevenueLastMonth = Number(revenueLastMonthAgg._sum.total_amount || 0);
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
                    salesByDate[row.sale_date] = Number(row.total_sales || 0);
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
            const zoneFilter = user?.zone_id ? { zones_id: user.zone_id } : {};
            const [totalCustomers, activeOutletsThisMonth, activeOutletsThisWeek, totalInvoices, invoicesThisMonthCount, invoicesLastMonthCount, revenueThisMonthAgg, revenueLastMonthAgg, totalDeliveries, successfulDeliveriesThisMonth, allVisitsThisMonth,] = await Promise.all([
                prisma_client_1.default.customers.count({
                    where: { is_active: 'Y', ...zoneFilter },
                }),
                prisma_client_1.default.customers.count({
                    where: {
                        is_active: 'Y',
                        createdate: { gte: startOfMonth },
                        ...zoneFilter,
                    },
                }),
                prisma_client_1.default.customers.count({
                    where: {
                        is_active: 'Y',
                        createdate: { gte: sevenDaysAgo },
                        ...zoneFilter,
                    },
                }),
                prisma_client_1.default.invoices.count({
                    where: { is_active: 'Y' },
                }),
                prisma_client_1.default.invoices.count({
                    where: { is_active: 'Y', invoice_date: { gte: startOfMonth } },
                }),
                prisma_client_1.default.invoices.count({
                    where: {
                        is_active: 'Y',
                        invoice_date: { gte: startOfLastMonth, lte: endOfLastMonth },
                    },
                }),
                prisma_client_1.default.invoices.aggregate({
                    where: {
                        is_active: 'Y',
                        invoice_date: { gte: startOfMonth },
                    },
                    _sum: {
                        total_amount: true,
                    },
                }),
                prisma_client_1.default.invoices.aggregate({
                    where: {
                        is_active: 'Y',
                        invoice_date: { gte: startOfLastMonth, lte: endOfLastMonth },
                    },
                    _sum: {
                        total_amount: true,
                    },
                }),
                prisma_client_1.default.visits.count({
                    where: { is_active: 'Y', status: 'completed' },
                }),
                prisma_client_1.default.visits.count({
                    where: {
                        is_active: 'Y',
                        status: 'completed',
                        visit_date: { gte: startOfMonth },
                    },
                }),
                prisma_client_1.default.visits.count({
                    where: {
                        is_active: 'Y',
                        visit_date: { gte: startOfMonth },
                    },
                }),
            ]);
            const invoicesGrowthPercentage = invoicesLastMonthCount > 0
                ? ((invoicesThisMonthCount - invoicesLastMonthCount) /
                    invoicesLastMonthCount) *
                    100
                : 0;
            const salesRevenue = Number(revenueThisMonthAgg._sum.total_amount || 0);
            const salesRevenueLastMonth = Number(revenueLastMonthAgg._sum.total_amount || 0);
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
          CONVERT(VARCHAR(10), invoice_date, 120) AS sale_date,
          SUM(CAST(total_amount AS FLOAT)) AS total_sales
        FROM invoices
        WHERE is_active = 'Y'
          AND invoice_date >= ${startDate}
        GROUP BY CONVERT(VARCHAR(10), invoice_date, 120)
        ORDER BY sale_date ASC
      `;
            const salesByDate = {};
            dailySalesRows.forEach(row => {
                if (row.sale_date) {
                    salesByDate[row.sale_date] = Number(row.total_sales || 0);
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