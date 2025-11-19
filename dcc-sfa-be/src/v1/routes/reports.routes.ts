import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/v1/reports/orders-invoices-returns
 * @description Get Orders, Invoices, and Returns Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, customer_id, status
 */
router.get(
  '/orders-invoices-returns',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getOrdersInvoicesReturnsReport
);

/**
 * @route GET /api/v1/reports/orders-invoices-returns/export
 * @description Export Orders, Invoices, and Returns Report to Excel
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, customer_id, status
 */
router.get(
  '/orders-invoices-returns/export',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.exportOrdersInvoicesReturnsReport
);

/**
 * @route GET /api/v1/reports/sales-vs-target
 * @description Get Sales vs Target Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, salesperson_id, product_category_id, sales_target_group_id
 */
router.get(
  '/sales-vs-target',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getSalesVsTargetReport
);

/**
 * @route GET /api/v1/reports/sales-vs-target/export
 * @description Export Sales vs Target Report to Excel
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, salesperson_id, product_category_id, sales_target_group_id
 */
router.get(
  '/sales-vs-target/export',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.exportSalesVsTargetReport
);

/**
 * @route GET /api/v1/reports/asset-movement-status
 * @description Get Asset Movement/Status Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, asset_type_id, asset_status, customer_id
 */
router.get(
  '/asset-movement-status',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getAssetMovementStatusReport
);

/**
 * @route GET /api/v1/reports/asset-movement-status/export
 * @description Export Asset Movement/Status Report to Excel
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, asset_type_id, asset_status, customer_id
 */
router.get(
  '/asset-movement-status/export',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.exportAssetMovementStatusReport
);

/**
 * @route GET /api/v1/reports/visit-frequency-completion
 * @description Get Visit Frequency/Completion Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, salesperson_id, customer_id, status
 */
router.get(
  '/visit-frequency-completion',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getVisitFrequencyCompletionReport
);

/**
 * @route GET /api/v1/reports/visit-frequency-completion/export
 * @description Export Visit Frequency/Completion Report to Excel
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, salesperson_id, customer_id, status
 */
router.get(
  '/visit-frequency-completion/export',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.exportVisitFrequencyCompletionReport
);

/**
 * @route GET /api/v1/reports/promo-effectiveness
 * @description Get Promo Effectiveness Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, promotion_id, depot_id, zone_id
 */
router.get(
  '/promo-effectiveness',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getPromoEffectivenessReport
);

/**
 * @route GET /api/v1/reports/promo-effectiveness/export
 * @description Export Promo Effectiveness Report to Excel
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, promotion_id, depot_id, zone_id
 */
router.get(
  '/promo-effectiveness/export',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.exportPromoEffectivenessReport
);

/**
 * @route GET /api/v1/reports/region-territory-sales
 * @description Get Region/Territory Sales Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, zone_id, depot_id, route_id
 */
router.get(
  '/region-territory-sales',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getRegionTerritorySalesReport
);

/**
 * @route GET /api/v1/reports/region-territory-sales/export
 * @description Export Region/Territory Sales Report to Excel
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, zone_id, depot_id, route_id
 */
router.get(
  '/region-territory-sales/export',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.exportRegionTerritorySalesReport
);

/**
 * @route GET /api/v1/reports/rep-productivity
 * @description Get Rep Productivity Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, salesperson_id, depot_id, zone_id
 */
router.get(
  '/rep-productivity',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getRepProductivityReport
);

/**
 * @route GET /api/v1/reports/rep-productivity/export
 * @description Export Rep Productivity Report to Excel
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, salesperson_id, depot_id, zone_id
 */
router.get(
  '/rep-productivity/export',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.exportRepProductivityReport
);

/**
 * @route GET /api/v1/reports/competitor-analysis
 * @description Get Competitor Analysis Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, customer_id, brand_name
 */
router.get(
  '/competitor-analysis',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getCompetitorAnalysisReport
);

/**
 * @route GET /api/v1/reports/competitor-analysis/export
 * @description Export Competitor Analysis Report to Excel
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, customer_id, brand_name
 */
router.get(
  '/competitor-analysis/export',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.exportCompetitorAnalysisReport
);

/**
 * @route GET /api/v1/reports/outstanding-collection
 * @description Get Outstanding & Collection Report
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, customer_id, invoice_status
 */
router.get(
  '/outstanding-collection',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getOutstandingCollectionReport
);

/**
 * @route GET /api/v1/reports/outstanding-collection/export
 * @description Export Outstanding & Collection Report to Excel
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, customer_id, invoice_status
 */
router.get(
  '/outstanding-collection/export',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.exportOutstandingCollectionReport
);

/**
 * @route GET /api/v1/reports/attendance-history
 * @description Get Attendance History Report with pagination
 * @access Private (requires authentication)
 * @params Query: page, limit, start_date, end_date, user_id, action_type, search
 */
router.get(
  '/attendance-history',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getAttendanceHistoryReport
);

/**
 * @route GET /api/v1/reports/attendance-history/export
 * @description Export Attendance History Report to Excel
 * @access Private (requires authentication)
 * @params Query: start_date, end_date, user_id, action_type, search
 */
router.get(
  '/attendance-history/export',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.exportAttendanceHistoryReport
);

export default router;
