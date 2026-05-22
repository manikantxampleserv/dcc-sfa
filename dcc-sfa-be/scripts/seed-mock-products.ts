/**
 * PRODUCT MOCK SEEDER
 *
 * Creates a realistic set of products covering all tracking types:
 *   - BATCH  → with batch_lots + product_batches
 *   - SERIAL → with serial_numbers
 *   - none   → simple quantity products
 *
 * Usage:
 *   npx ts-node scripts/seed-mock-products.ts
 *   npx ts-node scripts/seed-mock-products.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import prisma from '../src/configs/prisma.client';

const isDryRun = process.argv.includes('--dry-run');
function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock product definitions
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  // ── BATCH-tracked ──────────────────────────────────────────────────────────
  {
    name: 'Coca-Cola 330ml',
    code: 'CCL001',
    tracking_type: 'BATCH',
    batches: 3,
    qty: 500,
  },
  {
    name: 'Pepsi 500ml',
    code: 'PPS001',
    tracking_type: 'BATCH',
    batches: 2,
    qty: 300,
  },
  {
    name: 'Sprite 250ml',
    code: 'SPR001',
    tracking_type: 'BATCH',
    batches: 2,
    qty: 250,
  },
  {
    name: 'Fanta Orange 330ml',
    code: 'FNT001',
    tracking_type: 'BATCH',
    batches: 2,
    qty: 400,
  },
  {
    name: 'Red Bull Energy',
    code: 'RBL001',
    tracking_type: 'BATCH',
    batches: 1,
    qty: 150,
  },
  {
    name: 'Mineral Water 1L',
    code: 'MNW001',
    tracking_type: 'BATCH',
    batches: 3,
    qty: 600,
  },
  {
    name: 'Orange Juice 1L',
    code: 'OJC001',
    tracking_type: 'BATCH',
    batches: 2,
    qty: 200,
  },
  {
    name: 'Milk Full Fat 1L',
    code: 'MLK001',
    tracking_type: 'BATCH',
    batches: 2,
    qty: 180,
  },
  {
    name: 'Chocolate Bar 100g',
    code: 'CHC001',
    tracking_type: 'BATCH',
    batches: 2,
    qty: 350,
  },
  {
    name: 'Potato Chips 50g',
    code: 'PTC001',
    tracking_type: 'BATCH',
    batches: 2,
    qty: 500,
  },

  // ── SERIAL-tracked ─────────────────────────────────────────────────────────
  {
    name: 'Samsung Galaxy A54',
    code: 'SGA001',
    tracking_type: 'SERIAL',
    serials: 5,
  },
  {
    name: 'iPhone 15 Case',
    code: 'IPH001',
    tracking_type: 'SERIAL',
    serials: 8,
  },
  {
    name: 'Wireless Earbuds',
    code: 'WEB001',
    tracking_type: 'SERIAL',
    serials: 6,
  },
  {
    name: 'USB-C Charger 65W',
    code: 'UCC001',
    tracking_type: 'SERIAL',
    serials: 4,
  },
  {
    name: 'Power Bank 20000mAh',
    code: 'PWB001',
    tracking_type: 'SERIAL',
    serials: 5,
  },

  // ── None-tracked ───────────────────────────────────────────────────────────
  { name: 'Paper Bag Large', code: 'PBG001', tracking_type: 'none' },
  { name: 'Plastic Straw Box', code: 'PST001', tracking_type: 'none' },
  { name: 'Tissue Box 200pcs', code: 'TSB001', tracking_type: 'none' },
  { name: 'Disposable Cup 250ml', code: 'DSC001', tracking_type: 'none' },
  { name: 'Aluminium Foil 30m', code: 'ALF001', tracking_type: 'none' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function batchNumber(prefix: string, idx: number): string {
  return `${prefix}-BATCH-${String(idx).padStart(3, '0')}-${Date.now()}`;
}

function serialNumber(prefix: string, idx: number): string {
  return `SN-${prefix}-${String(idx).padStart(4, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   PRODUCT MOCK SEEDER                                ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  if (isDryRun) console.log('⚠️  DRY-RUN MODE — no data will be written\n');

  log('Fetching reference data...');

  const [brand, category, subCategory, unit, taxMaster] = await Promise.all([
    prisma.brands.findFirst({
      where: { is_active: 'Y' },
      select: { id: true, name: true },
    }),
    prisma.product_categories.findFirst({
      select: { id: true, category_name: true },
    }),
    prisma.product_sub_categories.findFirst({
      select: { id: true, sub_category_name: true },
    }),
    prisma.unit_of_measurement.findFirst({ select: { id: true, name: true } }),
    prisma.tax_master.findFirst({
      where: { is_active: 'Y' },
      select: { id: true, name: true },
    }),
  ]);

  if (!brand || !category || !subCategory || !unit) {
    console.error('\n❌ Missing required reference data:');
    console.error(
      `   brand:       ${brand ? '✓ ' + brand.name : '✗ NOT FOUND'}`
    );
    console.error(
      `   category:    ${category ? '✓ ' + category.category_name : '✗ NOT FOUND'}`
    );
    console.error(
      `   subCategory: ${subCategory ? '✓ ' + subCategory.sub_category_name : '✗ NOT FOUND'}`
    );
    console.error(`   unit:        ${unit ? '✓ ' + unit.name : '✗ NOT FOUND'}`);
    console.error(
      '\nPlease ensure at least one brand, category, sub-category, and unit exists.'
    );
    process.exit(1);
  }

  log(`  brand:       ${brand.name} (ID: ${brand.id})`);
  log(`  category:    ${category.category_name} (ID: ${category.id})`);
  log(
    `  subCategory: ${subCategory.sub_category_name} (ID: ${subCategory.id})`
  );
  log(`  unit:        ${unit.name} (ID: ${unit.id})`);
  log(
    `  taxMaster:   ${taxMaster ? taxMaster.name + ' (ID: ' + taxMaster.id + ')' : 'none'}`
  );
  console.log('');

  if (isDryRun) {
    log(`Would create ${MOCK_PRODUCTS.length} products.`);
    MOCK_PRODUCTS.forEach(p =>
      log(
        `  - [${p.tracking_type.toUpperCase().padEnd(6)}] ${p.name} (${p.code})`
      )
    );
    process.exit(0);
  }

  const now = new Date();
  const userId = 1;
  const results = {
    products: 0,
    batch_lots: 0,
    product_batches: 0,
    serial_numbers: 0,
  };

  // ── Create products ─────────────────────────────────────────────────────────
  for (const mock of MOCK_PRODUCTS) {
    log(
      `Creating: [${mock.tracking_type.toUpperCase().padEnd(6)}] ${mock.name} ...`
    );

    // Create the product
    const product = await prisma.products.create({
      data: {
        name: mock.name,
        code: mock.code,
        description: `Mock ${mock.name} for testing`,
        category_id: category.id,
        sub_category_id: subCategory.id,
        brand_id: brand.id,
        unit_of_measurement: unit.id,
        base_price: randomBetween(5, 500),
        tax_id: taxMaster?.id || null,
        tracking_type: mock.tracking_type,
        is_active: 'Y',
        createdate: now,
        createdby: userId,
        log_inst: 1,
      },
    });
    results.products++;

    const prefix = mock.code;

    // ── BATCH: create batch_lots + product_batches ───────────────────────────
    if (mock.tracking_type === 'BATCH' && (mock as any).batches) {
      const batchCount: number = (mock as any).batches;
      const qtyPerBatch = Math.floor(((mock as any).qty || 100) / batchCount);
      const mfgBase = addDays(now, -60);

      for (let i = 1; i <= batchCount; i++) {
        const isExpiring = i === batchCount; // last batch expiring soon
        const expiryDate = isExpiring
          ? addDays(now, randomBetween(5, 25)) // expiring soon
          : addDays(now, randomBetween(90, 365)); // normal

        const batchLot = await prisma.batch_lots.create({
          data: {
            batch_number: batchNumber(prefix, i),
            lot_number: `LOT-${prefix}-${i}`,
            manufacturing_date: addDays(mfgBase, i * 10),
            expiry_date: expiryDate,
            quantity: qtyPerBatch,
            remaining_quantity: qtyPerBatch,
            supplier_name: `Supplier ${String.fromCharCode(64 + i)}`,
            purchase_price: randomBetween(3, 200),
            quality_grade: i === 1 ? 'A+' : 'A',
            storage_location: `Warehouse-${i}`,
            is_active: 'Y',
            createdate: now,
            createdby: userId,
            log_inst: 1,
          },
        });
        results.batch_lots++;

        await prisma.product_batches.create({
          data: {
            product_id: product.id,
            batch_lot_id: batchLot.id,
            quantity: qtyPerBatch,
            is_active: 'Y',
            createdate: now,
            createdby: userId,
            log_inst: 1,
          },
        });
        results.product_batches++;
      }
      log(`  ✓ ${product.name}: ${batchCount} batches created`);
    }

    // ── SERIAL: create serial_numbers ────────────────────────────────────────
    if (mock.tracking_type === 'SERIAL' && (mock as any).serials) {
      const serialCount: number = (mock as any).serials;

      for (let i = 1; i <= serialCount; i++) {
        await prisma.serial_numbers.create({
          data: {
            serial_number: serialNumber(prefix, i),
            product_id: product.id,
            status: 'available',
            warranty_expiry: addDays(now, 365),
            is_active: 'Y',
            createdate: now,
            createdby: userId,
            log_inst: 1,
          },
        });
        results.serial_numbers++;
      }
      log(`  ✓ ${product.name}: ${serialCount} serial numbers created`);
    }

    if (mock.tracking_type === 'none') {
      log(`  ✓ ${product.name}: simple product (no tracking)`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('');
  log('✅ Mock data seeded successfully!');
  console.table(results);

  await prisma.$disconnect();
}

main().catch(async err => {
  console.error('\n❌ Seeder failed:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
