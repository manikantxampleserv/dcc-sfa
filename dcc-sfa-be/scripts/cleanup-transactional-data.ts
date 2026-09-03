/**
 * CLEANUP SCRIPT — Wipes transactional data for a fresh start
 *
 * Deletes (in FK-safe dependency order):
 *   1.  stock_movements       — refs van_inventory, products, batch_lots
 *   2.  invoice_items         — child of invoices
 *   3.  refund_lines          — child of payment_refunds, refs invoices
 *   4.  payment_refunds       — child of payments
 *   5.  payment_lines         — refs payments + invoices
 *   6.  payments              — top-level payment record
 *   7.  invoices              — can now be safely deleted
 *   8.  order_items           — child of orders
 *   9.  orders                — top-level order record
 *   10. van_inventory_items   — child of van_inventory
 *   11. van_inventory         — top-level van record
 *   12. inventory_stock       — refs products, batch_lots
 *   13. serial_numbers        — refs batch_lots, products
 *   14. product_batches       — junction: products ↔ batch_lots
 *   15. batch_lots            — refs products
 *   16. products              — master record (last)
 *
 * ⚠️  DANGEROUS: This permanently deletes data. Run only in dev/staging.
 *
 * Usage:
 *   npx ts-node scripts/cleanup-transactional-data.ts
 *   npx ts-node scripts/cleanup-transactional-data.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import prisma from '../src/configs/prisma.client';

const isDryRun = process.argv.includes('--dry-run');

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function del(
  label: string,
  deleteMany: () => Promise<{ count: number }>
): Promise<void> {
  if (isDryRun) {
    log(`[DRY RUN] Would delete all: ${label}`);
    return;
  }
  log(`Deleting: ${label} ...`);
  const result = await deleteMany();
  log(`  ✓ ${result.count} records deleted from ${label}`);
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   TRANSACTIONAL DATA CLEANUP SCRIPT                  ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  if (isDryRun) {
    console.log('⚠️  DRY-RUN MODE — no data will be deleted\n');
  } else {
    console.log('🚨 LIVE MODE — data WILL be permanently deleted!');
    console.log('   Press Ctrl+C within 5 seconds to abort...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Starting cleanup...\n');
  }

  try {
    /** Pre-run counts */
    log('Pre-cleanup record counts:');
    console.table({
      credit_note_items: await prisma.credit_note_items.count(),
      credit_notes: await prisma.credit_notes.count(),
      return_requests: await prisma.return_requests.count(),
      stock_transfer_lines: await prisma.stock_transfer_lines.count(),
      stock_transfer_requests: await prisma.stock_transfer_requests.count(),
      customer_purchase_history: await prisma.customer_purchase_history.count(),
      stock_movements: await prisma.stock_movements.count(),
      invoice_items: await prisma.invoice_items.count(),
      refund_lines: await prisma.refund_lines.count(),
      payment_refunds: await prisma.payment_refunds.count(),
      payment_lines: await prisma.payment_lines.count(),
      payments: await prisma.payments.count(),
      invoices: await prisma.invoices.count(),
      order_items: await prisma.order_items.count(),
      orders: await prisma.orders.count(),
      van_inventory_sub_users: await prisma.van_inventory_sub_users.count(),
      sfa_d_request_approvals: await prisma.sfa_d_request_approvals.count(),
      sfa_d_requests: await prisma.sfa_d_requests.count(),
      survey_answers: await prisma.survey_answers.count(),
      survey_responses: await prisma.survey_responses.count(),
      cooler_inspections: await prisma.cooler_inspections.count(),
      audit_logs: await prisma.audit_logs.count(),
      notifications: await prisma.notifications.count(),
      error_logs: await prisma.error_logs.count(),
      request_logs: await prisma.request_logs.count(),
      promotion_tracking: await prisma.promotion_tracking.count(),
      asset_movement_assets: await prisma.asset_movement_assets.count(),
      asset_movement_contracts: await prisma.asset_movement_contracts.count(),
      asset_movements: await prisma.asset_movements.count(),
      asset_warranty_claims: await prisma.asset_warranty_claims.count(),
      warranty_claims: await prisma.warranty_claims.count(),
      customer_assets_history: await prisma.customer_assets_history.count(),
      customer_assets: await prisma.customer_assets.count(),
      visit_attachments: await prisma.visit_attachments.count(),
      visit_tasks: await prisma.visit_tasks.count(),
      visits: await prisma.visits.count(),
      attendance_history: await prisma.attendance_history.count(),
      attendance: await prisma.attendance.count(),
      gps_logs: await prisma.gps_logs.count(),
      competitor_activity: await prisma.competitor_activity.count(),
      customer_complaints: await prisma.customer_complaints.count(),
      login_history: await prisma.login_history.count(),
      van_inventory_items: await prisma.van_inventory_items.count(),
      van_inventory: await prisma.van_inventory.count(),
      reconciliation_items: await prisma.reconciliation_items.count(),
      reconciliation: await prisma.reconciliation.count(),
      inventory_stock: await prisma.inventory_stock.count(),
      serial_numbers: await prisma.serial_numbers.count(),
      product_batches: await prisma.product_batches.count(),
      batch_lots: await prisma.batch_lots.count(),
    });
    console.log('');

    /** 1. Stock Movements */
    await del('stock_movements', () => prisma.stock_movements.deleteMany({}));

    /** Financial & Transfers */
    await del('credit_note_items', () =>
      prisma.credit_note_items.deleteMany({})
    );
    await del('credit_notes', () => prisma.credit_notes.deleteMany({}));
    await del('return_requests', () => prisma.return_requests.deleteMany({}));
    await del('stock_transfer_lines', () =>
      prisma.stock_transfer_lines.deleteMany({})
    );
    await del('stock_transfer_requests', () =>
      prisma.stock_transfer_requests.deleteMany({})
    );
    await del('customer_purchase_history', () =>
      prisma.customer_purchase_history.deleteMany({})
    );

    /** 2. Invoice Items */
    await del('invoice_items', () => prisma.invoice_items.deleteMany({}));

    /** 3. Refund Lines (child of payment_refunds, refs invoices) */
    await del('refund_lines', () => prisma.refund_lines.deleteMany({}));

    /** 4. Payment Refunds (child of payments) */
    await del('payment_refunds', () => prisma.payment_refunds.deleteMany({}));

    /** 5. Payment Lines (refs payments + invoices) */
    await del('payment_lines', () => prisma.payment_lines.deleteMany({}));

    /** 6. Payments */
    await del('payments', () => prisma.payments.deleteMany({}));

    /** 7. Invoices (now safe — no FK children remain) */
    await del('invoices', () => prisma.invoices.deleteMany({}));

    /** 8. Order Items */
    await del('order_items', () => prisma.order_items.deleteMany({}));

    /** 9. Orders */
    await del('orders', () => prisma.orders.deleteMany({}));

    /** 10. Van Inventory Items & Sub Users & Reconciliations & Requests */
    await del('reconciliation_items', () =>
      prisma.reconciliation_items.deleteMany({})
    );
    await del('reconciliation', () => prisma.reconciliation.deleteMany({}));
    await del('van_inventory_sub_users', () =>
      prisma.van_inventory_sub_users.deleteMany({})
    );
    await del('sfa_d_request_approvals', () =>
      prisma.sfa_d_request_approvals.deleteMany({})
    );
    await del('sfa_d_requests', () => prisma.sfa_d_requests.deleteMany({}));

    /** Surveys */
    await del('survey_answers', () => prisma.survey_answers.deleteMany({}));
    await del('survey_responses', () => prisma.survey_responses.deleteMany({}));

    /** Coolers */
    await del('cooler_inspections', () =>
      prisma.cooler_inspections.deleteMany({})
    );

    /** Logs */
    await del('audit_logs', () => prisma.audit_logs.deleteMany({}));
    await del('notifications', () => prisma.notifications.deleteMany({}));
    await del('error_logs', () => prisma.error_logs.deleteMany({}));
    await del('request_logs', () => prisma.request_logs.deleteMany({}));
    await del('promotion_tracking', () =>
      prisma.promotion_tracking.deleteMany({})
    );

    /** Assets & Warranties */
    await del('asset_movement_assets', () =>
      prisma.asset_movement_assets.deleteMany({})
    );
    await del('asset_movement_contracts', () =>
      prisma.asset_movement_contracts.deleteMany({})
    );
    await del('asset_movements', () => prisma.asset_movements.deleteMany({}));
    await del('asset_warranty_claims', () =>
      prisma.asset_warranty_claims.deleteMany({})
    );
    await del('warranty_claims', () => prisma.warranty_claims.deleteMany({}));
    await del('customer_assets_history', () =>
      prisma.customer_assets_history.deleteMany({})
    );
    await del('customer_assets', () => prisma.customer_assets.deleteMany({}));

    /** Field Activities */
    await del('visit_attachments', () =>
      prisma.visit_attachments.deleteMany({})
    );
    await del('visit_tasks', () => prisma.visit_tasks.deleteMany({}));
    await del('visits', () => prisma.visits.deleteMany({}));
    await del('attendance_history', () =>
      prisma.attendance_history.deleteMany({})
    );
    await del('attendance', () => prisma.attendance.deleteMany({}));
    await del('gps_logs', () => prisma.gps_logs.deleteMany({}));
    await del('competitor_activity', () =>
      prisma.competitor_activity.deleteMany({})
    );
    await del('customer_complaints', () =>
      prisma.customer_complaints.deleteMany({})
    );
    await del('login_history', () => prisma.login_history.deleteMany({}));

    await del('van_inventory_items', () =>
      prisma.van_inventory_items.deleteMany({})
    );

    /** 11. Van Inventory */
    await del('van_inventory', () => prisma.van_inventory.deleteMany({}));

    /** 12. Inventory Stock */
    await del('inventory_stock', () => prisma.inventory_stock.deleteMany({}));

    /** 13. Serial Numbers (refs batch_lots, products) */
    await del('serial_numbers', () => prisma.serial_numbers.deleteMany({}));

    /** 14. Product Batches junction (products ↔ batch_lots) */
    await del('product_batches', () => prisma.product_batches.deleteMany({}));

    /** 15. Batch Lots */
    await del('batch_lots', () => prisma.batch_lots.deleteMany({}));

    /** 16. Products (master — deleted last) */
    /** Skipping product deletion as requested */
    // await del('products', () => prisma.products.deleteMany({}));

    console.log('');
    if (isDryRun) {
      log('✅ Dry run complete — no data was modified.');
    } else {
      log('✅ Cleanup complete — all transactional data has been deleted.');

      /** Post-run verification */
      console.log('');
      log('Post-cleanup verification (should all be 0):');
      console.table({
        credit_note_items: await prisma.credit_note_items.count(),
        credit_notes: await prisma.credit_notes.count(),
        return_requests: await prisma.return_requests.count(),
        stock_transfer_lines: await prisma.stock_transfer_lines.count(),
        stock_transfer_requests: await prisma.stock_transfer_requests.count(),
        customer_purchase_history:
          await prisma.customer_purchase_history.count(),
        stock_movements: await prisma.stock_movements.count(),
        invoice_items: await prisma.invoice_items.count(),
        refund_lines: await prisma.refund_lines.count(),
        payment_refunds: await prisma.payment_refunds.count(),
        payment_lines: await prisma.payment_lines.count(),
        payments: await prisma.payments.count(),
        invoices: await prisma.invoices.count(),
        order_items: await prisma.order_items.count(),
        orders: await prisma.orders.count(),
        sfa_d_request_approvals: await prisma.sfa_d_request_approvals.count(),
        sfa_d_requests: await prisma.sfa_d_requests.count(),
        survey_answers: await prisma.survey_answers.count(),
        survey_responses: await prisma.survey_responses.count(),
        cooler_inspections: await prisma.cooler_inspections.count(),
        coolers: await prisma.coolers.count(),
        audit_logs: await prisma.audit_logs.count(),
        notifications: await prisma.notifications.count(),
        error_logs: await prisma.error_logs.count(),
        request_logs: await prisma.request_logs.count(),
        promotion_tracking: await prisma.promotion_tracking.count(),
        asset_movement_assets: await prisma.asset_movement_assets.count(),
        asset_movement_contracts: await prisma.asset_movement_contracts.count(),
        asset_movements: await prisma.asset_movements.count(),
        asset_warranty_claims: await prisma.asset_warranty_claims.count(),
        warranty_claims: await prisma.warranty_claims.count(),
        customer_assets_history: await prisma.customer_assets_history.count(),
        customer_assets: await prisma.customer_assets.count(),
        visit_attachments: await prisma.visit_attachments.count(),
        visit_tasks: await prisma.visit_tasks.count(),
        visits: await prisma.visits.count(),
        attendance_history: await prisma.attendance_history.count(),
        attendance: await prisma.attendance.count(),
        gps_logs: await prisma.gps_logs.count(),
        competitor_activity: await prisma.competitor_activity.count(),
        customer_complaints: await prisma.customer_complaints.count(),
        login_history: await prisma.login_history.count(),
        van_inventory_items: await prisma.van_inventory_items.count(),
        van_inventory: await prisma.van_inventory.count(),
        inventory_stock: await prisma.inventory_stock.count(),
        serial_numbers: await prisma.serial_numbers.count(),
        product_batches: await prisma.product_batches.count(),
        batch_lots: await prisma.batch_lots.count(),
        /** Not deleting products */
        // products:           await prisma.products.count(),
      });
    }
  } catch (error: any) {
    console.error('\n❌ Cleanup failed:', error.message);
    if (error.code) console.error('   Prisma error code:', error.code);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
