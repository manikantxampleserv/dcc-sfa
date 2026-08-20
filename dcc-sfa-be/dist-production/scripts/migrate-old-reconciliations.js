"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = require("../configs/prisma.client");
const prisma = (0, prisma_client_1.getPrisma)();
async function main() {
    // Get reconciliation_id from command line argument
    const reconId = Number(process.argv[2]);
    if (!reconId || isNaN(reconId)) {
        console.error('Usage: npx ts-node src/scripts/migrate-old-reconciliations.ts <reconciliation_id>');
        console.error('Example: npx ts-node src/scripts/migrate-old-reconciliations.ts 124');
        process.exit(1);
    }
    console.log(`Updating reconciliation ID: ${reconId}`);
    // Fetch default pricelist
    const defaultPricelist = await prisma.pricelists.findFirst({
        where: { is_default: 'Y', is_active: 'Y' },
    });
    console.log(`Default price list: ID ${defaultPricelist?.id || 'None'}`);
    // Fetch all items for this specific reconciliation
    const items = await prisma.reconciliation_items.findMany({
        where: { reconciliation_id: reconId },
        include: {
            product: {
                include: {
                    pricelist_items_products: {
                        where: { pricelist_id: defaultPricelist?.id || -1, is_active: 'Y' },
                    },
                    product_tax_master: true,
                },
            },
        },
    });
    if (items.length === 0) {
        console.log(`No items found for reconciliation ID ${reconId}.`);
        return;
    }
    console.log(`Found ${items.length} items. Updating...`);
    for (const item of items) {
        const resolvedPrice = item.product?.pricelist_items_products?.[0]?.unit_price ??
            item.product?.base_price ??
            0;
        const resolvedTax = item.product?.product_tax_master?.tax_rate ??
            0;
        await prisma.reconciliation_items.update({
            where: { id: item.id },
            data: {
                unit_price: resolvedPrice,
                tax_percent: resolvedTax,
            },
        });
        console.log(`  Item ID ${item.id} | Product ID ${item.product_id} → unit_price: ${resolvedPrice}, tax_percent: ${resolvedTax}`);
    }
    console.log(`\nDone. Updated ${items.length} items for reconciliation ID ${reconId}.`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=migrate-old-reconciliations.js.map