import { getPrisma } from '../configs/prisma.client';

const prisma = getPrisma();

async function main() {
  const reconId = Number(process.argv[2]);

  if (!reconId || isNaN(reconId)) {
    console.error('Usage: npx ts-node src/scripts/migrate-old-reconciliations.ts <reconciliation_id>');
    console.error('Example: npx ts-node src/scripts/migrate-old-reconciliations.ts 124');
    process.exit(1);
  }

  console.log(`\nRecalculating tax_amount for reconciliation ID: ${reconId}`);

  const defaultPricelist = await prisma.pricelists.findFirst({
    where: { is_default: 'Y', is_active: 'Y' },
  });

  const items = await prisma.reconciliation_items.findMany({
    where: { reconciliation_id: reconId },
    include: {
      product: {
        include: {
          pricelist_items_products: {
            where: { pricelist_id: defaultPricelist?.id || -1, is_active: 'Y' },
          },
          product_tax_master: true,
          product_unit_of_measurement: true,
        },
      },
    },
  });

  if (items.length === 0) {
    console.log(`No items found for reconciliation ID ${reconId}.`);
    return;
  }

  console.log(`Found ${items.length} items.\n`);

  for (const item of items) {
    // Resolve unit_price
    const unitPrice = item.unit_price !== null
      ? Number(item.unit_price)
      : Number(item.product?.pricelist_items_products?.[0]?.unit_price ?? item.product?.base_price ?? 0);

    // Resolve tax_percent
    const taxPercent = item.tax_percent !== null
      ? Number(item.tax_percent)
      : Number(item.product?.product_tax_master?.tax_rate ?? 0);

    // Conversion rate (cases → pieces)
    const convRate = Number((item.product as any)?.product_unit_of_measurement?.conversion_rate) || 1;

    const saleQty     = Number(item.sale_qty) || 0;
    const saleBaseQty = Number(item.sale_base_qty) || 0;

    // Price per single piece
    const unitPricePerPc = convRate > 0 ? unitPrice / convRate : 0;

    // Total sale value
    const saleVal = (saleQty * unitPrice) + (saleBaseQty * unitPricePerPc);

    // New tax_amount
    const newTaxAmount = (saleVal * taxPercent) / 100;

    await prisma.reconciliation_items.update({
      where: { id: item.id },
      data: {
        unit_price:  unitPrice,
        tax_percent: taxPercent,
        tax_amount:  newTaxAmount,
      },
    });

    console.log(
      `  Item ${item.id} | Product ${item.product_id} | ` +
      `sale_qty=${saleQty} cases + ${saleBaseQty} pcs | ` +
      `unit_price=${unitPrice} | tax%=${taxPercent} | ` +
      `saleVal=${saleVal.toFixed(2)} | tax_amount=${newTaxAmount.toFixed(2)}`
    );
  }

  console.log(`\nDone. Updated ${items.length} items for reconciliation ID ${reconId}.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
