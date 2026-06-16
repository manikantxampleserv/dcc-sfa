/**
 * Inventory & Batches Data Cleanup
 *
 * Deletes (in FK-safe dependency order):
 *   1.  stock_movements
 *   2.  van_inventory_items
 *   3.  inventory_stock
 *   4.  serial_numbers
 *   5.  product_batches
 *   6.  batch_lots
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
  console.log('║           Inventory & Batches Data Clean             ║');
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
      van_inventory_items: await prisma.van_inventory_items.count(),
      van_inventory: await prisma.van_inventory.count(),
      inventory_stock: await prisma.inventory_stock.count(),
      serial_numbers: await prisma.serial_numbers.count(),
      product_batches: await prisma.product_batches.count(),
      batch_lots: await prisma.batch_lots.count(),
    });
    console.log('');

    // ── 1. Stock Movements ─────────────────────────────────────────────────
    await del('stock_movements', () => prisma.stock_movements.deleteMany({}));

    // ── 2. Van Inventory Items ────────────────────────────────────────────
    await del('van_inventory_items', () =>
      prisma.van_inventory_items.deleteMany({})
    );

    // ── 3. Van Inventory ───────────────────────────────────────────────────
    await del('van_inventory', () => prisma.van_inventory.deleteMany({}));

    // ── 4. Inventory Stock ────────────────────────────────────────────────
    await del('inventory_stock', () => prisma.inventory_stock.deleteMany({}));

    // ── 5. Serial Numbers ──────────────────────────────────────────────────
    await del('serial_numbers', () => prisma.serial_numbers.deleteMany({}));

    // ── 6. Product Batches ─────────────────────────────────────────────────
    await del('product_batches', () => prisma.product_batches.deleteMany({}));

    // ── 7. Batch Lots ──────────────────────────────────────────────────────
    await del('batch_lots', () => prisma.batch_lots.deleteMany({}));

    console.log('');
    if (isDryRun) {
      log('✅ Dry run complete — no data was modified.');
    } else {
      log(
        '✅ Cleanup complete — all specified inventory data has been deleted.'
      );

      // Post-run verification
      console.log('');
      log('Post-cleanup verification (should all be 0):');
      console.table({
        stock_movements: await prisma.stock_movements.count(),
        van_inventory_items: await prisma.van_inventory_items.count(),
        van_inventory: await prisma.van_inventory.count(),
        inventory_stock: await prisma.inventory_stock.count(),
        serial_numbers: await prisma.serial_numbers.count(),
        product_batches: await prisma.product_batches.count(),
        batch_lots: await prisma.batch_lots.count(),
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
