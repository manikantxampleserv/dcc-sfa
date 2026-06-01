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
    // ── Pre-run counts ─────────────────────────────────────────────────────
    log('Pre-cleanup record counts:');
    console.table({
      stock_movements: await prisma.stock_movements.count(),
      invoice_items: await prisma.invoice_items.count(),
      refund_lines: await prisma.refund_lines.count(),
      payment_refunds: await prisma.payment_refunds.count(),
      payment_lines: await prisma.payment_lines.count(),
      payments: await prisma.payments.count(),
      invoices: await prisma.invoices.count(),
      order_items: await prisma.order_items.count(),
      orders: await prisma.orders.count(),
      van_inventory_items: await prisma.van_inventory_items.count(),
      van_inventory: await prisma.van_inventory.count(),
      inventory_stock: await prisma.inventory_stock.count(),
      serial_numbers: await prisma.serial_numbers.count(),
      product_batches: await prisma.product_batches.count(),
      batch_lots: await prisma.batch_lots.count(),
      products: await prisma.products.count(),
    });
    console.log('');

    // ── 1. Stock Movements ─────────────────────────────────────────────────
    await del('stock_movements', () => prisma.stock_movements.deleteMany({}));

    // ── 2. Invoice Items ───────────────────────────────────────────────────
    await del('invoice_items', () => prisma.invoice_items.deleteMany({}));

    // ── 3. Refund Lines (child of payment_refunds, refs invoices) ──────────
    await del('refund_lines', () => prisma.refund_lines.deleteMany({}));

    // ── 4. Payment Refunds (child of payments) ─────────────────────────────
    await del('payment_refunds', () => prisma.payment_refunds.deleteMany({}));

    // ── 5. Payment Lines (refs payments + invoices) ────────────────────────
    await del('payment_lines', () => prisma.payment_lines.deleteMany({}));

    // ── 6. Payments ────────────────────────────────────────────────────────
    await del('payments', () => prisma.payments.deleteMany({}));

    // ── 7. Invoices (now safe — no FK children remain) ─────────────────────
    await del('invoices', () => prisma.invoices.deleteMany({}));

    // ── 8. Order Items ─────────────────────────────────────────────────────
    await del('order_items', () => prisma.order_items.deleteMany({}));

    // ── 9. Orders ──────────────────────────────────────────────────────────
    await del('orders', () => prisma.orders.deleteMany({}));

    // ── 10. Van Inventory Items ────────────────────────────────────────────
    await del('van_inventory_items', () =>
      prisma.van_inventory_items.deleteMany({})
    );

    // ── 11. Van Inventory ──────────────────────────────────────────────────
    await del('van_inventory', () => prisma.van_inventory.deleteMany({}));

    // ── 12. Inventory Stock ────────────────────────────────────────────────
    await del('inventory_stock', () => prisma.inventory_stock.deleteMany({}));

    // ── 13. Serial Numbers (refs batch_lots, products) ─────────────────────
    await del('serial_numbers', () => prisma.serial_numbers.deleteMany({}));

    // ── 14. Product Batches junction (products ↔ batch_lots) ───────────────
    await del('product_batches', () => prisma.product_batches.deleteMany({}));

    // ── 15. Batch Lots ─────────────────────────────────────────────────────
    await del('batch_lots', () => prisma.batch_lots.deleteMany({}));

    // ── 16. Products (master — deleted last) ───────────────────────────────
    // Skipping product deletion as requested
    // await del('products', () => prisma.products.deleteMany({}));

    console.log('');
    if (isDryRun) {
      log('✅ Dry run complete — no data was modified.');
    } else {
      log('✅ Cleanup complete — all transactional data has been deleted.');

      // Post-run verification
      console.log('');
      log('Post-cleanup verification (should all be 0):');
      console.table({
        stock_movements: await prisma.stock_movements.count(),
        invoice_items: await prisma.invoice_items.count(),
        refund_lines: await prisma.refund_lines.count(),
        payment_refunds: await prisma.payment_refunds.count(),
        payment_lines: await prisma.payment_lines.count(),
        payments: await prisma.payments.count(),
        invoices: await prisma.invoices.count(),
        order_items: await prisma.order_items.count(),
        orders: await prisma.orders.count(),
        van_inventory_items: await prisma.van_inventory_items.count(),
        van_inventory: await prisma.van_inventory.count(),
        inventory_stock: await prisma.inventory_stock.count(),
        serial_numbers: await prisma.serial_numbers.count(),
        product_batches: await prisma.product_batches.count(),
        batch_lots: await prisma.batch_lots.count(),
        // products:           await prisma.products.count(), // Not deleting products
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
