import * as XLSX from 'xlsx';
import prisma from '../configs/prisma.client';
import logger from '../configs/logger';
import bcrypt from 'bcrypt';

async function main() {
  logger.info('Starting ROP Reconciliation seeding...');

  // 1. Load Excel file
  const filePath = '../ROP Window in SFA Application.xlsx';
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['T_ROP'];
  if (!sheet) {
    throw new Error('Sheet T_ROP not found in Excel file');
  }

  // Parse worksheet rows
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Row 12 contains the column headers (0-indexed is row index 11)
  const headerRowIndex = 11;
  const headers = rows[headerRowIndex] as string[];

  if (!headers || !headers.includes('ROP ID')) {
    throw new Error('Could not find column headers in row 11 of sheet T_ROP');
  }

  // Parse rows into objects
  const rawRecords: any[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const record: any = {};
    headers.forEach((h, colIndex) => {
      record[h] = row[colIndex] !== undefined ? row[colIndex] : null;
    });

    if (record['ROP ID'] && record['ROP ID'] !== 'SUMMARY') {
      rawRecords.push(record);
    }
  }

  logger.info(`Parsed ${rawRecords.length} records from Excel sheet.`);

  // 2. Fetch existing users, depots, and products
  const dbUsers = await prisma.users.findMany();
  const dbDepots = await prisma.depots.findMany();
  const dbProducts = await prisma.products.findMany();

  // Find Sales Person role
  const salesPersonRole = await prisma.roles.findFirst({
    where: { name: { contains: 'Sales' } },
  });
  if (!salesPersonRole) {
    throw new Error(
      'Role "Sales Person" or containing "Sales" not found in database'
    );
  }

  // Find or create salesman James
  let james = dbUsers.find(u => u.employee_id === 'MOS100801');
  if (!james) {
    logger.info('Creating salesperson James (MOS100801)...');
    const passwordHash = await bcrypt.hash('James@123', 10);
    james = await prisma.users.create({
      data: {
        name: 'James',
        email: 'james.mos@bbl.co.tz',
        employee_id: 'MOS100801',
        password_hash: passwordHash,
        role_id: salesPersonRole.id,
        createdby: 1,
        is_active: 'Y',
        createdate: new Date(),
      },
    });
    dbUsers.push(james);
  }

  // Build lookup maps
  const userMapByName = new Map<string, number>();
  dbUsers.forEach(u => {
    userMapByName.set(u.name.trim().toLowerCase(), u.id);
  });

  const depotMapByCode = new Map<string, number>();
  dbDepots.forEach(d => {
    depotMapByCode.set(d.code.trim().toUpperCase(), d.id);
  });

  const productMapByCode = new Map<string, number>();
  dbProducts.forEach(p => {
    productMapByCode.set(p.code.trim().toUpperCase(), p.id);
  });

  // 3. Clear existing reconciliation data
  logger.info('Clearing old reconciliation items and headers...');
  await prisma.reconciliation_items.deleteMany({});
  await prisma.reconciliation.deleteMany({});

  const reconciliationDate = new Date('2026-06-22');

  const groupedRecords = new Map<string, any[]>();
  rawRecords.forEach(r => {
    const key = r['Salesman SAP Code'];
    if (!groupedRecords.has(key)) {
      groupedRecords.set(key, []);
    }
    groupedRecords.get(key)!.push(r);
  });

  logger.info(
    `Grouping seeded data into ${groupedRecords.size} reconciliation headers...`
  );

  let headersCreated = 0;
  let itemsCreated = 0;

  for (const [sapCode, records] of groupedRecords.entries()) {
    const firstRec = records[0];
    const salesmanName = firstRec['Salesman Name'];
    const depotCode = firstRec['Depot'];

    let salesmanId: number | null = null;
    let depotId: number | null = null;

    // Resolve salesman ID
    if (
      sapCode === 'MOS100801' ||
      !salesmanName ||
      salesmanName === 'UNMAPPED'
    ) {
      salesmanId = james.id;
    } else {
      salesmanId =
        userMapByName.get(salesmanName.toString().trim().toLowerCase()) || null;
    }

    if (!salesmanId) {
      logger.warn(
        `Could not resolve salesman name: ${salesmanName} for SAP code: ${sapCode}. Skipping.`
      );
      continue;
    }

    if (depotCode && depotCode !== 'UNMAPPED') {
      depotId = depotMapByCode.get(depotCode.trim().toUpperCase()) || null;
    }

    const reconciliationStatus =
      sapCode === 'MOS100801'
        ? 'Blocked - Force-Push Required'
        : 'Pending Verification';

    const recon = await prisma.reconciliation.create({
      data: {
        salesman_id: salesmanId,
        depot_id: depotId,
        status: reconciliationStatus,
        reconciliation_date: reconciliationDate,
        is_active: 'Y',
        createdate: new Date(),
        createdby: 1,
      },
    });

    headersCreated++;

    // Create reconciliation items
    for (const r of records) {
      const skuCode = r['SKU Code'];
      if (!skuCode) continue;
      const product_id =
        productMapByCode.get(skuCode.toString().trim().toUpperCase()) || null;
      if (!product_id) {
        logger.warn(`Could not resolve SKU Code: ${skuCode}. Skipping item.`);
        continue;
      }

      const expectedQty = parseFloat(r['Expected ROP']) || 0;
      const actualQty =
        r['Actual ROP (Clerk)'] !== null
          ? parseFloat(r['Actual ROP (Clerk)'])
          : null;

      let variance: number | null = null;
      let resAction = 'Awaiting Verification';

      if (sapCode === 'MOS100801') {
        resAction = 'Awaiting Force-Push';
      } else if (actualQty !== null) {
        variance = expectedQty - actualQty;
        if (Math.abs(variance) < 0.0001) {
          variance = 0;
          resAction = 'CLEAN';
        } else if (variance > 0) {
          resAction = 'Post to Default Outlet';
        } else {
          resAction = 'Adjust Unload Upward';
        }
      }

      const defaultOutletPostingQty =
        resAction === 'Post to Default Outlet' && variance !== null
          ? variance
          : 0;
      const unloadAdjustmentQty =
        resAction === 'Adjust Unload Upward' && variance !== null
          ? -variance
          : 0;

      await prisma.reconciliation_items.create({
        data: {
          reconciliation_id: recon.id,
          product_id,
          batch_number: r['Batch Number'] ? r['Batch Number'].toString() : null,
          expected_qty: expectedQty,
          actual_qty: actualQty,
          variance,
          resolution_action: resAction,
          default_outlet_posting_qty: defaultOutletPostingQty,
          unload_adjustment_qty: unloadAdjustmentQty,
          stock_key: r['Stock Key'] ? r['Stock Key'].toString() : null,
          is_active: 'Y',
          createdate: new Date(),
          createdby: 1,
        },
      });

      itemsCreated++;
    }
  }

  logger.info(
    `Successfully seeded ${headersCreated} reconciliation headers and ${itemsCreated} items.`
  );
}

main()
  .catch(err => {
    logger.error('Error seeding reconciliation data:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
