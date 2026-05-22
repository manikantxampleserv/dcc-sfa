import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

import prisma from './src/configs/prisma.client';

// Simple implementation of the updated serializeVanInventory from backend to verify in-script
function verifySerialization(item: any) {
  const productGroups = new Map<number, any[]>();
  const stockMovements = item.van_inventory_stock_movements || [];

  console.log(`\n--- Serializing Inventory ID: ${item.id} ---`);
  console.log(`Raw items count: ${item.van_inventory_items_inventory?.length || 0}`);
  
  // Before restore log
  item.van_inventory_items_inventory?.forEach((it: any) => {
    console.log(`  Before -> Item ID: ${it.id}, Product: ${it.product_name}, Qty: ${it.quantity}, Total Amount: ${it.total_amount}`);
  });

  // Restore quantities from stock_movements if they were zeroed out
  item.van_inventory_items_inventory?.forEach((it: any) => {
    if (Number(it.quantity) === 0) {
      const matchingMovement = stockMovements.find((sm: any) =>
        sm.product_id === it.product_id &&
        (it.batch_lot_id ? sm.batch_id === it.batch_lot_id : true) &&
        (it.serial_id ? sm.serial_id === it.serial_id : true)
      );
      if (matchingMovement) {
        it.quantity = matchingMovement.quantity;
        const qty = Number(matchingMovement.quantity) || 0;
        const price = Number(it.unit_price) || 0;
        it.total_amount = String(qty * price);
      }
    }
  });

  // After restore log
  item.van_inventory_items_inventory?.forEach((it: any) => {
    console.log(`  After  -> Item ID: ${it.id}, Product: ${it.product_name}, Qty: ${it.quantity}, Total Amount: ${it.total_amount}`);
  });
}

async function main() {
  console.log('=== VERIFYING NEW BACKEND SERIALIZATION RESTORATION ===\n');

  // Fetch some van inventories for User 1 with items and stock movements
  const inventories = await prisma.van_inventory.findMany({
    where: { 
      user_id: 1,
      van_inventory_items_inventory: {
        some: {} // only those with items
      }
    },
    include: {
      van_inventory_items_inventory: true,
      van_inventory_stock_movements: true
    },
    take: 3
  });

  console.log(`Found ${inventories.length} inventories with items for User 1.`);

  for (const inv of inventories) {
    verifySerialization(inv);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
