import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables
dotenv.config({ path: path.join(__dirname, '.env') });

import prisma from './src/configs/prisma.client';

async function main() {
  const salespersonId = 1;
  console.log(`=== RUNNING DATABASE VERIFICATION FOR SALESPERSON ID: ${salespersonId} ===\n`);

  // 1. Fetch Salesperson User
  const user = await prisma.users.findUnique({
    where: { id: salespersonId },
    select: { id: true, name: true, email: true }
  });
  console.log(`Salesperson: ${JSON.stringify(user, null, 2)}\n`);

  // 2. Fetch Van Inventories
  const vanInventories = await prisma.van_inventory.findMany({
    where: {
      user_id: salespersonId,
      is_active: 'Y'
    },
    include: {
      van_inventory_items_inventory: true
    }
  });

  console.log(`=== VAN INVENTORIES (Total: ${vanInventories.length}) ===`);
  const loads = vanInventories.filter(v => v.loading_type === 'L' && v.status !== 'C');
  const unloads = vanInventories.filter(v => v.loading_type === 'U' && v.status !== 'C');

  console.log(`Loads count (non-canceled): ${loads.length}`);
  const loadQty = loads.reduce((sum, v) => {
    return sum + (v.van_inventory_items_inventory || []).reduce((s, item) => s + (item.quantity || 0), 0);
  }, 0);
  console.log(`Total Loaded Qty: ${loadQty}`);

  console.log(`\nUnloads count (non-canceled): ${unloads.length}`);
  const unloadQty = unloads.reduce((sum, v) => {
    return sum + (v.van_inventory_items_inventory || []).reduce((s, item) => s + (item.quantity || 0), 0);
  }, 0);
  console.log(`Total Unloaded Qty: ${unloadQty}`);

  // 3. Fetch Invoices
  const allInvoicesCount = await prisma.invoices.count();
  console.log(`\n=== ALL INVOICES IN DB (Total: ${allInvoicesCount}) ===`);

  const invoices = await prisma.invoices.findMany({
    include: {
      invoice_items: true
    }
  });

  // Log distinct salespeople and creators in existing invoices
  const distinctSalespeople = [...new Set(invoices.map(inv => inv.salesperson_id).filter(Boolean))];
  const distinctCreators = [...new Set(invoices.map(inv => inv.createdby).filter(Boolean))];
  console.log(`Distinct Salesperson IDs in Invoices:`, distinctSalespeople);
  console.log(`Distinct CreatedBy IDs in Invoices:`, distinctCreators);

  if (invoices.length > 0) {
    console.log(`Sample Invoices (First 3):`, invoices.slice(0, 3).map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      salesperson_id: inv.salesperson_id,
      createdby: inv.createdby,
      total_amount: inv.total_amount,
      itemsCount: inv.invoice_items?.length || 0
    })));
  }

  const salespersonInvoices = invoices.filter(inv => {
    return inv.salesperson_id === salespersonId || inv.createdby === salespersonId;
  });

  console.log(`\n=== INVOICES FOR SALESPERSON ${salespersonId} (Total matched: ${salespersonInvoices.length}) ===`);
  const totalRevenue = salespersonInvoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
  const totalQtySold = salespersonInvoices.reduce((sum, inv) => {
    return sum + (inv.invoice_items || []).reduce((s, item) => s + (item.quantity || 0), 0);
  }, 0);

  console.log(`Invoice count: ${salespersonInvoices.length}`);
  console.log(`Total Sales Revenue: $${totalRevenue}`);
  console.log(`Total Items Sold: ${totalQtySold}`);

  // Disconnect prisma
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
