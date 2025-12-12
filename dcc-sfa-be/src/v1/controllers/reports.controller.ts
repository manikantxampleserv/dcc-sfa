import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

async function getReportData(filters: any) {
  const { start_date, end_date, customer_id, status } = filters;

  const dateFilter: any = {};
  if (start_date) {
    dateFilter.gte = new Date(start_date as string);
  }
  if (end_date) {
    dateFilter.lte = new Date(end_date as string);
  }

  const whereOrders: any = {
    is_active: 'Y',
    ...(Object.keys(dateFilter).length > 0 && { order_date: dateFilter }),
    ...(customer_id && { customer_id: parseInt(customer_id as string) }),
    ...(status && { status: status as string }),
  };

  const orders = await prisma.orders.findMany({
    where: whereOrders,
    include: {
      orders_customers: {
        select: { id: true, name: true, code: true },
      },
      orders_salesperson_users: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { order_date: 'desc' },
  });

  const whereInvoices: any = {
    is_active: 'Y',
    ...(Object.keys(dateFilter).length > 0 && { invoice_date: dateFilter }),
    ...(customer_id && { customer_id: parseInt(customer_id as string) }),
    ...(status && { status: status as string }),
  };

  const invoices = await prisma.invoices.findMany({
    where: whereInvoices,
    include: {
      invoices_customers: {
        select: { id: true, name: true, code: true },
      },
    },
    orderBy: { invoice_date: 'desc' },
  });

  const whereReturns: any = {
    is_active: 'Y',
    ...(Object.keys(dateFilter).length > 0 && { return_date: dateFilter }),
    ...(customer_id && { customer_id: parseInt(customer_id as string) }),
    ...(status && { status: status as string }),
  };

  const returnRequests = await prisma.return_requests.findMany({
    where: whereReturns,
    include: {
      return_requests_customers: {
        select: { id: true, name: true, code: true },
      },
      return_requests_products: {
        select: { id: true, name: true, code: true },
      },
    },
    orderBy: { return_date: 'desc' },
  });

  return { orders, invoices, returnRequests };
}

/**
 * Reports Controller
 * Handles various reporting endpoints
 */
export const reportsController = {
  /**
   * Get Orders, Invoices, and Returns Report
   * GET /api/v1/reports/orders-invoices-returns
   */
  async getOrdersInvoicesReturnsReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, customer_id, status } = req.query;

      const { orders, invoices, returnRequests } = await getReportData({
        start_date,
        end_date,
        customer_id,
        status,
      });

      const totalOrders = orders.length;
      const totalInvoices = invoices.length;
      const totalReturns = returnRequests.length;

      const totalOrderValue = orders.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      );

      const totalInvoiceValue = invoices.reduce(
        (sum, invoice) => sum + Number(invoice.total_amount || 0),
        0
      );

      const paidInvoices = invoices.filter(
        inv =>
          inv.status?.toUpperCase() === 'PAID' ||
          inv.status?.toUpperCase() === 'PAID_IN_FULL' ||
          inv.status?.toLowerCase() === 'paid' ||
          inv.status?.toLowerCase() === 'paid_in_full'
      );

      const pendingInvoices = invoices.filter(
        inv =>
          inv.status?.toUpperCase() === 'PENDING' ||
          inv.status?.toUpperCase() === 'UNPAID' ||
          inv.status?.toLowerCase() === 'pending' ||
          inv.status?.toLowerCase() === 'unpaid'
      );

      const completedOrders = orders.filter(
        order =>
          order.status?.toUpperCase() === 'DELIVERED' ||
          order.status?.toUpperCase() === 'COMPLETED' ||
          order.status?.toLowerCase() === 'delivered' ||
          order.status?.toLowerCase() === 'completed'
      );
      const pendingOrders = orders.filter(
        order =>
          order.status?.toUpperCase() === 'PENDING' ||
          order.status?.toUpperCase() === 'PROCESSING' ||
          order.status?.toLowerCase() === 'pending' ||
          order.status?.toLowerCase() === 'processing'
      );

      const completedReturns = returnRequests.filter(
        ret =>
          ret.status?.toUpperCase() === 'COMPLETED' ||
          ret.status?.toUpperCase() === 'PROCESSED' ||
          ret.status?.toLowerCase() === 'completed' ||
          ret.status?.toLowerCase() === 'processed'
      );

      const pendingReturns = returnRequests.filter(
        ret =>
          ret.status?.toUpperCase() === 'PENDING' ||
          ret.status?.toUpperCase() === 'APPROVAL' ||
          ret.status?.toLowerCase() === 'pending' ||
          ret.status?.toLowerCase() === 'approval'
      );

      const averageOrderValue =
        orders.length > 0 ? totalOrderValue / orders.length : 0;
      const averageInvoiceValue =
        invoices.length > 0 ? totalInvoiceValue / invoices.length : 0;
      const conversionRate =
        orders.length > 0 ? (invoices.length / orders.length) * 100 : 0;
      const returnRate =
        orders.length > 0 ? (returnRequests.length / orders.length) * 100 : 0;

      const serializedOrders = orders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        order_type: order.order_type || 'Regular Order',
        customer_name: order.orders_customers?.name || 'N/A',
        customer_code: order.orders_customers?.code || 'N/A',
        salesperson_name: order.orders_salesperson_users?.name || 'N/A',
        salesperson_email: order.orders_salesperson_users?.email || 'N/A',
        salesperson_id: order.orders_salesperson_users?.id || null,
        order_date: order.order_date?.toISOString() || '',
        status: order.status || 'N/A',
        total_amount: Number(order.total_amount || 0),
        priority: order.priority || 'NORMAL',
      }));

      const serializedInvoices = invoices.map(invoice => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer_name: invoice.invoices_customers?.name || 'N/A',
        customer_code: invoice.invoices_customers?.code || 'N/A',
        invoice_date: invoice.invoice_date?.toISOString() || '',
        due_date: invoice.due_date?.toISOString() || '',
        status: invoice.status || 'N/A',
        total_amount: Number(invoice.total_amount || 0),
        balance_due: Number(invoice.balance_due || 0),
        amount_paid: Number(invoice.amount_paid || 0),
      }));

      const serializedReturns = returnRequests.map(ret => ({
        id: ret.id,
        customer_name: ret.return_requests_customers?.name || 'N/A',
        customer_code: ret.return_requests_customers?.code || 'N/A',
        product_name: ret.return_requests_products?.name || 'N/A',
        return_date: ret.return_date?.toISOString() || '',
        reason: ret.reason || 'N/A',
        status: ret.status || 'N/A',
      }));

      const response = {
        summary: {
          total_orders: totalOrders,
          total_invoices: totalInvoices,
          total_returns: totalReturns,
          total_order_value: totalOrderValue,
          total_invoice_value: totalInvoiceValue,
        },
        status_breakdown: {
          pending_orders: pendingOrders.length,
          completed_orders: completedOrders.length,
          pending_invoices: pendingInvoices.length,
          paid_invoices: paidInvoices.length,
          pending_returns: pendingReturns.length,
          completed_returns: completedReturns.length,
        },
        statistics: {
          average_order_value: averageOrderValue,
          average_invoice_value: averageInvoiceValue,
          conversion_rate: conversionRate,
          return_rate: returnRate,
        },
        data: {
          orders: serializedOrders,
          invoices: serializedInvoices,
          returns: serializedReturns,
        },
      };

      res.json({
        success: true,
        message: 'Report generated successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Orders Invoices Returns Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report',
      });
    }
  },

  /**
   * Export Orders, Invoices, and Returns Report to Excel
   * GET /api/v1/reports/orders-invoices-returns/export
   */
  async exportOrdersInvoicesReturnsReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, customer_id, status } = req.query;

      const { orders, invoices, returnRequests } = await getReportData({
        start_date,
        end_date,
        customer_id,
        status,
      });

      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      const ordersSheet = workbook.addWorksheet('Orders', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      ordersSheet.columns = [
        { header: 'Order Number', key: 'order_number', width: 20 },
        { header: 'Customer Name', key: 'customer_name', width: 30 },
        { header: 'Customer Code', key: 'customer_code', width: 15 },
        { header: 'Salesperson', key: 'salesperson', width: 25 },
        { header: 'Order Date', key: 'order_date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Priority', key: 'priority', width: 12 },
        { header: 'Total Amount', key: 'total_amount', width: 15 },
      ];
      orders.forEach((order: any) => {
        ordersSheet.addRow({
          order_number: order.order_number,
          customer_name: order.orders_customers?.name || 'N/A',
          customer_code: order.orders_customers?.code || 'N/A',
          salesperson: order.orders_salesperson_users?.name || 'N/A',
          order_date: order.order_date
            ? new Date(order.order_date).toLocaleDateString()
            : 'N/A',
          status: order.status || 'N/A',
          priority: order.priority || 'NORMAL',
          total_amount: Number(order.total_amount || 0),
        });
      });

      const invoicesSheet = workbook.addWorksheet('Invoices', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      invoicesSheet.columns = [
        { header: 'Invoice Number', key: 'invoice_number', width: 20 },
        { header: 'Customer Name', key: 'customer_name', width: 30 },
        { header: 'Customer Code', key: 'customer_code', width: 15 },
        { header: 'Invoice Date', key: 'invoice_date', width: 15 },
        { header: 'Due Date', key: 'due_date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Total Amount', key: 'total_amount', width: 15 },
        { header: 'Amount Paid', key: 'amount_paid', width: 15 },
        { header: 'Balance Due', key: 'balance_due', width: 15 },
      ];
      invoices.forEach((invoice: any) => {
        invoicesSheet.addRow({
          invoice_number: invoice.invoice_number,
          customer_name: invoice.invoices_customers?.name || 'N/A',
          customer_code: invoice.invoices_customers?.code || 'N/A',
          invoice_date: invoice.invoice_date
            ? new Date(invoice.invoice_date).toLocaleDateString()
            : 'N/A',
          due_date: invoice.due_date
            ? new Date(invoice.due_date).toLocaleDateString()
            : 'N/A',
          status: invoice.status || 'N/A',
          total_amount: Number(invoice.total_amount || 0),
          amount_paid: Number(invoice.amount_paid || 0),
          balance_due: Number(invoice.balance_due || 0),
        });
      });

      const returnsSheet = workbook.addWorksheet('Returns', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      returnsSheet.columns = [
        { header: 'Customer Name', key: 'customer_name', width: 30 },
        { header: 'Customer Code', key: 'customer_code', width: 15 },
        { header: 'Product Name', key: 'product_name', width: 30 },
        { header: 'Return Date', key: 'return_date', width: 15 },
        { header: 'Reason', key: 'reason', width: 40 },
        { header: 'Status', key: 'status', width: 15 },
      ];
      returnRequests.forEach((ret: any) => {
        returnsSheet.addRow({
          customer_name: ret.return_requests_customers?.name || 'N/A',
          customer_code: ret.return_requests_customers?.code || 'N/A',
          product_name: ret.return_requests_products?.name || 'N/A',
          return_date: ret.return_date
            ? new Date(ret.return_date).toLocaleDateString()
            : 'N/A',
          reason: ret.reason || 'N/A',
          status: ret.status || 'N/A',
        });
      });

      const totalOrderValue = orders.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      );
      const totalInvoiceValue = invoices.reduce(
        (sum, invoice) => sum + Number(invoice.total_amount || 0),
        0
      );

      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const summaryData = [
        { metric: 'Total Orders', value: orders.length },
        { metric: 'Total Invoices', value: invoices.length },
        { metric: 'Total Returns', value: returnRequests.length },
        { metric: 'Total Order Value', value: totalOrderValue },
        { metric: 'Total Invoice Value', value: totalInvoiceValue },
        {
          metric: 'Average Order Value',
          value: orders.length > 0 ? totalOrderValue / orders.length : 0,
        },
        {
          metric: 'Average Invoice Value',
          value: invoices.length > 0 ? totalInvoiceValue / invoices.length : 0,
        },
        {
          metric: 'Conversion Rate (%)',
          value:
            orders.length > 0
              ? ((invoices.length / orders.length) * 100).toFixed(2)
              : 0,
        },
        {
          metric: 'Return Rate (%)',
          value:
            orders.length > 0
              ? ((returnRequests.length / orders.length) * 100).toFixed(2)
              : 0,
        },
      ];

      summaryData.forEach(row => {
        summarySheet.addRow(row);
      });

      [ordersSheet, invoicesSheet, returnsSheet, summarySheet].forEach(
        sheet => {
          const headerRow = sheet.getRow(1);
          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
          };
          headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
          headerRow.height = 25;
        }
      );

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Orders_Invoices_Returns_Report_${Date.now()}.xlsx`
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Export Orders Invoices Returns Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export report',
      });
    }
  },

  /**
   * Get Sales vs Target Report
   * GET /api/v1/reports/sales-vs-target
   */
  async getSalesVsTargetReport(req: Request, res: Response) {
    try {
      const {
        start_date,
        end_date,
        salesperson_id,
        product_category_id,
        sales_target_group_id,
      } = req.query;

      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      const whereTargets: any = {
        is_active: 'Y',
        ...(product_category_id && {
          product_category_id: parseInt(product_category_id as string),
        }),
        ...(sales_target_group_id && {
          sales_target_group_id: parseInt(sales_target_group_id as string),
        }),
        ...(Object.keys(dateFilter).length > 0 && {
          OR: [
            {
              AND: [
                { start_date: { lte: dateFilter.lte || new Date() } },
                { end_date: { gte: dateFilter.gte || new Date() } },
              ],
            },
          ],
        }),
      };

      const salesTargets = await prisma.sales_targets.findMany({
        where: whereTargets,
        include: {
          sales_targets_product_categories: {
            select: { id: true, category_name: true },
          },
          sales_targets_groups: {
            include: {
              sales_target_group_members_id: {
                where: { is_active: 'Y' },
              },
            },
          },
        },
      });

      const salespersonIds = new Set<number>();
      salesTargets.forEach(target => {
        target.sales_targets_groups?.sales_target_group_members_id?.forEach(
          (member: any) => {
            salespersonIds.add(member.sales_person_id);
          }
        );
      });

      if (salesperson_id) {
        const requestedSalespersonId = parseInt(salesperson_id as string);
        if (!salespersonIds.has(requestedSalespersonId)) {
          return res.json({
            success: true,
            message: 'Report generated successfully',
            data: {
              summary: {
                total_salespeople: 0,
                total_categories: 0,
                total_target_amount: 0,
                total_actual_sales: 0,
                achievement_percentage: 0,
              },
              performance: [],
              category_performance: [],
            },
          });
        }
        salespersonIds.clear();
        salespersonIds.add(requestedSalespersonId);
      }

      const salespersons = await prisma.users.findMany({
        where: {
          id: { in: Array.from(salespersonIds) },
          is_active: 'Y',
        },
        select: { id: true, name: true, email: true },
      });

      const salespersonMap = new Map<number, string>();
      salespersons.forEach(sp => {
        salespersonMap.set(sp.id, sp.name || 'N/A');
      });

      const actualSales = await prisma.order_items.findMany({
        where: {
          orders: {
            is_active: 'Y',
            salesperson_id: { in: Array.from(salespersonIds) },
            ...(Object.keys(dateFilter).length > 0 && {
              order_date: dateFilter,
            }),
          },
        },
        include: {
          orders: {
            select: {
              salesperson_id: true,
              order_date: true,
            },
          },
          products: {
            select: {
              category_id: true,
              product_categories_products: {
                select: { id: true, category_name: true },
              },
            },
          },
        },
      });

      const salesMap = new Map<string, { quantity: number; amount: number }>();
      const actualSalespersonIds = new Set<number>();

      actualSales.forEach(item => {
        const salespersonId = item.orders.salesperson_id;
        const categoryId = item.products.category_id;
        const key = `${salespersonId}_${categoryId}`;

        if (salespersonId) {
          actualSalespersonIds.add(salespersonId);
        }

        const current = salesMap.get(key) || { quantity: 0, amount: 0 };
        salesMap.set(key, {
          quantity: current.quantity + item.quantity,
          amount: current.amount + Number(item.total_amount || 0),
        });
      });

      const salespersonIdsToFetch = Array.from(actualSalespersonIds).filter(
        id => !salespersonMap.has(id) || salespersonMap.get(id) === 'N/A'
      );

      if (salespersonIdsToFetch.length > 0) {
        const missingSalespersons = await prisma.users.findMany({
          where: {
            id: { in: salespersonIdsToFetch },
          },
          select: { id: true, name: true, email: true },
        });

        missingSalespersons.forEach(sp => {
          salespersonMap.set(sp.id, sp.name || 'N/A');
        });
      }

      const performanceData: any[] = [];

      for (const [key, sales] of salesMap.entries()) {
        const [salespersonId, categoryId] = key.split('_').map(Number);

        const target = salesTargets.find(
          t => t.product_category_id === categoryId
        );

        if (target) {
          const targetAmount = Number(target.target_amount || 0);
          const achievement =
            targetAmount > 0 ? (sales.amount / targetAmount) * 100 : 0;

          performanceData.push({
            salesperson_id: salespersonId,
            salesperson_name: salespersonMap.get(salespersonId) || 'N/A',
            category_id: categoryId,
            category_name:
              target.sales_targets_product_categories?.category_name || 'N/A',
            target_quantity: target.target_quantity,
            target_amount: targetAmount,
            actual_quantity: sales.quantity,
            actual_sales: sales.amount,
            achievement_percentage: Math.round(achievement * 100) / 100,
            gap: sales.amount - targetAmount,
          });
        }
      }

      const totalTargetAmount = salesTargets.reduce(
        (sum, target) => sum + Number(target.target_amount || 0),
        0
      );
      const totalActualSales = Array.from(salesMap.values()).reduce(
        (sum, sales) => sum + sales.amount,
        0
      );
      const overallAchievement =
        totalTargetAmount > 0
          ? (totalActualSales / totalTargetAmount) * 100
          : 0;

      const categoryPerformance = new Map<
        number,
        { target: number; actual: number }
      >();

      salesTargets.forEach(target => {
        const categoryId = target.product_category_id;
        const current = categoryPerformance.get(categoryId) || {
          target: 0,
          actual: 0,
        };
        categoryPerformance.set(categoryId, {
          target: current.target + Number(target.target_amount || 0),
          actual: current.actual,
        });
      });

      actualSales.forEach(item => {
        const categoryId = item.products.category_id;
        const current = categoryPerformance.get(categoryId) || {
          target: 0,
          actual: 0,
        };
        categoryPerformance.set(categoryId, {
          target: current.target,
          actual: current.actual + Number(item.total_amount || 0),
        });
      });

      const categoryPerformanceArray = Array.from(
        categoryPerformance.entries()
      ).map(([categoryId, data]) => {
        const target = salesTargets.find(
          t => t.product_category_id === categoryId
        );
        return {
          category_id: categoryId,
          category_name:
            target?.sales_targets_product_categories?.category_name || 'N/A',
          target_amount: data.target,
          actual_sales: data.actual,
          achievement_percentage:
            data.target > 0
              ? Math.round((data.actual / data.target) * 10000) / 100
              : 0,
          gap: data.actual - data.target,
        };
      });

      const response = {
        summary: {
          total_salespeople: salespersonIds.size,
          total_categories: salesTargets.length,
          total_target_amount: totalTargetAmount,
          total_actual_sales: totalActualSales,
          achievement_percentage: Math.round(overallAchievement * 100) / 100,
        },
        performance: performanceData,
        category_performance: categoryPerformanceArray,
      };

      res.json({
        success: true,
        message: 'Report generated successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Sales vs Target Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report',
      });
    }
  },

  /**
   * Export Sales vs Target Report to Excel
   * GET /api/v1/reports/sales-vs-target/export
   */
  async exportSalesVsTargetReport(req: Request, res: Response) {
    try {
      const {
        start_date,
        end_date,
        salesperson_id,
        product_category_id,
        sales_target_group_id,
      } = req.query;

      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      const whereTargets: any = {
        is_active: 'Y',
        ...(product_category_id && {
          product_category_id: parseInt(product_category_id as string),
        }),
        ...(sales_target_group_id && {
          sales_target_group_id: parseInt(sales_target_group_id as string),
        }),
        ...(Object.keys(dateFilter).length > 0 && {
          OR: [
            {
              AND: [
                { start_date: { lte: dateFilter.lte || new Date() } },
                { end_date: { gte: dateFilter.gte || new Date() } },
              ],
            },
          ],
        }),
      };

      const salesTargets = await prisma.sales_targets.findMany({
        where: whereTargets,
        include: {
          sales_targets_product_categories: {
            select: { id: true, category_name: true },
          },
          sales_targets_groups: {
            include: {
              sales_target_group_members_id: {
                where: { is_active: 'Y' },
              },
            },
          },
        },
      });

      const salespersonIds = new Set<number>();
      const salespersonMap = new Map<number, string>();

      salesTargets.forEach(target => {
        target.sales_targets_groups?.sales_target_group_members_id?.forEach(
          (member: any) => {
            salespersonIds.add(member.sales_person_id);
            salespersonMap.set(member.sales_person_id, 'N/A');
          }
        );
      });

      const salespersons = await prisma.users.findMany({
        where: {
          id: { in: Array.from(salespersonIds) },
          is_active: 'Y',
        },
        select: { id: true, name: true, email: true },
      });

      salespersons.forEach(sp => {
        salespersonMap.set(sp.id, sp.name || 'N/A');
      });

      if (salesperson_id) {
        const requestedSalespersonId = parseInt(salesperson_id as string);
        if (!salespersonIds.has(requestedSalespersonId)) {
          return res.status(404).json({
            success: false,
            message: 'No data found for the selected filters',
          });
        }
        salespersonIds.clear();
        salespersonIds.add(requestedSalespersonId);
      }

      const actualSales = await prisma.order_items.findMany({
        where: {
          orders: {
            is_active: 'Y',
            salesperson_id: { in: Array.from(salespersonIds) },
            ...(Object.keys(dateFilter).length > 0 && {
              order_date: dateFilter,
            }),
          },
        },
        include: {
          orders: {
            select: {
              salesperson_id: true,
              order_date: true,
            },
          },
          products: {
            select: {
              category_id: true,
              product_categories_products: {
                select: { id: true, category_name: true },
              },
            },
          },
        },
      });

      const salesMap = new Map<string, { quantity: number; amount: number }>();
      const actualSalespersonIds = new Set<number>();

      actualSales.forEach(item => {
        const salespersonId = item.orders.salesperson_id;
        const categoryId = item.products.category_id;
        const key = `${salespersonId}_${categoryId}`;

        if (salespersonId) {
          actualSalespersonIds.add(salespersonId);
        }

        const current = salesMap.get(key) || { quantity: 0, amount: 0 };
        salesMap.set(key, {
          quantity: current.quantity + item.quantity,
          amount: current.amount + Number(item.total_amount || 0),
        });
      });

      const salespersonIdsToFetch = Array.from(actualSalespersonIds).filter(
        id => !salespersonMap.has(id) || salespersonMap.get(id) === 'N/A'
      );

      if (salespersonIdsToFetch.length > 0) {
        const missingSalespersons = await prisma.users.findMany({
          where: {
            id: { in: salespersonIdsToFetch },
          },
          select: { id: true, name: true, email: true },
        });

        missingSalespersons.forEach(sp => {
          salespersonMap.set(sp.id, sp.name || 'N/A');
        });
      }

      const performanceData: any[] = [];

      for (const [key, sales] of salesMap.entries()) {
        const [salespersonId, categoryId] = key.split('_').map(Number);

        const target = salesTargets.find(
          t => t.product_category_id === categoryId
        );

        if (target) {
          const targetAmount = Number(target.target_amount || 0);
          const achievement =
            targetAmount > 0 ? (sales.amount / targetAmount) * 100 : 0;

          performanceData.push({
            salesperson_id: salespersonId,
            salesperson_name: salespersonMap.get(salespersonId) || 'N/A',
            category_id: categoryId,
            category_name:
              target.sales_targets_product_categories?.category_name || 'N/A',
            target_quantity: target.target_quantity,
            target_amount: targetAmount,
            actual_quantity: sales.quantity,
            actual_sales: sales.amount,
            achievement_percentage: Math.round(achievement * 100) / 100,
            gap: sales.amount - targetAmount,
          });
        }
      }

      const categoryPerformance = new Map<
        number,
        { target: number; actual: number; name: string }
      >();

      salesTargets.forEach(target => {
        const categoryId = target.product_category_id;
        const current = categoryPerformance.get(categoryId) || {
          target: 0,
          actual: 0,
          name: target.sales_targets_product_categories?.category_name || 'N/A',
        };
        categoryPerformance.set(categoryId, {
          ...current,
          target: current.target + Number(target.target_amount || 0),
        });
      });

      actualSales.forEach(item => {
        const categoryId = item.products.category_id;
        const current = categoryPerformance.get(categoryId) || {
          target: 0,
          actual: 0,
          name: 'N/A',
        };
        categoryPerformance.set(categoryId, {
          ...current,
          actual: current.actual + Number(item.total_amount || 0),
        });
      });

      const categoryPerformanceArray = Array.from(
        categoryPerformance.entries()
      ).map(([categoryId, data]) => {
        return {
          category_name: data.name,
          target_amount: data.target,
          actual_sales: data.actual,
          achievement_percentage:
            data.target > 0
              ? Math.round((data.actual / data.target) * 10000) / 100
              : 0,
          gap: data.actual - data.target,
        };
      });

      const totalTargetAmount = salesTargets.reduce(
        (sum, target) => sum + Number(target.target_amount || 0),
        0
      );
      const totalActualSales = Array.from(salesMap.values()).reduce(
        (sum, sales) => sum + sales.amount,
        0
      );
      const overallAchievement =
        totalTargetAmount > 0
          ? (totalActualSales / totalTargetAmount) * 100
          : 0;

      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      const performanceSheet = workbook.addWorksheet(
        'Performance by Salesperson',
        {
          pageSetup: { paperSize: 9, orientation: 'landscape' },
        }
      );
      performanceSheet.columns = [
        { header: 'Salesperson', key: 'salesperson_name', width: 25 },
        { header: 'Category', key: 'category_name', width: 25 },
        { header: 'Target Quantity', key: 'target_quantity', width: 18 },
        { header: 'Target Amount', key: 'target_amount', width: 18 },
        { header: 'Actual Quantity', key: 'actual_quantity', width: 18 },
        { header: 'Actual Sales', key: 'actual_sales', width: 18 },
        { header: 'Achievement %', key: 'achievement_percentage', width: 18 },
        { header: 'Gap', key: 'gap', width: 18 },
      ];
      performanceData.forEach((row: any) => {
        performanceSheet.addRow({
          salesperson_name: row.salesperson_name,
          category_name: row.category_name,
          target_quantity: row.target_quantity || 0,
          target_amount: row.target_amount || 0,
          actual_quantity: row.actual_quantity || 0,
          actual_sales: row.actual_sales || 0,
          achievement_percentage: row.achievement_percentage || 0,
          gap: row.gap || 0,
        });
      });

      const categorySheet = workbook.addWorksheet('Category Performance', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      categorySheet.columns = [
        { header: 'Category', key: 'category_name', width: 30 },
        { header: 'Target Amount', key: 'target_amount', width: 18 },
        { header: 'Actual Sales', key: 'actual_sales', width: 18 },
        { header: 'Achievement %', key: 'achievement_percentage', width: 18 },
        { header: 'Gap', key: 'gap', width: 18 },
      ];
      categoryPerformanceArray.forEach((row: any) => {
        categorySheet.addRow(row);
      });

      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const summaryData = [
        { metric: 'Total Salespeople', value: salespersonIds.size },
        { metric: 'Total Categories', value: salesTargets.length },
        { metric: 'Total Target Amount', value: totalTargetAmount },
        { metric: 'Total Actual Sales', value: totalActualSales },
        {
          metric: 'Achievement Percentage',
          value: `${overallAchievement.toFixed(2)}%`,
        },
      ];

      summaryData.forEach(row => {
        summarySheet.addRow(row);
      });

      [performanceSheet, categorySheet, summarySheet].forEach(sheet => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
      });

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Sales_Vs_Target_Report_${Date.now()}.xlsx`
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Export Sales vs Target Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export report',
      });
    }
  },

  /**
   * Get Asset Movement/Status Report
   * GET /api/v1/reports/asset-movement-status
   */
  async getAssetMovementStatusReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, asset_type_id, asset_status, customer_id } =
        req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Asset Master
      const whereAssets: any = {
        is_active: 'Y',
        ...(asset_type_id && {
          asset_type_id: parseInt(asset_type_id as string),
        }),
        ...(asset_status && { current_status: asset_status as string }),
      };

      const assets = await prisma.asset_master.findMany({
        where: whereAssets,
        include: {
          asset_master_asset_types: {
            select: { id: true, name: true, category: true, brand: true },
          },
        },
      });

      // Fetch Asset Movements
      const whereMovements: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && {
          movement_date: dateFilter,
        }),
      };

      // Apply filters to movements based on asset query results
      if (asset_status || asset_type_id) {
        const filteredAssetIds = assets.map(a => a.id);
        whereMovements.asset_id = { in: filteredAssetIds };
      }

      const movements = await prisma.asset_movements.findMany({
        where: whereMovements,
        include: {
          asset_movements_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
          asset_movements_performed_by: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Fetch Customer Assets
      const whereCustomerAssets: any = {
        is_active: 'Y',
        ...(customer_id && { customer_id: parseInt(customer_id as string) }),
        ...(asset_type_id && {
          asset_type_id: parseInt(asset_type_id as string),
        }),
        ...(asset_status && { status: asset_status as string }),
      };

      const customerAssets = await prisma.customer_assets.findMany({
        where: whereCustomerAssets,
        include: {
          customer_assets_customers: {
            select: { id: true, name: true, code: true },
          },
          customer_asset_types: {
            select: { id: true, name: true, category: true, brand: true },
          },
          customer_assets_users: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Fetch Asset Warranty Claims
      const whereClaims: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && { claim_date: dateFilter }),
      };

      // Apply filters to warranty claims based on asset query results
      if (asset_status || asset_type_id) {
        const filteredAssetIds = assets.map(a => a.id);
        whereClaims.asset_id = { in: filteredAssetIds };
      }

      const warrantyClaims = await prisma.asset_warranty_claims.findMany({
        where: whereClaims,
        include: {
          asset_master_warranty_claims: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      // Serialize data
      const serializedAssets = assets.map(asset => ({
        id: asset.id,
        asset_type: asset.asset_master_asset_types?.name || 'N/A',
        category: asset.asset_master_asset_types?.category || 'N/A',
        brand: asset.asset_master_asset_types?.brand || 'N/A',
        serial_number: asset.serial_number,
        purchase_date: asset.purchase_date?.toISOString() || null,
        warranty_expiry: asset.warranty_expiry?.toISOString() || null,
        current_location: asset.current_location || 'N/A',
        current_status: asset.current_status || 'N/A',
        assigned_to: asset.assigned_to || 'N/A',
      }));

      const serializedMovements = movements.map(movement => ({
        id: movement.id,
        asset_serial: movement.asset_movements_master?.serial_number || 'N/A',
        asset_type:
          movement.asset_movements_master?.asset_master_asset_types?.name ||
          'N/A',
        from_location: movement.from_location || 'N/A',
        to_location: movement.to_location || 'N/A',
        movement_type: movement.movement_type || 'N/A',
        movement_date: movement.movement_date?.toISOString() || '',
        performed_by: movement.asset_movements_performed_by?.name || 'N/A',
        performed_by_email:
          movement.asset_movements_performed_by?.email || 'N/A',
        notes: movement.notes || 'N/A',
      }));

      const serializedCustomerAssets = customerAssets.map(ca => ({
        id: ca.id,
        customer_name: ca.customer_assets_customers?.name || 'N/A',
        customer_code: ca.customer_assets_customers?.code || 'N/A',
        asset_type: ca.customer_asset_types?.name || 'N/A',
        category: ca.customer_asset_types?.category || 'N/A',
        brand: ca.customer_asset_types?.brand || 'N/A',
        model: ca.model || 'N/A',
        serial_number: ca.serial_number || 'N/A',
        capacity: ca.capacity || 0,
        install_date: ca.install_date?.toISOString() || null,
        status: ca.status || 'N/A',
        last_scanned_date: ca.last_scanned_date?.toISOString() || null,
        technician_name: ca.customer_assets_users?.name || 'N/A',
        warranty_expiry: ca.warranty_expiry?.toISOString() || null,
      }));

      const serializedWarrantyClaims = warrantyClaims.map(claim => ({
        id: claim.id,
        asset_serial:
          claim.asset_master_warranty_claims?.serial_number || 'N/A',
        asset_type:
          claim.asset_master_warranty_claims?.asset_master_asset_types?.name ||
          'N/A',
        claim_date: claim.claim_date?.toISOString() || '',
        issue_description: claim.issue_description || 'N/A',
        claim_status: claim.claim_status || 'N/A',
        resolved_date: claim.resolved_date?.toISOString() || null,
        notes: claim.notes || 'N/A',
      }));

      // Calculate summary statistics
      const summary = {
        total_assets: assets.length,
        total_movements: movements.length,
        total_customer_assets: customerAssets.length,
        total_warranty_claims: warrantyClaims.length,
        assets_by_status: assets.reduce((acc: any, asset) => {
          const status = asset.current_status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        customer_assets_by_status: customerAssets.reduce((acc: any, ca) => {
          const status = ca.status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        claims_by_status: warrantyClaims.reduce((acc: any, claim) => {
          const status = claim.claim_status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
      };

      const response = {
        summary,
        data: {
          assets: serializedAssets,
          movements: serializedMovements,
          customer_assets: serializedCustomerAssets,
          warranty_claims: serializedWarrantyClaims,
        },
      };

      res.json({
        success: true,
        message: 'Asset Movement/Status report generated successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Asset Movement/Status Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report',
      });
    }
  },

  /**
   * Export Asset $"Movement/Status Report to Excel
   * GET /api/v1/reports/asset-movement-status/export
   */
  async exportAssetMovementStatusReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, asset_type_id, asset_status, customer_id } =
        req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Asset Master
      const whereAssets: any = {
        is_active: 'Y',
        ...(asset_type_id && {
          asset_type_id: parseInt(asset_type_id as string),
        }),
        ...(asset_status && { current_status: asset_status as string }),
      };

      const assets = await prisma.asset_master.findMany({
        where: whereAssets,
        include: {
          asset_master_asset_types: {
            select: { id: true, name: true, category: true, brand: true },
          },
        },
      });

      // Fetch Asset Movements
      const whereMovements: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && {
          movement_date: dateFilter,
        }),
      };

      // Apply filters to movements based on asset query results
      if (asset_status || asset_type_id) {
        const filteredAssetIds = assets.map(a => a.id);
        whereMovements.asset_id = { in: filteredAssetIds };
      }

      const movements = await prisma.asset_movements.findMany({
        where: whereMovements,
        include: {
          asset_movements_master: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
          asset_movements_performed_by: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Fetch Customer Assets
      const whereCustomerAssets: any = {
        is_active: 'Y',
        ...(customer_id && { customer_id: parseInt(customer_id as string) }),
        ...(asset_type_id && {
          asset_type_id: parseInt(asset_type_id as string),
        }),
        ...(asset_status && { status: asset_status as string }),
      };

      const customerAssets = await prisma.customer_assets.findMany({
        where: whereCustomerAssets,
        include: {
          customer_assets_customers: {
            select: { id: true, name: true, code: true },
          },
          customer_asset_types: {
            select: { id: true, name: true, category: true, brand: true },
          },
          customer_assets_users: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Fetch Asset Warranty Claims
      const whereClaims: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && { claim_date: dateFilter }),
      };

      // Apply filters to warranty claims based on asset query results
      if (asset_status || asset_type_id) {
        const filteredAssetIds = assets.map(a => a.id);
        whereClaims.asset_id = { in: filteredAssetIds };
      }

      const warrantyClaims = await prisma.asset_warranty_claims.findMany({
        where: whereClaims,
        include: {
          asset_master_warranty_claims: {
            include: {
              asset_master_asset_types: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      // Import ExcelJS
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      // Create Asset Master sheet
      const assetsSheet = workbook.addWorksheet('Asset Master', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      assetsSheet.columns = [
        { header: 'Serial Number', key: 'serial_number', width: 20 },
        { header: 'Asset Type', key: 'asset_type', width: 20 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Brand', key: 'brand', width: 15 },
        { header: 'Purchase Date', key: 'purchase_date', width: 15 },
        { header: 'Warranty Expiry', key: 'warranty_expiry', width: 15 },
        { header: 'Current Location', key: 'current_location', width: 20 },
        { header: 'Status', key: 'current_status', width: 15 },
        { header: 'Assigned To', key: 'assigned_to', width: 20 },
      ];
      assets.forEach((asset: any) => {
        assetsSheet.addRow({
          serial_number: asset.serial_number,
          asset_type: asset.asset_master_asset_types?.name || 'N/A',
          category: asset.asset_master_asset_types?.category || 'N/A',
          brand: asset.asset_master_asset_types?.brand || 'N/A',
          purchase_date: asset.purchase_date
            ? new Date(asset.purchase_date).toLocaleDateString()
            : 'N/A',
          warranty_expiry: asset.warranty_expiry
            ? new Date(asset.warranty_expiry).toLocaleDateString()
            : 'N/A',
          current_location: asset.current_location || 'N/A',
          current_status: asset.current_status || 'N/A',
          assigned_to: asset.assigned_to || 'N/A',
        });
      });

      // Create Asset Movements sheet
      const movementsSheet = workbook.addWorksheet('Asset Movements', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      movementsSheet.columns = [
        { header: 'Asset Serial', key: 'asset_serial', width: 20 },
        { header: 'Asset Type', key: 'asset_type', width: 20 },
        { header: 'From Location', key: 'from_location', width: 20 },
        { header: 'To Location', key: 'to_location', width: 20 },
        { header: 'Movement Type', key: 'movement_type', width: 18 },
        { header: 'Movement Date', key: 'movement_date', width: 18 },
        { header: 'Performed By', key: 'performed_by', width: 20 },
        { header: 'Notes', key: 'notes', width: 30 },
      ];
      movements.forEach((movement: any) => {
        movementsSheet.addRow({
          asset_serial: movement.asset_movements_master?.serial_number || 'N/A',
          asset_type:
            movement.asset_movements_master?.asset_master_asset_types?.name ||
            'N/A',
          from_location: movement.from_location || 'N/A',
          to_location: movement.to_location || 'N/A',
          movement_type: movement.movement_type || 'N/A',
          movement_date: movement.movement_date
            ? new Date(movement.movement_date).toLocaleDateString()
            : 'N/A',
          performed_by: movement.asset_movements_performed_by?.name || 'N/A',
          notes: movement.notes || 'N/A',
        });
      });

      // Create Customer Assets sheet
      const customerAssetsSheet = workbook.addWorksheet('Customer Assets', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      customerAssetsSheet.columns = [
        { header: 'Customer Name', key: 'customer_name', width: 25 },
        { header: 'Customer Code', key: 'customer_code', width: 15 },
        { header: 'Asset Type', key: 'asset_type', width: 20 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Brand', key: 'brand', width: 15 },
        { header: 'Model', key: 'model', width: 15 },
        { header: 'Serial Number', key: 'serial_number', width: 20 },
        { header: 'Capacity', key: 'capacity', width: 12 },
        { header: 'Install Date', key: 'install_date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Technician', key: 'technician', width: 20 },
        { header: 'Warranty Expiry', key: 'warranty_expiry', width: 15 },
      ];
      customerAssets.forEach((ca: any) => {
        customerAssetsSheet.addRow({
          customer_name: ca.customer_assets_customers?.name || 'N/A',
          customer_code: ca.customer_assets_customers?.code || 'N/A',
          asset_type: ca.customer_asset_types?.name || 'N/A',
          category: ca.customer_asset_types?.category || 'N/A',
          brand: ca.customer_asset_types?.brand || 'N/A',
          model: ca.model || 'N/A',
          serial_number: ca.serial_number || 'N/A',
          capacity: ca.capacity || 0,
          install_date: ca.install_date
            ? new Date(ca.install_date).toLocaleDateString()
            : 'N/A',
          status: ca.status || 'N/A',
          technician: ca.customer_assets_users?.name || 'N/A',
          warranty_expiry: ca.warranty_expiry
            ? new Date(ca.warranty_expiry).toLocaleDateString()
            : 'N/A',
        });
      });

      // Create Warranty Claims sheet
      const claimsSheet = workbook.addWorksheet('Warranty Claims', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      claimsSheet.columns = [
        { header: 'Asset Serial', key: 'asset_serial', width: 20 },
        { header: 'Asset Type', key: 'asset_type', width: 20 },
        { header: 'Claim Date', key: 'claim_date', width: 15 },
        { header: 'Issue Description', key: 'issue_description', width: 30 },
        { header: 'Claim Status', key: 'claim_status', width: 15 },
        { header: 'Resolved Date', key: 'resolved_date', width: 15 },
        { header: 'Notes', key: 'notes', width: 30 },
      ];
      warrantyClaims.forEach((claim: any) => {
        claimsSheet.addRow({
          asset_serial:
            claim.asset_master_warranty_claims?.serial_number || 'N/A',
          asset_type:
            claim.asset_master_warranty_claims?.asset_master_asset_types
              ?.name || 'N/A',
          claim_date: claim.claim_date
            ? new Date(claim.claim_date).toLocaleDateString()
            : 'N/A',
          issue_description: claim.issue_description || 'N/A',
          claim_status: claim.claim_status || 'N/A',
          resolved_date: claim.resolved_date
            ? new Date(claim.resolved_date).toLocaleDateString()
            : 'N/A',
          notes: claim.notes || 'N/A',
        });
      });

      // Create Summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const summaryData = [
        { metric: 'Total Assets', value: assets.length },
        { metric: 'Total Asset Movements', value: movements.length },
        { metric: 'Total Customer Assets', value: customerAssets.length },
        { metric: 'Total Warranty Claims', value: warrantyClaims.length },
      ];

      summaryData.forEach(row => {
        summarySheet.addRow(row);
      });

      // Style header rows
      [
        assetsSheet,
        movementsSheet,
        customerAssetsSheet,
        claimsSheet,
        summarySheet,
      ].forEach(sheet => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Asset_Movement_Status_Report_${Date.now()}.xlsx`
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Export Asset Movement/Status Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export report',
      });
    }
  },

  /**
   * Get Visit Frequency/Completion Report
   * GET /api/v1/reports/visit-frequency-completion
   */
  async getVisitFrequencyCompletionReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, salesperson_id, customer_id, status } =
        req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Visits
      const whereVisits: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && { visit_date: dateFilter }),
        ...(salesperson_id && {
          sales_person_id: parseInt(salesperson_id as string),
        }),
        ...(customer_id && { customer_id: parseInt(customer_id as string) }),
        ...(status && { status: status as string }),
      };

      const visits = await prisma.visits.findMany({
        where: whereVisits,
        include: {
          visit_customers: {
            select: { id: true, name: true, code: true },
          },
          visits_salesperson: {
            select: { id: true, name: true, email: true },
          },
          visit_routes: {
            select: { id: true, name: true, code: true },
          },
          visit_zones: {
            select: { id: true, name: true, code: true },
          },
          visit_tasks_visits: {
            where: { is_active: 'Y' },
          },
        },
        orderBy: { visit_date: 'desc' },
      });

      // Fetch GPS Logs
      const whereGpsLogs: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && { log_time: dateFilter }),
        ...(salesperson_id && {
          user_id: parseInt(salesperson_id as string),
        }),
      };

      const gpsLogs = await prisma.gps_logs.findMany({
        where: whereGpsLogs,
        include: {
          users_gps_logs_user_idTousers: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { log_time: 'desc' },
        take: 10000, // Limit to prevent huge queries
      });

      // Serialize visits
      const serializedVisits = visits.map(visit => {
        const totalTasks = visit.visit_tasks_visits?.length || 0;
        const completedTasks =
          visit.visit_tasks_visits?.filter(
            (task: any) => task.status === 'completed'
          ).length || 0;
        const duration =
          visit.end_time && visit.start_time
            ? Math.round(
                (new Date(visit.end_time).getTime() -
                  new Date(visit.start_time).getTime()) /
                  1000 /
                  60
              )
            : visit.duration || 0;

        return {
          id: visit.id,
          customer_name: visit.visit_customers?.name || 'N/A',
          customer_code: visit.visit_customers?.code || 'N/A',
          salesperson_name: visit.visits_salesperson?.name || 'N/A',
          salesperson_email: visit.visits_salesperson?.email || 'N/A',
          route_name: visit.visit_routes?.name || 'N/A',
          zone_name: visit.visit_zones?.name || 'N/A',
          visit_date: visit.visit_date?.toISOString() || '',
          visit_time: visit.visit_time || 'N/A',
          purpose: visit.purpose || 'N/A',
          status: visit.status || 'N/A',
          start_time: visit.start_time?.toISOString() || null,
          end_time: visit.end_time?.toISOString() || null,
          duration_minutes: duration,
          check_in_time: visit.check_in_time?.toISOString() || null,
          check_out_time: visit.check_out_time?.toISOString() || null,
          orders_created: visit.orders_created || 0,
          amount_collected: Number(visit.amount_collected || 0),
          visit_notes: visit.visit_notes || 'N/A',
          customer_feedback: visit.customer_feedback || 'N/A',
          next_visit_date: visit.next_visit_date?.toISOString() || null,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          completion_rate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
        };
      });

      // Serialize visit tasks
      const allTasks: any[] = [];
      visits.forEach(visit => {
        if (visit.visit_tasks_visits && visit.visit_tasks_visits.length > 0) {
          visit.visit_tasks_visits.forEach((task: any) => {
            allTasks.push({
              id: task.id,
              customer_name: visit.visit_customers?.name || 'N/A',
              visit_date: visit.visit_date?.toISOString() || '',
              task_type: task.task_type || 'N/A',
              description: task.description || 'N/A',
              assigned_to: task.assigned_to || null,
              due_date: task.due_date?.toISOString() || null,
              completed_date: task.completed_date?.toISOString() || null,
              status: task.status || 'N/A',
              priority: task.priority || 'N/A',
            });
          });
        }
      });

      // Serialize GPS logs
      const serializedGpsLogs = gpsLogs.map(log => ({
        id: log.id,
        user_name: log.users_gps_logs_user_idTousers?.name || 'N/A',
        user_email: log.users_gps_logs_user_idTousers?.email || 'N/A',
        latitude: Number(log.latitude),
        longitude: Number(log.longitude),
        log_time: log.log_time?.toISOString() || '',
        accuracy_meters: log.accuracy_meters || 0,
        speed_kph: Number(log.speed_kph || 0),
        battery_level: Number(log.battery_level || 0),
        network_type: log.network_type || 'N/A',
      }));

      // Calculate summary statistics
      const totalVisits = visits.length;
      const completedVisits = visits.filter(
        v => v.status?.toLowerCase() === 'completed'
      ).length;
      const inProgressVisits = visits.filter(
        v => v.status?.toLowerCase() === 'in_progress'
      ).length;
      const plannedVisits = visits.filter(
        v => v.status?.toLowerCase() === 'planned'
      ).length;

      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(
        t => t.status === 'completed'
      ).length;
      const pendingTasks = allTasks.filter(t => t.status === 'pending').length;

      const totalDuration = serializedVisits.reduce(
        (sum, v) => sum + v.duration_minutes,
        0
      );
      const avgDuration =
        serializedVisits.length > 0
          ? Math.round(totalDuration / serializedVisits.length)
          : 0;

      const totalOrdersCreated = serializedVisits.reduce(
        (sum, v) => sum + v.orders_created,
        0
      );
      const totalAmountCollected = serializedVisits.reduce(
        (sum, v) => sum + v.amount_collected,
        0
      );

      const completionRate =
        totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;

      const summary = {
        total_visits: totalVisits,
        completed_visits: completedVisits,
        in_progress_visits: inProgressVisits,
        planned_visits: plannedVisits,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        pending_tasks: pendingTasks,
        avg_duration_minutes: avgDuration,
        total_orders_created: totalOrdersCreated,
        total_amount_collected: totalAmountCollected,
        completion_rate: completionRate,
        gps_logs_count: gpsLogs.length,
      };

      const response = {
        summary,
        data: {
          visits: serializedVisits,
          tasks: allTasks,
          gps_logs: serializedGpsLogs,
        },
      };

      res.json({
        success: true,
        message: 'Visit Frequency/Completion report generated successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Visit Frequency/Completion Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report',
      });
    }
  },

  /**
   * Export Visit Frequency/Completion Report to Excel
   * GET /api/v1/reports/visit-frequency-completion/export
   */
  async exportVisitFrequencyCompletionReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, salesperson_id, customer_id, status } =
        req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Visits
      const whereVisits: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && { visit_date: dateFilter }),
        ...(salesperson_id && {
          sales_person_id: parseInt(salesperson_id as string),
        }),
        ...(customer_id && { customer_id: parseInt(customer_id as string) }),
        ...(status && { status: status as string }),
      };

      const visits = await prisma.visits.findMany({
        where: whereVisits,
        include: {
          visit_customers: {
            select: { id: true, name: true, code: true },
          },
          visits_salesperson: {
            select: { id: true, name: true, email: true },
          },
          visit_routes: {
            select: { id: true, name: true, code: true },
          },
          visit_zones: {
            select: { id: true, name: true, code: true },
          },
          visit_tasks_visits: {
            where: { is_active: 'Y' },
          },
        },
      });

      // Fetch GPS Logs
      const whereGpsLogs: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && { log_time: dateFilter }),
        ...(salesperson_id && {
          user_id: parseInt(salesperson_id as string),
        }),
      };

      const gpsLogs = await prisma.gps_logs.findMany({
        where: whereGpsLogs,
        include: {
          users_gps_logs_user_idTousers: {
            select: { id: true, name: true, email: true },
          },
        },
        take: 10000,
      });

      // Process visit tasks
      const allTasks: any[] = [];
      visits.forEach(visit => {
        if (visit.visit_tasks_visits && visit.visit_tasks_visits.length > 0) {
          visit.visit_tasks_visits.forEach((task: any) => {
            allTasks.push({
              customer_name: visit.visit_customers?.name || 'N/A',
              visit_date: visit.visit_date?.toISOString() || '',
              task_type: task.task_type || 'N/A',
              description: task.description || 'N/A',
              due_date: task.due_date?.toISOString() || null,
              completed_date: task.completed_date?.toISOString() || null,
              status: task.status || 'N/A',
              priority: task.priority || 'N/A',
            });
          });
        }
      });

      // Import ExcelJS
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      // Create Visits sheet
      const visitsSheet = workbook.addWorksheet('Visits', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      visitsSheet.columns = [
        { header: 'Customer Name', key: 'customer_name', width: 25 },
        { header: 'Customer Code', key: 'customer_code', width: 15 },
        { header: 'Salesperson', key: 'salesperson', width: 20 },
        { header: 'Route', key: 'route', width: 15 },
        { header: 'Zone', key: 'zone', width: 15 },
        { header: 'Visit Date', key: 'visit_date', width: 15 },
        { header: 'Purpose', key: 'purpose', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Duration (min)', key: 'duration', width: 15 },
        { header: 'Orders Created', key: 'orders', width: 15 },
        { header: 'Amount Collected', key: 'amount', width: 18 },
        { header: 'Tasks Completed', key: 'tasks', width: 18 },
      ];
      visits.forEach((visit: any) => {
        const duration =
          visit.end_time && visit.start_time
            ? Math.round(
                (new Date(visit.end_time).getTime() -
                  new Date(visit.start_time).getTime()) /
                  1000 /
                  60
              )
            : visit.duration || 0;
        const taskCount = visit.visit_tasks_visits?.length || 0;
        const completedTaskCount =
          visit.visit_tasks_visits?.filter(
            (task: any) => task.status === 'completed'
          ).length || 0;

        visitsSheet.addRow({
          customer_name: visit.visit_customers?.name || 'N/A',
          customer_code: visit.visit_customers?.code || 'N/A',
          salesperson: visit.visits_salesperson?.name || 'N/A',
          route: visit.visit_routes?.name || 'N/A',
          zone: visit.visit_zones?.name || 'N/A',
          visit_date: visit.visit_date
            ? new Date(visit.visit_date).toLocaleDateString()
            : 'N/A',
          purpose: visit.purpose || 'N/A',
          status: visit.status || 'N/A',
          duration: duration,
          orders: visit.orders_created || 0,
          amount: Number(visit.amount_collected || 0),
          tasks: `${completedTaskCount}/${taskCount}`,
        });
      });

      // Create Visit Tasks sheet
      const tasksSheet = workbook.addWorksheet('Visit Tasks', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      tasksSheet.columns = [
        { header: 'Customer Name', key: 'customer_name', width: 25 },
        { header: 'Visit Date', key: 'visit_date', width: 15 },
        { header: 'Task Type', key: 'task_type', width: 15 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'Due Date', key: 'due_date', width: 15 },
        { header: 'Completed Date', key: 'completed_date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Priority', key: 'priority', width: 12 },
      ];
      allTasks.forEach((task: any) => {
        tasksSheet.addRow({
          customer_name: task.customer_name,
          visit_date: task.visit_date
            ? new Date(task.visit_date).toLocaleDateString()
            : 'N/A',
          task_type: task.task_type,
          description: task.description,
          due_date: task.due_date
            ? new Date(task.due_date).toLocaleDateString()
            : 'N/A',
          completed_date: task.completed_date
            ? new Date(task.completed_date).toLocaleDateString()
            : 'N/A',
          status: task.status,
          priority: task.priority,
        });
      });

      // Create GPS Logs sheet
      const gpsSheet = workbook.addWorksheet('GPS Logs', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      gpsSheet.columns = [
        { header: 'User Name', key: 'user_name', width: 20 },
        { header: 'Log Time', key: 'log_time', width: 20 },
        { header: 'Latitude', key: 'latitude', width: 15 },
        { header: 'Longitude', key: 'longitude', width: 15 },
        { header: 'Accuracy (m)', key: 'accuracy', width: 15 },
        { header: 'Speed (km/h)', key: 'speed', width: 15 },
        { header: 'Battery Level', key: 'battery', width: 15 },
        { header: 'Network Type', key: 'network', width: 15 },
      ];
      gpsLogs.forEach((log: any) => {
        gpsSheet.addRow({
          user_name: log.users_gps_logs_user_idTousers?.name || 'N/A',
          log_time: log.log_time
            ? new Date(log.log_time).toLocaleString()
            : 'N/A',
          latitude: Number(log.latitude),
          longitude: Number(log.longitude),
          accuracy: log.accuracy_meters || 0,
          speed: Number(log.speed_kph || 0),
          battery: Number(log.battery_level || 0),
          network: log.network_type || 'N/A',
        });
      });

      // Create Summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const totalVisitsExport = visits.length;
      const completedVisitsExport = visits.filter(
        v => v.status?.toLowerCase() === 'completed'
      ).length;
      const totalTasksExport = allTasks.length;
      const completedTasksExport = allTasks.filter(
        t => t.status === 'completed'
      ).length;

      const summaryData = [
        { metric: 'Total Visits', value: totalVisitsExport },
        { metric: 'Completed Visits', value: completedVisitsExport },
        {
          metric: 'Visit Completion Rate',
          value: `${completedVisitsExport > 0 ? Math.round((completedVisitsExport / totalVisitsExport) * 100) : 0}%`,
        },
        { metric: 'Total Tasks', value: totalTasksExport },
        { metric: 'Completed Tasks', value: completedTasksExport },
        { metric: 'GPS Logs', value: gpsLogs.length },
      ];

      summaryData.forEach(row => {
        summarySheet.addRow(row);
      });

      // Style header rows
      [visitsSheet, tasksSheet, gpsSheet, summarySheet].forEach(sheet => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Visit_Frequency_Completion_Report_${Date.now()}.xlsx`
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Export Visit Frequency/Completion Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export report',
      });
    }
  },

  /**
   * Get Promo Effectiveness Report
   * GET /api/v1/reports/promo-effectiveness
   */
  async getPromoEffectivenessReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, promotion_id, depot_id, zone_id } =
        req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Promotions
      const wherePromotions: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && {
          OR: [
            {
              AND: [
                { start_date: { lte: dateFilter.lte || new Date() } },
                { end_date: { gte: dateFilter.gte || new Date() } },
              ],
            },
          ],
        }),
        ...(promotion_id && {
          id: parseInt(promotion_id as string),
        }),
        ...(depot_id && { depot_id: parseInt(depot_id as string) }),
        ...(zone_id && { zone_id: parseInt(zone_id as string) }),
      };

      const promotions = await prisma.promotions.findMany({
        where: wherePromotions,
        include: {
          promotion_customer_types_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_customer_types_customer: {
                select: { id: true, type_name: true, type_code: true },
              },
            },
          },
          promotion_parameters_promotions: {
            where: { is_active: 'Y' },
          },
          products_promotion_products: {
            where: { is_active: 'Y' },
            include: {
              promotion_products_products: {
                select: { id: true, name: true, code: true, category_id: true },
              },
            },
          },
          promotion_depot_promotions: {
            where: { is_active: 'Y' },
            include: {
              depots: {
                select: { id: true, name: true, code: true },
              },
            },
          },
          promotion_zones_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_zones_zones: {
                select: { id: true, name: true, code: true },
              },
            },
          },
        },
        orderBy: { start_date: 'desc' },
      });

      // Serialize promotions with their products and parameters
      const serializedPromotions = promotions.map((promo: any) => {
        const products = promo.products_promotion_products || [];
        const parameters = promo.promotion_parameters_promotions || [];
        const customerTypes = promo.promotion_customer_types_promotions || [];

        // Calculate effectivness metrics (simplified - you may need to join with order_items or invoices)
        const totalProducts = products.length;
        const totalParameters = parameters.length;
        const applicableCustomerTypes = customerTypes
          .map(
            (ct: any) =>
              ct.promotion_customer_types_customer?.type_name || 'N/A'
          )
          .join(', ');

        return {
          id: promo.id,
          name: promo.name,
          code: promo.code,
          type: promo.type,
          description: promo.description || 'N/A',
          start_date: promo.start_date?.toISOString() || '',
          end_date: promo.end_date?.toISOString() || '',
          depot_name:
            promo.promotion_depot_promotions?.[0]?.depots?.name || 'N/A',
          zone_name:
            promo.promotion_zones_promotions?.[0]?.promotion_zones_zones
              ?.name || 'N/A',
          total_products: totalProducts,
          total_parameters: totalParameters,
          customer_types: applicableCustomerTypes || 'All',
          is_active: promo.is_active,
          status:
            new Date() < promo.start_date
              ? 'Upcoming'
              : new Date() > promo.end_date
                ? 'Expired'
                : 'Active',
        };
      });

      // Serialize promotion products
      const serializedProducts: any[] = [];
      promotions.forEach((promo: any) => {
        if (
          promo.products_promotion_products &&
          promo.products_promotion_products.length > 0
        ) {
          promo.products_promotion_products.forEach((pp: any) => {
            serializedProducts.push({
              id: pp.id,
              promotion_name: promo.name,
              promotion_code: promo.code,
              product_name: pp.promotion_products_products?.name || 'N/A',
              product_code: pp.promotion_products_products?.code || 'N/A',
              product_category_id:
                pp.promotion_products_products?.category_id || null,
            });
          });
        }
      });

      // Serialize promotion parameters
      const serializedParameters: any[] = [];
      promotions.forEach((promo: any) => {
        if (
          promo.promotion_parameters_promotions &&
          promo.promotion_parameters_promotions.length > 0
        ) {
          promo.promotion_parameters_promotions.forEach((param: any) => {
            serializedParameters.push({
              id: param.id,
              promotion_name: promo.name,
              promotion_code: promo.code,
              param_name: param.param_name,
              param_type: param.param_type,
              param_value: param.param_value || 'N/A',
              param_category: param.param_category,
            });
          });
        }
      });

      // Calculate summary statistics
      const totalPromotions = promotions.length;
      const activePromotions = promotions.filter(
        p =>
          new Date(p.end_date) >= new Date() &&
          new Date(p.start_date) <= new Date()
      ).length;
      const upcomingPromotions = promotions.filter(
        p => new Date(p.start_date) > new Date()
      ).length;
      const expiredPromotions = promotions.filter(
        p => new Date(p.end_date) < new Date()
      ).length;

      const totalProducts = serializedProducts.length;
      const totalParameters = serializedParameters.length;
      const uniqueCustomerTypes = new Set(
        (promotions as any[]).flatMap(
          (p: any) =>
            p.promotion_customer_types_promotions?.map(
              (ct: any) => ct.promotion_customer_types_customer?.type_name
            ) || []
        )
      ).size;

      const summary = {
        total_promotions: totalPromotions,
        active_promotions: activePromotions,
        upcoming_promotions: upcomingPromotions,
        expired_promotions: expiredPromotions,
        total_products: totalProducts,
        total_parameters: totalParameters,
        unique_customer_types: uniqueCustomerTypes,
        unique_depots: new Set(promotions.map(p => p.depot_id).filter(Boolean))
          .size,
        unique_zones: new Set(
          (promotions as any[]).map((p: any) => p.zone_id).filter(Boolean)
        ).size,
      };

      const response = {
        summary,
        data: {
          promotions: serializedPromotions,
          products: serializedProducts,
          parameters: serializedParameters,
        },
      };

      res.json({
        success: true,
        message: 'Promo Effectiveness report generated successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Promo Effectiveness Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report',
      });
    }
  },

  /**
   * Export Promo Effectiveness Report to Excel
   * GET /api/v1/reports/promo-effectiveness/export
   */
  async exportPromoEffectivenessReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, promotion_id, depot_id, zone_id } =
        req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Promotions (same logic as getReport)
      const wherePromotions: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && {
          OR: [
            {
              AND: [
                { start_date: { lte: dateFilter.lte || new Date() } },
                { end_date: { gte: dateFilter.gte || new Date() } },
              ],
            },
          ],
        }),
        ...(promotion_id && {
          id: parseInt(promotion_id as string),
        }),
        ...(depot_id && { depot_id: parseInt(depot_id as string) }),
        ...(zone_id && { zone_id: parseInt(zone_id as string) }),
      };

      const promotions = await prisma.promotions.findMany({
        where: wherePromotions,
        include: {
          promotion_customer_types_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_customer_types_customer: {
                select: { id: true, type_name: true, type_code: true },
              },
            },
          },
          promotion_parameters_promotions: {
            where: { is_active: 'Y' },
          },
          products_promotion_products: {
            where: { is_active: 'Y' },
            include: {
              promotion_products_products: {
                select: { id: true, name: true, code: true },
              },
            },
          },
          promotion_depot_promotions: {
            where: { is_active: 'Y' },
            include: {
              depots: {
                select: { id: true, name: true, code: true },
              },
            },
          },
          promotion_zones_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_zones_zones: {
                select: { id: true, name: true, code: true },
              },
            },
          },
        },
      });

      // Import ExcelJS
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      // Create Promotions sheet
      const promotionsSheet = workbook.addWorksheet('Promotions', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      promotionsSheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Code', key: 'code', width: 15 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Start Date', key: 'start_date', width: 15 },
        { header: 'End Date', key: 'end_date', width: 15 },
        { header: 'Depot', key: 'depot', width: 15 },
        { header: 'Zone', key: 'zone', width: 15 },
        { header: 'Products Count', key: 'products', width: 15 },
        { header: 'Customer Types', key: 'customer_types', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
      ];

      promotions.forEach((promo: any) => {
        const customerTypes =
          promo.promotion_customer_types_promotions
            ?.map(
              (ct: any) =>
                ct.promotion_customer_types_customer?.type_name || 'N/A'
            )
            .join(', ') || 'All';
        const productCount = promo.products_promotion_products?.length || 0;
        const status =
          new Date() < promo.start_date
            ? 'Upcoming'
            : new Date() > promo.end_date
              ? 'Expired'
              : 'Active';

        promotionsSheet.addRow({
          name: promo.name,
          code: promo.code,
          type: promo.type,
          start_date: promo.start_date
            ? new Date(promo.start_date).toLocaleDateString()
            : 'N/A',
          end_date: promo.end_date
            ? new Date(promo.end_date).toLocaleDateString()
            : 'N/A',
          depot: promo.promotion_depot_promotions?.[0]?.depots?.name || 'N/A',
          zone:
            promo.promotion_zones_promotions?.[0]?.promotion_zones_zones
              ?.name || 'N/A',
          products: productCount,
          customer_types: customerTypes,
          status: status,
        });
      });

      // Create Promotion Products sheet
      const productsSheet = workbook.addWorksheet('Promotion Products', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      productsSheet.columns = [
        { header: 'Promotion Name', key: 'promotion_name', width: 25 },
        { header: 'Promotion Code', key: 'promotion_code', width: 15 },
        { header: 'Product Name', key: 'product_name', width: 25 },
        { header: 'Product Code', key: 'product_code', width: 15 },
      ];

      promotions.forEach((promo: any) => {
        if (
          promo.products_promotion_products &&
          promo.products_promotion_products.length > 0
        ) {
          promo.products_promotion_products.forEach((pp: any) => {
            productsSheet.addRow({
              promotion_name: promo.name,
              promotion_code: promo.code,
              product_name: pp.promotion_products_products?.name || 'N/A',
              product_code: pp.promotion_products_products?.code || 'N/A',
            });
          });
        }
      });

      // Create Promotion Parameters sheet
      const parametersSheet = workbook.addWorksheet('Promotion Parameters', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      parametersSheet.columns = [
        { header: 'Promotion Name', key: 'promotion_name', width: 25 },
        { header: 'Promotion Code', key: 'promotion_code', width: 15 },
        { header: 'Parameter Name', key: 'param_name', width: 20 },
        { header: 'Parameter Type', key: 'param_type', width: 15 },
        { header: 'Parameter Value', key: 'param_value', width: 30 },
        { header: 'Category', key: 'category', width: 15 },
      ];

      promotions.forEach((promo: any) => {
        if (
          promo.promotion_parameters_promotions &&
          promo.promotion_parameters_promotions.length > 0
        ) {
          promo.promotion_parameters_promotions.forEach((param: any) => {
            parametersSheet.addRow({
              promotion_name: promo.name,
              promotion_code: promo.code,
              param_name: param.param_name,
              param_type: param.param_type,
              param_value: param.param_value || 'N/A',
              category: param.param_category,
            });
          });
        }
      });

      // Create Summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const totalPromotions = promotions.length;
      const activePromotions = promotions.filter(
        p =>
          new Date(p.end_date) >= new Date() &&
          new Date(p.start_date) <= new Date()
      ).length;

      // Calculate summary for export
      const allProductsForSummary: any[] = [];
      const allParametersForSummary: any[] = [];

      promotions.forEach((promo: any) => {
        if (promo.products_promotion_products) {
          allProductsForSummary.push(...promo.products_promotion_products);
        }
        if (promo.promotion_parameters_promotions) {
          allParametersForSummary.push(
            ...promo.promotion_parameters_promotions
          );
        }
      });

      const summaryData = [
        { metric: 'Total Promotions', value: totalPromotions },
        { metric: 'Active Promotions', value: activePromotions },
        { metric: 'Total Products', value: allProductsForSummary.length },
        { metric: 'Total Parameters', value: allParametersForSummary.length },
      ];

      summaryData.forEach(row => {
        summarySheet.addRow(row);
      });

      // Style header rows
      [promotionsSheet, productsSheet, parametersSheet, summarySheet].forEach(
        sheet => {
          const headerRow = sheet.getRow(1);
          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
          };
          headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
          headerRow.height = 25;
        }
      );

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Promo_Effectiveness_Report_${Date.now()}.xlsx`
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Export Promo Effectiveness Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export report',
      });
    }
  },

  /**
   * Get Region/Territory Sales Report
   * GET /api/v1/reports/region-territory-sales
   */
  async getRegionTerritorySalesReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, zone_id, depot_id, route_id } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Zones
      const whereZones: any = {
        is_active: 'Y',
        ...(depot_id && { depot_id: parseInt(depot_id as string) }),
        ...(zone_id && { id: parseInt(zone_id as string) }),
      };

      const zones = await prisma.zones.findMany({
        where: whereZones,
        include: {
          zone_depots: {
            select: { id: true, name: true, code: true },
          },
          customer_zones: {
            where: { is_active: 'Y' },
            select: { id: true },
          },
          routes_zones: {
            where: { is_active: 'Y' },
            ...(route_id && { id: parseInt(route_id as string) }),
            include: {
              routes_salesperson: {
                select: { id: true, name: true, email: true },
              },
              customer_routes: {
                where: { is_active: 'Y' },
              },
            },
          },
          visit_zones: {
            ...(Object.keys(dateFilter).length > 0 && {
              visit_date: dateFilter,
            }),
            select: { id: true },
          },
        },
      });

      // Fetch Orders by Zone
      const whereOrders: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && { order_date: dateFilter }),
      };

      const orders = await prisma.orders.findMany({
        where: whereOrders,
        include: {
          orders_customers: {
            select: { id: true, zones_id: true },
          },
          orders_salesperson_users: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Fetch Invoices by Zone
      const invoices = await prisma.invoices.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && {
            invoice_date: dateFilter,
          }),
        },
        include: {
          invoices_customers: {
            select: { id: true, zones_id: true },
          },
        },
      });

      // Fetch Payments by Zone
      const payments = await prisma.payments.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && {
            payment_date: dateFilter,
          }),
        },
        include: {
          payments_customers: {
            select: { id: true, zones_id: true },
          },
        },
      });

      // Serialize Zone/Territory data with aggregated sales metrics
      const serializedZones = zones.map(zone => {
        const zoneOrders = orders.filter(
          o => o.orders_customers?.zones_id === zone.id
        );
        const zoneInvoices = invoices.filter(
          i => i.invoices_customers?.zones_id === zone.id
        );
        const zonePayments = payments.filter(
          p => p.payments_customers?.zones_id === zone.id
        );

        const totalOrders = zoneOrders.length;
        const totalOrderValue = zoneOrders.reduce(
          (sum, o) => sum + Number(o.total_amount || 0),
          0
        );
        const totalInvoices = zoneInvoices.length;
        const totalInvoiceValue = zoneInvoices.reduce(
          (sum, i) => sum + Number(i.total_amount || 0),
          0
        );
        const totalCollection = zonePayments.reduce(
          (sum, p) => sum + Number(p.total_amount || 0),
          0
        );

        const customerCount = zone.customer_zones?.length || 0;
        const routeCount = zone.routes_zones?.length || 0;
        const visitCount = zone.visit_zones?.length || 0;

        // Aggregate by route
        const routesData = (zone.routes_zones || []).map((route: any) => {
          const routeCustomers = route.customer_routes || [];
          const routeOrders = orders.filter((o: any) => {
            return routeCustomers.some((c: any) => c.id === o.customer_id);
          });
          const routeInvoices = invoices.filter((i: any) => {
            return routeCustomers.some((c: any) => c.id === i.customer_id);
          });

          return {
            route_id: route.id,
            route_name: route.name,
            route_code: route.code,
            salesperson_name: route.routes_salesperson?.name || 'N/A',
            customers: route.customer_routes?.length || 0,
            orders: routeOrders.length,
            order_value: routeOrders.reduce(
              (sum: number, o: any) => sum + Number(o.total_amount || 0),
              0
            ),
            invoices: routeInvoices.length,
            invoice_value: routeInvoices.reduce(
              (sum: number, i: any) => sum + Number(i.total_amount || 0),
              0
            ),
          };
        });

        return {
          id: zone.id,
          name: zone.name,
          code: zone.code,
          description: zone.description || 'N/A',
          depot_name: zone.zone_depots?.name || 'N/A',
          customer_count: customerCount,
          route_count: routeCount,
          visit_count: visitCount,
          total_orders: totalOrders,
          total_order_value: totalOrderValue,
          total_invoices: totalInvoices,
          total_invoice_value: totalInvoiceValue,
          total_collection: totalCollection,
          routes: routesData,
        };
      });

      // Calculate summary statistics
      const totalZones = zones.length;
      const totalCustomers = zones.reduce(
        (sum, z) => sum + (z.customer_zones?.length || 0),
        0
      );
      const totalRoutes = zones.reduce(
        (sum, z) => sum + (z.routes_zones?.length || 0),
        0
      );
      const totalOrders = orders.length;
      const totalOrderValue = orders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0
      );
      const totalInvoices = invoices.length;
      const totalInvoiceValue = invoices.reduce(
        (sum, i) => sum + Number(i.total_amount || 0),
        0
      );
      const totalCollection = payments.reduce(
        (sum, p) => sum + Number(p.total_amount || 0),
        0
      );

      const summary = {
        total_zones: totalZones,
        total_customers: totalCustomers,
        total_routes: totalRoutes,
        total_orders: totalOrders,
        total_order_value: totalOrderValue,
        total_invoices: totalInvoices,
        total_invoice_value: totalInvoiceValue,
        total_collection: totalCollection,
      };

      const response = {
        summary,
        data: {
          zones: serializedZones,
        },
      };

      res.json({
        success: true,
        message: 'Region/Territory Sales report generated successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Region/Territory Sales Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report',
      });
    }
  },

  /**
   * Export Region/Territory Sales Report to Excel
   * GET /api/v1/reports/region-territory-sales/export
   */
  async exportRegionTerritorySalesReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, zone_id, depot_id, route_id } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Zones
      const whereZones: any = {
        is_active: 'Y',
        ...(depot_id && { depot_id: parseInt(depot_id as string) }),
        ...(zone_id && { id: parseInt(zone_id as string) }),
      };

      const zones = await prisma.zones.findMany({
        where: whereZones,
        include: {
          zone_depots: {
            select: { id: true, name: true, code: true },
          },
          routes_zones: {
            where: { is_active: 'Y' },
            ...(route_id && { id: parseInt(route_id as string) }),
          },
        },
      });

      // Fetch Orders, Invoices, Payments
      const whereOrders: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && { order_date: dateFilter }),
      };

      const orders = await prisma.orders.findMany({
        where: whereOrders,
        include: {
          orders_customers: {
            select: { id: true, zones_id: true },
          },
        },
      });

      const invoices = await prisma.invoices.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && {
            invoice_date: dateFilter,
          }),
        },
        include: {
          invoices_customers: {
            select: { id: true, zones_id: true },
          },
        },
      });

      const payments = await prisma.payments.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && {
            payment_date: dateFilter,
          }),
        },
        include: {
          payments_customers: {
            select: { id: true, zones_id: true },
          },
        },
      });

      // Import ExcelJS
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      // Create Zone/Territory Summary sheet
      const zonesSheet = workbook.addWorksheet('Territory Sales', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      zonesSheet.columns = [
        { header: 'Territory', key: 'territory', width: 25 },
        { header: 'Code', key: 'code', width: 15 },
        { header: 'Depot', key: 'depot', width: 15 },
        { header: 'Customers', key: 'customers', width: 12 },
        { header: 'Routes', key: 'routes', width: 12 },
        { header: 'Orders', key: 'orders', width: 12 },
        { header: 'Order Value', key: 'order_value', width: 15 },
        { header: 'Invoices', key: 'invoices', width: 12 },
        { header: 'Invoice Value', key: 'invoice_value', width: 15 },
        { header: 'Collection', key: 'collection', width: 15 },
      ];

      zones.forEach((zone: any) => {
        const zoneOrders = orders.filter(
          (o: any) => o.orders_customers?.zones_id === zone.id
        );
        const zoneInvoices = invoices.filter(
          (i: any) => i.invoices_customers?.zones_id === zone.id
        );
        const zonePayments = payments.filter(
          (p: any) => p.payments_customers?.zones_id === zone.id
        );

        zonesSheet.addRow({
          territory: zone.name,
          code: zone.code,
          depot: zone.zone_depots?.name || 'N/A',
          customers: zone.customer_zones?.length || 0,
          routes: zone.routes_zones?.length || 0,
          orders: zoneOrders.length,
          order_value: zoneOrders.reduce(
            (sum: number, o: any) => sum + Number(o.total_amount || 0),
            0
          ),
          invoices: zoneInvoices.length,
          invoice_value: zoneInvoices.reduce(
            (sum: number, i: any) => sum + Number(i.total_amount || 0),
            0
          ),
          collection: zonePayments.reduce(
            (sum: number, p: any) => sum + Number(p.total_amount || 0),
            0
          ),
        });
      });

      // Create Summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const totalZones = zones.length;
      const totalOrders = orders.length;
      const totalOrderValue = orders.reduce(
        (sum: number, o: any) => sum + Number(o.total_amount || 0),
        0
      );
      const totalInvoices = invoices.length;
      const totalInvoiceValue = invoices.reduce(
        (sum: number, i: any) => sum + Number(i.total_amount || 0),
        0
      );
      const totalCollection = payments.reduce(
        (sum: number, p: any) => sum + Number(p.total_amount || 0),
        0
      );

      const summaryData = [
        { metric: 'Total Zones', value: totalZones },
        { metric: 'Total Orders', value: totalOrders },
        { metric: 'Total Order Value', value: totalOrderValue },
        { metric: 'Total Invoices', value: totalInvoices },
        { metric: 'Total Invoice Value', value: totalInvoiceValue },
        { metric: 'Total Collection', value: totalCollection },
      ];

      summaryData.forEach(row => {
        summarySheet.addRow(row);
      });

      // Style header rows
      [zonesSheet, summarySheet].forEach(sheet => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Region_Territory_Sales_Report_${Date.now()}.xlsx`
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Export Region/Territory Sales Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export report',
      });
    }
  },

  /**
   * Get Rep Productivity Report
   * GET /api/v1/reports/rep-productivity
   */
  async getRepProductivityReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, salesperson_id, depot_id, zone_id } =
        req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Users (Sales Reps)
      const whereUsers: any = {
        is_active: 'Y',
      };
      if (salesperson_id) {
        whereUsers.id = parseInt(salesperson_id as string);
      }
      if (depot_id) {
        whereUsers.depot_id = parseInt(depot_id as string);
      }
      if (zone_id) {
        whereUsers.zone_id = parseInt(zone_id as string);
      }

      const users = await prisma.users.findMany({
        where: whereUsers,
        include: {
          user_depot: {
            select: { id: true, name: true, code: true },
          },
          user_zones: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      // Fetch Visits
      const visits = await prisma.visits.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && { visit_date: dateFilter }),
        },
        include: {
          visit_customers: {
            select: { id: true, name: true },
          },
        },
      });

      // Fetch Visit Tasks
      const visitTasks = await prisma.visit_tasks.findMany({
        where: {
          is_active: 'Y',
        },
        include: {
          visit_tasks_visits: {
            select: { visit_date: true, sales_person_id: true },
          },
        },
      });

      // Fetch GPS Logs
      const gpsLogs = await prisma.gps_logs.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && { log_time: dateFilter }),
        },
      });

      // Fetch Orders
      const orders = await prisma.orders.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && { order_date: dateFilter }),
        },
        include: {
          orders_customers: {
            select: { id: true, name: true },
          },
        },
      });

      // Fetch Invoices - linked via orders
      const invoices = await prisma.invoices.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && {
            invoice_date: dateFilter,
          }),
        },
        include: {
          invoices_customers: {
            select: { id: true, name: true },
          },
          orders: {
            select: { salesperson_id: true },
          },
        },
      });

      // Fetch Payments
      const payments = await prisma.payments.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && {
            payment_date: dateFilter,
          }),
        },
      });

      // Fetch Return Requests
      const returns = await prisma.return_requests.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && {
            return_date: dateFilter,
          }),
        },
      });

      // Serialize Rep Productivity data
      const serializedReps = users.map(user => {
        const repVisits = visits.filter(v => v.sales_person_id === user.id);
        const repTasks = visitTasks.filter(
          t => t.visit_tasks_visits?.sales_person_id === user.id
        );
        const completedTasks = repTasks.filter(
          t => t.status === 'completed'
        ).length;
        const repOrders = orders.filter(o => o.salesperson_id === user.id);
        const repInvoices = invoices.filter(
          i => i.orders?.salesperson_id === user.id
        );
        const repPayments = payments.filter(p => p.collected_by === user.id);
        const repReturns = returns.filter(r => r.createdby === user.id);

        const visitDuration = repVisits.reduce(
          (sum, v) => sum + (v.duration || 0),
          0
        );
        const avgVisitDuration =
          repVisits.length > 0 ? visitDuration / repVisits.length : 0;

        const orderValue = repOrders.reduce(
          (sum, o) => sum + Number(o.total_amount || 0),
          0
        );
        const invoiceValue = repInvoices.reduce(
          (sum, i) => sum + Number(i.total_amount || 0),
          0
        );
        const collection = repPayments.reduce(
          (sum, p) => sum + Number(p.total_amount || 0),
          0
        );

        const gpsEntries = gpsLogs.filter(g => g.user_id === user.id).length;
        const daysActive = [
          ...new Set(
            repVisits
              .map(v => v.visit_date?.toISOString().split('T')[0])
              .filter(Boolean)
          ),
        ].length;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          employee_id: user.employee_id || 'N/A',
          depot_name: user.user_depot?.name || 'N/A',
          zone_name: user.user_zones?.name || 'N/A',
          total_visits: repVisits.length,
          completed_tasks: completedTasks,
          pending_tasks: repTasks.length - completedTasks,
          total_orders: repOrders.length,
          order_value: orderValue,
          total_invoices: repInvoices.length,
          invoice_value: invoiceValue,
          total_collection: collection,
          total_returns: repReturns.length,
          gps_tracking_points: gpsEntries,
          days_active: daysActive,
          avg_visit_duration: avgVisitDuration,
          productivity_score: repVisits.length + repOrders.length,
        };
      });

      // Calculate summary statistics
      const totalReps = users.length;
      const totalVisits = visits.length;
      const totalTasks = visitTasks.length;
      const completedTasks = visitTasks.filter(
        t => t.status === 'completed'
      ).length;
      const totalOrders = orders.length;
      const totalOrderValue = orders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0
      );
      const totalCollection = payments.reduce(
        (sum, p) => sum + Number(p.total_amount || 0),
        0
      );

      const summary = {
        total_reps: totalReps,
        total_visits: totalVisits,
        completed_tasks: completedTasks,
        total_orders: totalOrders,
        total_order_value: totalOrderValue,
        total_collection: totalCollection,
      };

      const response = {
        summary,
        data: {
          reps: serializedReps,
        },
      };

      res.json({
        success: true,
        message: 'Rep Productivity report generated successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Rep Productivity Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report',
      });
    }
  },

  /**
   * Export Rep Productivity Report to Excel
   * GET /api/v1/reports/rep-productivity/export
   */
  async exportRepProductivityReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, salesperson_id, depot_id, zone_id } =
        req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      // Fetch Users
      const whereUsers: any = {
        is_active: 'Y',
      };
      if (salesperson_id) {
        whereUsers.id = parseInt(salesperson_id as string);
      }
      if (depot_id) {
        whereUsers.depot_id = parseInt(depot_id as string);
      }

      const users = await prisma.users.findMany({
        where: whereUsers,
        include: {
          user_depot: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      // Fetch Visits, Orders, Invoices, Payments
      const visits = await prisma.visits.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && { visit_date: dateFilter }),
        },
      });

      const orders = await prisma.orders.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && { order_date: dateFilter }),
        },
      });

      const payments = await prisma.payments.findMany({
        where: {
          is_active: 'Y',
          ...(Object.keys(dateFilter).length > 0 && {
            payment_date: dateFilter,
          }),
        },
      });

      // Import ExcelJS
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      // Create Reps sheet
      const repsSheet = workbook.addWorksheet('Rep Productivity', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      repsSheet.columns = [
        { header: 'Rep Name', key: 'name', width: 25 },
        { header: 'Employee ID', key: 'employee_id', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Depot', key: 'depot', width: 15 },
        { header: 'Visits', key: 'visits', width: 12 },
        { header: 'Orders', key: 'orders', width: 12 },
        { header: 'Order Value', key: 'order_value', width: 15 },
        { header: 'Collection', key: 'collection', width: 15 },
        { header: 'Days Active', key: 'days_active', width: 12 },
        { header: 'Productivity Score', key: 'score', width: 15 },
      ];

      users.forEach((user: any) => {
        const repVisits = visits.filter(
          (v: any) => v.sales_person_id === user.id
        );
        const repOrders = orders.filter(
          (o: any) => o.salesperson_id === user.id
        );
        const repPayments = payments.filter(
          (p: any) => p.collected_by === user.id
        );

        const orderValue = repOrders.reduce(
          (sum: number, o: any) => sum + Number(o.total_amount || 0),
          0
        );
        const collection = repPayments.reduce(
          (sum: number, p: any) => sum + Number(p.total_amount || 0),
          0
        );
        const daysActive = [
          ...new Set(
            repVisits
              .map((v: any) => v.visit_date?.toISOString().split('T')[0])
              .filter(Boolean)
          ),
        ].length;

        repsSheet.addRow({
          name: user.name,
          employee_id: user.employee_id || 'N/A',
          email: user.email,
          depot: user.user_depot?.name || 'N/A',
          visits: repVisits.length,
          orders: repOrders.length,
          order_value: orderValue,
          collection: collection,
          days_active: daysActive,
          score: repVisits.length + repOrders.length,
        });
      });

      // Create Summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const totalReps = users.length;
      const totalVisits = visits.length;
      const totalOrders = orders.length;
      const totalOrderValue = orders.reduce(
        (sum: number, o: any) => sum + Number(o.total_amount || 0),
        0
      );
      const totalCollection = payments.reduce(
        (sum: number, p: any) => sum + Number(p.total_amount || 0),
        0
      );

      const summaryData = [
        { metric: 'Total Reps', value: totalReps },
        { metric: 'Total Visits', value: totalVisits },
        { metric: 'Total Orders', value: totalOrders },
        { metric: 'Total Order Value', value: totalOrderValue },
        { metric: 'Total Collection', value: totalCollection },
      ];

      summaryData.forEach(row => {
        summarySheet.addRow(row);
      });

      // Style header rows
      [repsSheet, summarySheet].forEach(sheet => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Rep_Productivity_Report_${Date.now()}.xlsx`
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Export Rep Productivity Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export report',
      });
    }
  },

  /**
   * Get Competitor Analysis Report
   * GET /api/v1/reports/competitor-analysis
   */
  async getCompetitorAnalysisReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, customer_id, brand_name } = req.query;

      const whereFilter: any = {
        is_active: 'Y',
      };

      if (customer_id) {
        whereFilter.customer_id = parseInt(customer_id as string);
      }
      if (brand_name) {
        whereFilter.brand_name = {
          contains: brand_name as string,
        };
      }

      const competitorActivities = await prisma.competitor_activity.findMany({
        where: whereFilter,
        include: {
          competitor_activity_customers: {
            select: { id: true, name: true, address: true },
          },
          visits: {
            select: { visit_date: true, status: true },
            where: {
              ...(start_date &&
                end_date && {
                  visit_date: {
                    gte: new Date(start_date as string),
                    lte: new Date(end_date as string),
                  },
                }),
            },
          },
        },
      });

      const serializedActivities = competitorActivities.map(activity => ({
        id: activity.id,
        brand_name: activity.brand_name,
        product_name: activity.product_name || 'N/A',
        customer_name: activity.competitor_activity_customers?.name || 'N/A',
        customer_address:
          activity.competitor_activity_customers?.address || 'N/A',
        observed_price: activity.observed_price
          ? Number(activity.observed_price)
          : 0,
        promotion_details: activity.promotion_details || 'N/A',
        visibility_score: activity.visibility_score || 0,
        remarks: activity.remarks || 'N/A',
        visit_date: activity.visits?.visit_date || null,
        visit_status: activity.visits?.status || 'N/A',
      }));

      const brandsSummary = Array.from(
        new Set(serializedActivities.map(a => a.brand_name))
      ).map(brand => {
        const brandActivities = serializedActivities.filter(
          a => a.brand_name === brand
        );
        const avgPrice =
          brandActivities.reduce((sum, a) => sum + a.observed_price, 0) /
          brandActivities.length;
        const avgVisibility =
          brandActivities.reduce((sum, a) => sum + a.visibility_score, 0) /
          brandActivities.length;

        return {
          brand_name: brand,
          observation_count: brandActivities.length,
          avg_price: avgPrice,
          avg_visibility: avgVisibility,
        };
      });

      const summary = {
        total_observations: serializedActivities.length,
        unique_brands: brandsSummary.length,
        unique_customers: new Set(
          serializedActivities.map(a => a.customer_name)
        ).size,
        avg_visibility_score:
          serializedActivities.reduce((sum, a) => sum + a.visibility_score, 0) /
            serializedActivities.length || 0,
      };

      const response = {
        summary,
        data: {
          activities: serializedActivities,
          brands_summary: brandsSummary,
        },
      };

      res.json({
        success: true,
        message: 'Competitor Analysis report generated successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Competitor Analysis Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report',
      });
    }
  },

  /**
   * Export Competitor Analysis Report to Excel
   * GET /api/v1/reports/competitor-analysis/export
   */
  async exportCompetitorAnalysisReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, customer_id, brand_name } = req.query;

      const whereFilter: any = {
        is_active: 'Y',
      };

      if (customer_id) {
        whereFilter.customer_id = parseInt(customer_id as string);
      }
      if (brand_name) {
        whereFilter.brand_name = {
          contains: brand_name as string,
        };
      }

      const competitorActivities = await prisma.competitor_activity.findMany({
        where: whereFilter,
        include: {
          competitor_activity_customers: {
            select: { id: true, name: true, address: true },
          },
          visits: {
            select: { visit_date: true, status: true },
            where: {
              ...(start_date &&
                end_date && {
                  visit_date: {
                    gte: new Date(start_date as string),
                    lte: new Date(end_date as string),
                  },
                }),
            },
          },
        },
      });

      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      // Competitor Activities Sheet
      const activitiesSheet = workbook.addWorksheet('Competitor Activities', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      activitiesSheet.columns = [
        { header: 'Brand', key: 'brand', width: 20 },
        { header: 'Product', key: 'product', width: 25 },
        { header: 'Customer', key: 'customer', width: 25 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Promotion', key: 'promotion', width: 30 },
        { header: 'Visibility Score', key: 'visibility', width: 15 },
        { header: 'Remarks', key: 'remarks', width: 35 },
        { header: 'Visit Date', key: 'visit_date', width: 15 },
      ];

      competitorActivities.forEach((activity: any) => {
        activitiesSheet.addRow({
          brand: activity.brand_name,
          product: activity.product_name || 'N/A',
          customer: activity.competitor_activity_customers?.name || 'N/A',
          address: activity.competitor_activity_customers?.address || 'N/A',
          price: activity.observed_price || 0,
          promotion: activity.promotion_details || 'N/A',
          visibility: activity.visibility_score || 0,
          remarks: activity.remarks || 'N/A',
          visit_date: activity.visits?.visit_date || 'N/A',
        });
      });

      // Brands Summary Sheet
      const brandsSheet = workbook.addWorksheet('Brands Summary');
      brandsSheet.columns = [
        { header: 'Brand', key: 'brand', width: 25 },
        { header: 'Observations', key: 'count', width: 15 },
        { header: 'Avg Price', key: 'avg_price', width: 15 },
        { header: 'Avg Visibility', key: 'avg_visibility', width: 15 },
      ];

      const brandsSummary = Array.from(
        new Set(competitorActivities.map((a: any) => a.brand_name))
      ).map(brand => {
        const brandActivities = competitorActivities.filter(
          (a: any) => a.brand_name === brand
        );
        const avgPrice =
          brandActivities.reduce(
            (sum, a) => sum + Number(a.observed_price || 0),
            0
          ) / brandActivities.length;
        const avgVisibility =
          brandActivities.reduce(
            (sum, a) => sum + Number(a.visibility_score || 0),
            0
          ) / brandActivities.length;

        return {
          brand,
          count: brandActivities.length,
          avg_price: avgPrice,
          avg_visibility: avgVisibility,
        };
      });

      brandsSummary.forEach(row => {
        brandsSheet.addRow(row);
      });

      // Summary Sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const summary = [
        { metric: 'Total Observations', value: competitorActivities.length },
        { metric: 'Unique Brands', value: brandsSummary.length },
        {
          metric: 'Unique Customers',
          value: new Set(competitorActivities.map((a: any) => a.customer_id))
            .size,
        },
      ];

      summary.forEach(row => {
        summarySheet.addRow(row);
      });

      // Style header rows
      [activitiesSheet, brandsSheet, summarySheet].forEach(sheet => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Competitor_Analysis_Report_${Date.now()}.xlsx`
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Export Competitor Analysis Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export report',
      });
    }
  },

  /**
   * Get Outstanding & Collection Report
   * GET /api/v1/reports/outstanding-collection
   */
  async getOutstandingCollectionReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, customer_id, invoice_status } = req.query;

      // Fetch Invoices with outstanding amounts
      const whereInvoices: any = {
        is_active: 'Y',
        ...(invoice_status && { status: invoice_status as string }),
      };

      if (start_date || end_date) {
        whereInvoices.invoice_date = {};
        if (start_date) {
          whereInvoices.invoice_date.gte = new Date(start_date as string);
        }
        if (end_date) {
          whereInvoices.invoice_date.lte = new Date(end_date as string);
        }
      }

      const invoices = await prisma.invoices.findMany({
        where: whereInvoices,
        include: {
          invoices_customers: {
            select: {
              id: true,
              name: true,
              code: true,
              phone_number: true,
              outstanding_amount: true,
            },
          },
          orders: {
            select: {
              order_number: true,
              orders_salesperson_users: {
                select: { name: true },
              },
            },
          },
          payment_lines: {
            select: {
              parent_id: true,
              invoice_id: true,
              amount_applied: true,
            },
          },
        },
      });

      // Fetch Payments
      const wherePayments: any = {
        is_active: 'Y',
      };

      if (start_date || end_date) {
        wherePayments.payment_date = {};
        if (start_date) {
          wherePayments.payment_date.gte = new Date(start_date as string);
        }
        if (end_date) {
          wherePayments.payment_date.lte = new Date(end_date as string);
        }
      }

      const payments = await prisma.payments.findMany({
        where: wherePayments,
        include: {
          payments_customers: {
            select: { id: true, name: true, code: true },
          },
          users_payments_collected_byTousers: {
            select: { name: true },
          },
          payment_lines: {
            select: {
              invoice_id: true,
              amount_applied: true,
            },
          },
        },
      });

      // Serialize Outstanding Invoices
      const outstandingInvoices = invoices
        .filter(inv => Number(inv.balance_due) > 0)
        .map(invoice => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          invoice_date: invoice.invoice_date,
          due_date: invoice.due_date,
          customer_name: (invoice as any).invoices_customers?.name || 'N/A',
          customer_code: (invoice as any).invoices_customers?.code || 'N/A',
          salesperson_name:
            (invoice as any).orders?.orders_salesperson_users?.name || 'N/A',
          order_number: (invoice as any).orders?.order_number || 'N/A',
          total_amount: Number(invoice.total_amount || 0),
          amount_paid: Number(invoice.amount_paid || 0),
          balance_due: Number(invoice.balance_due || 0),
          status: invoice.status || 'N/A',
          days_overdue: invoice.due_date
            ? Math.max(
                0,
                Math.floor(
                  (Date.now() - new Date(invoice.due_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              )
            : 0,
        }));

      // Aggregate by Customer
      const customerSummary = Array.from(
        new Set(outstandingInvoices.map(inv => inv.customer_name))
      ).map(customerName => {
        const customerInvoices = outstandingInvoices.filter(
          inv => inv.customer_name === customerName
        );
        const totalOutstanding = customerInvoices.reduce(
          (sum, inv) => sum + inv.balance_due,
          0
        );

        return {
          customer_name: customerName,
          customer_code: customerInvoices[0]?.customer_code || 'N/A',
          invoice_count: customerInvoices.length,
          total_outstanding: totalOutstanding,
          avg_days_overdue:
            customerInvoices.reduce((sum, inv) => sum + inv.days_overdue, 0) /
            customerInvoices.length,
        };
      });

      // Serialize Collections (Payments)
      const collections = payments.map(payment => ({
        id: payment.id,
        payment_number: payment.payment_number,
        payment_date: payment.payment_date,
        customer_name: (payment as any).payments_customers?.name || 'N/A',
        customer_code: (payment as any).payments_customers?.code || 'N/A',
        collected_by:
          (payment as any).users_payments_collected_byTousers?.name || 'N/A',
        amount: Number(payment.total_amount || 0),
        method: payment.method || 'N/A',
        reference_number: payment.reference_number || 'N/A',
      }));

      const summary = {
        total_outstanding_amount: outstandingInvoices.reduce(
          (sum, inv) => sum + inv.balance_due,
          0
        ),
        total_outstanding_invoices: outstandingInvoices.length,
        total_customers_with_outstanding: customerSummary.length,
        total_collections: collections.reduce(
          (sum, col) => sum + col.amount,
          0
        ),
        total_collection_count: collections.length,
        avg_days_overdue:
          outstandingInvoices.reduce((sum, inv) => sum + inv.days_overdue, 0) /
            outstandingInvoices.length || 0,
      };

      const response = {
        summary,
        data: {
          outstanding_invoices: outstandingInvoices,
          customer_summary: customerSummary,
          collections: collections,
        },
      };

      res.json({
        success: true,
        message: 'Outstanding & Collection report generated successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Outstanding & Collection Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report',
      });
    }
  },

  /**
   * Export Outstanding & Collection Report to Excel
   * GET /api/v1/reports/outstanding-collection/export
   */
  async exportOutstandingCollectionReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, customer_id, invoice_status } = req.query;

      const whereInvoices: any = {
        is_active: 'Y',
        ...(invoice_status && { status: invoice_status as string }),
      };

      if (start_date || end_date) {
        whereInvoices.invoice_date = {};
        if (start_date) {
          whereInvoices.invoice_date.gte = new Date(start_date as string);
        }
        if (end_date) {
          whereInvoices.invoice_date.lte = new Date(end_date as string);
        }
      }

      const invoices = await prisma.invoices.findMany({
        where: whereInvoices,
        include: {
          invoices_customers: {
            select: { name: true, code: true, outstanding_amount: true },
          },
          orders: {
            select: {
              order_number: true,
              orders_salesperson_users: { select: { name: true } },
            },
          },
        },
      });

      const wherePayments: any = { is_active: 'Y' };
      if (start_date || end_date) {
        wherePayments.payment_date = {};
        if (start_date) {
          wherePayments.payment_date.gte = new Date(start_date as string);
        }
        if (end_date) {
          wherePayments.payment_date.lte = new Date(end_date as string);
        }
      }

      const payments = await prisma.payments.findMany({
        where: wherePayments,
        include: {
          payments_customers: { select: { name: true, code: true } },
          users_payments_collected_byTousers: { select: { name: true } },
        },
      });

      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      // Outstanding Invoices Sheet
      const outstandingSheet = workbook.addWorksheet('Outstanding Invoices', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      outstandingSheet.columns = [
        { header: 'Invoice#', key: 'invoice', width: 20 },
        { header: 'Customer', key: 'customer', width: 25 },
        { header: 'Salesperson', key: 'salesperson', width: 20 },
        { header: 'Invoice Date', key: 'invoice_date', width: 15 },
        { header: 'Due Date', key: 'due_date', width: 15 },
        { header: 'Total Amount', key: 'total', width: 15 },
        { header: 'Paid', key: 'paid', width: 15 },
        { header: 'Balance Due', key: 'balance', width: 15 },
        { header: 'Days Overdue', key: 'overdue', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
      ];

      const outstandingInvoices = invoices.filter(
        inv => Number(inv.balance_due) > 0
      );

      outstandingInvoices.forEach((invoice: any) => {
        const daysOverdue = invoice.due_date
          ? Math.max(
              0,
              Math.floor(
                (Date.now() - new Date(invoice.due_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 0;

        outstandingSheet.addRow({
          invoice: invoice.invoice_number,
          customer: invoice.invoices_customers?.name || 'N/A',
          salesperson: invoice.orders?.orders_salesperson_users?.name || 'N/A',
          invoice_date: invoice.invoice_date || 'N/A',
          due_date: invoice.due_date || 'N/A',
          total: Number(invoice.total_amount || 0),
          paid: Number(invoice.amount_paid || 0),
          balance: Number(invoice.balance_due || 0),
          overdue: daysOverdue,
          status: invoice.status || 'N/A',
        });
      });

      // Collections Sheet
      const collectionsSheet = workbook.addWorksheet('Collections');
      collectionsSheet.columns = [
        { header: 'Payment#', key: 'payment', width: 20 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Customer', key: 'customer', width: 25 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Method', key: 'method', width: 15 },
        { header: 'Collected By', key: 'collected_by', width: 20 },
        { header: 'Reference', key: 'reference', width: 20 },
      ];

      payments.forEach((payment: any) => {
        collectionsSheet.addRow({
          payment: payment.payment_number,
          date: payment.payment_date || 'N/A',
          customer: payment.payments_customers?.name || 'N/A',
          amount: Number(payment.total_amount || 0),
          method: payment.method || 'N/A',
          collected_by:
            payment.users_payments_collected_byTousers?.name || 'N/A',
          reference: payment.reference_number || 'N/A',
        });
      });

      // Summary Sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const summary = [
        {
          metric: 'Total Outstanding',
          value: outstandingInvoices.reduce(
            (sum, inv) => sum + Number(inv.balance_due || 0),
            0
          ),
        },
        { metric: 'Outstanding Invoices', value: outstandingInvoices.length },
        {
          metric: 'Total Collections',
          value: payments.reduce(
            (sum, p) => sum + Number(p.total_amount || 0),
            0
          ),
        },
        { metric: 'Collection Count', value: payments.length },
      ];

      summary.forEach(row => {
        summarySheet.addRow(row);
      });

      // Style header rows
      [outstandingSheet, collectionsSheet, summarySheet].forEach(sheet => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Outstanding_Collection_Report_${Date.now()}.xlsx`
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Export Outstanding & Collection Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export report',
      });
    }
  },

  /**
   * Get Attendance History Report
   * GET /api/v1/reports/attendance-history
   */
  async getAttendanceHistoryReport(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        start_date,
        end_date,
        user_id,
        action_type,
        search,
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;

      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      const filters: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && {
          createdate: dateFilter,
        }),
        ...(action_type && { action_type: action_type as string }),
      };

      if (user_id) {
        filters.attendance_historys = {
          user_id: parseInt(user_id as string, 10),
          is_active: 'Y',
        };
      }

      if (search && search.toString().trim()) {
        const searchTerm = search.toString().trim();
        filters.OR = [
          { action_type: { contains: searchTerm } },
          { address: { contains: searchTerm } },
        ];
      }

      const { data, pagination } = await paginate({
        model: prisma.attendance_history,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          attendance_historys: {
            include: {
              attendance_user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  employee_id: true,
                  profile_image: true,
                },
              },
            },
          },
        },
      });

      const [totalHistory, punchInCount, punchOutCount, historyThisMonth] =
        await Promise.all([
          prisma.attendance_history.count({
            where: { is_active: 'Y' },
          }),
          prisma.attendance_history.count({
            where: {
              is_active: 'Y',
              action_type: 'punch_in',
            },
          }),
          prisma.attendance_history.count({
            where: {
              is_active: 'Y',
              action_type: 'punch_out',
            },
          }),
          prisma.attendance_history.count({
            where: {
              is_active: 'Y',
              createdate: {
                gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
                lt: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                  1
                ),
              },
            },
          }),
        ]);

      const stats = {
        total_history_records: totalHistory,
        punch_in_count: punchInCount,
        punch_out_count: punchOutCount,
        history_this_month: historyThisMonth,
      };

      const serializedData = data.map((history: any) => ({
        id: history.id,
        attendance_id: history.attendance_id,
        action_type: history.action_type,
        action_time: history.action_time?.toISOString() || null,
        latitude: history.latitude ? Number(history.latitude) : null,
        longitude: history.longitude ? Number(history.longitude) : null,
        address: history.address || null,
        device_info: history.device_info
          ? JSON.parse(history.device_info)
          : null,
        photo_url: history.photo_url || null,
        old_data: history.old_data ? JSON.parse(history.old_data) : null,
        new_data: history.new_data ? JSON.parse(history.new_data) : null,
        ip_address: history.ip_address || null,
        user_agent: history.user_agent || null,
        app_version: history.app_version || null,
        battery_level: history.battery_level
          ? Number(history.battery_level)
          : null,
        network_type: history.network_type || null,
        remarks: history.remarks || null,
        createdate: history.createdate?.toISOString() || null,
        createdby: history.createdby,
        attendance: history.attendance_historys
          ? {
              id: history.attendance_historys.id,
              user_id: history.attendance_historys.user_id,
              attendance_date:
                history.attendance_historys.attendance_date?.toISOString() ||
                null,
              user: history.attendance_historys.attendance_user
                ? {
                    id: history.attendance_historys.attendance_user.id,
                    name: history.attendance_historys.attendance_user.name,
                    email: history.attendance_historys.attendance_user.email,
                    employee_id:
                      history.attendance_historys.attendance_user.employee_id,
                    profile_image:
                      history.attendance_historys.attendance_user.profile_image,
                  }
                : null,
            }
          : null,
      }));

      res.json({
        success: true,
        message: 'Attendance history report generated successfully',
        data: serializedData,
        meta: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Attendance History Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report',
      });
    }
  },

  /**
   * Export Attendance History Report to Excel
   * GET /api/v1/reports/attendance-history/export
   */
  async exportAttendanceHistoryReport(req: Request, res: Response) {
    try {
      const { start_date, end_date, user_id, action_type, search } = req.query;

      const dateFilter: any = {};
      if (start_date) {
        dateFilter.gte = new Date(start_date as string);
      }
      if (end_date) {
        dateFilter.lte = new Date(end_date as string);
      }

      const filters: any = {
        is_active: 'Y',
        ...(Object.keys(dateFilter).length > 0 && {
          createdate: dateFilter,
        }),
        ...(action_type && { action_type: action_type as string }),
      };

      if (user_id) {
        filters.attendance_historys = {
          user_id: parseInt(user_id as string, 10),
          is_active: 'Y',
        };
      }

      if (search && search.toString().trim()) {
        const searchTerm = search.toString().trim();
        filters.OR = [
          { action_type: { contains: searchTerm } },
          { address: { contains: searchTerm } },
          { remarks: { contains: searchTerm } },
        ];
      }

      const historyRecords = await prisma.attendance_history.findMany({
        where: filters,
        include: {
          attendance_historys: {
            include: {
              attendance_user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  employee_id: true,
                  profile_image: true,
                },
              },
            },
          },
        },
        orderBy: { createdate: 'desc' },
      });

      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();

      const historySheet = workbook.addWorksheet('Attendance History', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });
      historySheet.columns = [
        { header: 'Employee Name', key: 'employee_name', width: 25 },
        { header: 'Employee ID', key: 'employee_id', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Action Type', key: 'action_type', width: 15 },
        { header: 'Action Time', key: 'action_time', width: 20 },
        { header: 'Attendance Date', key: 'attendance_date', width: 15 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Remarks', key: 'remarks', width: 40 },
        { header: 'IP Address', key: 'ip_address', width: 18 },
        { header: 'User Agent', key: 'user_agent', width: 30 },
        { header: 'App Version', key: 'app_version', width: 15 },
        { header: 'Battery Level', key: 'battery_level', width: 15 },
        { header: 'Network Type', key: 'network_type', width: 15 },
        { header: 'Created At', key: 'createdate', width: 20 },
      ];

      historyRecords.forEach((history: any) => {
        const user = history.attendance_historys?.attendance_user;
        historySheet.addRow({
          employee_name: user?.name || 'N/A',
          employee_id: user?.employee_id || 'N/A',
          email: user?.email || 'N/A',
          action_type: history.action_type || 'N/A',
          action_time: history.action_time
            ? new Date(history.action_time).toLocaleString()
            : 'N/A',
          attendance_date: history.attendance_historys?.attendance_date
            ? new Date(
                history.attendance_historys.attendance_date
              ).toLocaleDateString()
            : 'N/A',
          address: history.address || 'N/A',
          remarks: history.remarks || 'N/A',
          ip_address: history.ip_address || 'N/A',
          user_agent: history.user_agent || 'N/A',
          app_version: history.app_version || 'N/A',
          battery_level: history.battery_level
            ? Number(history.battery_level)
            : 'N/A',
          network_type: history.network_type || 'N/A',
          createdate: history.createdate
            ? new Date(history.createdate).toLocaleString()
            : 'N/A',
        });
      });

      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const [totalHistory, punchInCount, punchOutCount, historyThisMonth] =
        await Promise.all([
          prisma.attendance_history.count({
            where: { is_active: 'Y' },
          }),
          prisma.attendance_history.count({
            where: {
              is_active: 'Y',
              action_type: 'punch_in',
            },
          }),
          prisma.attendance_history.count({
            where: {
              is_active: 'Y',
              action_type: 'punch_out',
            },
          }),
          prisma.attendance_history.count({
            where: {
              is_active: 'Y',
              createdate: {
                gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
                lt: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                  1
                ),
              },
            },
          }),
        ]);

      const summaryData = [
        { metric: 'Total History Records', value: totalHistory },
        { metric: 'Punch In Count', value: punchInCount },
        { metric: 'Punch Out Count', value: punchOutCount },
        { metric: 'History This Month', value: historyThisMonth },
        { metric: 'Filtered Records', value: historyRecords.length },
      ];

      summaryData.forEach(row => {
        summarySheet.addRow(row);
      });

      [historySheet, summarySheet].forEach(sheet => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
      });

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Attendance_History_Report_${Date.now()}.xlsx`
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Export Attendance History Report Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export report',
      });
    }
  },
};
