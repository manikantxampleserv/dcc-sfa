import prisma from '../src/configs/prisma.client';
import * as fs from 'fs';
import * as path from 'path';

async function generateMockPayload() {
  const user = await prisma.users.findFirst({
    where: { sap_code: { not: null, notIn: [''] } },
  });

  const depot = await prisma.depots.findFirst({
    where: { sap_code: { not: null, notIn: [''] } },
  });

  const products = await prisma.products.findMany({
    where: { 
      sap_code: { not: null, notIn: [''] },
      tracking_type: 'BATCH'
    },
    take: 28,
  });

  if (products.length === 0) {
    throw new Error('No BATCH products found with SAP code.');
  }

  const hardcodedRows = [
    { quantity: 70, batch_number: 'CK3-33679', manufacturing_date: '2026-07-16', expiry_date: '2027-07-15' },
    { quantity: 26, batch_number: 'CK3-33586', manufacturing_date: '2026-07-17', expiry_date: '2027-07-16' },
    { quantity: 14, batch_number: 'CK3-33521', manufacturing_date: '2026-07-01', expiry_date: '2027-06-30' },
    { quantity: 11, batch_number: 'CK3-33539', manufacturing_date: '2026-07-04', expiry_date: '2027-07-03' },
    { quantity: 13, batch_number: 'CK3-33537', manufacturing_date: '2026-07-04', expiry_date: '2027-07-03' },
    { quantity: 5, batch_number: 'CK3-33494', manufacturing_date: '2026-06-24', expiry_date: '2026-12-22' },
    { quantity: 4, batch_number: 'CK3-33486', manufacturing_date: '2026-06-23', expiry_date: '2027-06-22' },
    { quantity: 2, batch_number: 'CK3-33513', manufacturing_date: '2026-06-27', expiry_date: '2027-06-26' },
    { quantity: 2, batch_number: 'CK3-33553', manufacturing_date: '2026-07-10', expiry_date: '2027-07-09' },
    { quantity: 3, batch_number: 'CK3-33549', manufacturing_date: '2026-07-09', expiry_date: '2027-07-08' },
    { quantity: 2, batch_number: 'CK3-33444', manufacturing_date: '2026-06-11', expiry_date: '2027-06-10' },
    { quantity: 6, batch_number: 'CK3-33579', manufacturing_date: '2026-07-16', expiry_date: '2027-07-15' },
    { quantity: 2, batch_number: 'CK3-33338', manufacturing_date: '2026-05-30', expiry_date: '2027-05-29' },
    { quantity: 2, batch_number: 'CK3-32758', manufacturing_date: '2025-12-19', expiry_date: '2026-12-18' },
    { quantity: 80, batch_number: 'CK6-009', manufacturing_date: '2026-07-15', expiry_date: '2027-07-14' },
    { quantity: 70, batch_number: 'CK4-878', manufacturing_date: '2026-07-16', expiry_date: '2027-07-15' },
    { quantity: 30, batch_number: 'CK5-33572', manufacturing_date: '2026-07-14', expiry_date: '2026-11-02' },
    { quantity: 25, batch_number: 'CK6-33590', manufacturing_date: '2026-07-18', expiry_date: '2026-11-06' },
    { quantity: 8, batch_number: 'CK6-33576', manufacturing_date: '2026-07-16', expiry_date: '2026-11-03' },
    { quantity: 7, batch_number: 'CK5-33567', manufacturing_date: '2026-07-13', expiry_date: '2026-11-01' },
    { quantity: 12, batch_number: 'CK6-33561', manufacturing_date: '2026-07-11', expiry_date: '2026-10-30' },
    { quantity: 4, batch_number: 'CK5-33577', manufacturing_date: '2026-07-17', expiry_date: '2026-11-05' },
    { quantity: 3, batch_number: 'CK5-33565', manufacturing_date: '2026-07-12', expiry_date: '2026-10-31' },
    { quantity: 5, batch_number: 'CK6-33550', manufacturing_date: '2026-07-09', expiry_date: '2026-10-28' },
    { quantity: 4, batch_number: 'CK6-33583', manufacturing_date: '2026-07-17', expiry_date: '2026-11-05' },
    { quantity: 5, batch_number: 'CK5-33444', manufacturing_date: '2026-06-16', expiry_date: '2026-10-05' },
    { quantity: 10, batch_number: 'CK5-33497', manufacturing_date: '2026-06-25', expiry_date: '2026-09-16' },
    { quantity: 30, batch_number: 'CK5-33542', manufacturing_date: '2026-07-06', expiry_date: '2026-09-27' }
  ];

  const items = hardcodedRows.map((row, index) => {
    // Reuse products if we have fewer than 28 products with SAP codes
    const product = products[index % products.length];
    
    return {
      product_sap_code: product.sap_code,
      source_system: 'sap_arinvoice',
      sap_docentry: `DOC_E_${Date.now()}_${index}`,
      sap_docnum: `DOC_N_${Date.now()}_${index}`,
      sap_lineid: `${index + 1}`,
      quantity: row.quantity,
      unit_price: 50,
      batches: [
        {
          batch_number: row.batch_number,
          quantity: row.quantity,
          manufacturing_date: row.manufacturing_date ? new Date(row.manufacturing_date).toISOString() : new Date().toISOString(),
          expiry_date: row.expiry_date ? new Date(row.expiry_date).toISOString() : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        },
      ]
    };
  });

  const payload = {
    salesman_sap_code: user?.sap_code || 'EMP001',
    depot_sap_code: depot?.sap_code || 'D001',
    document_date: new Date().toISOString(),
    loading_type: 'L',
    items: items,
  };

  const outputPath = path.join(__dirname, 'sap_payload_mock.json');
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log('Saved exact mock payload to ' + outputPath);
}

generateMockPayload()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
