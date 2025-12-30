// const itemData = {
//   parent_id: inventory.id,
//   product_id: Number(item.product_id),
//   product_name: product.name,
//   unit: product.product_unit_of_measurement?.name ||
//         product.product_unit_of_measurement?.symbol || 'pcs',
//   quantity: qty,
//   unit_price: Number(item.unit_price) || 0,
//   discount_amount: Number(item.discount_amount) || 0,
//   tax_amount: Number(item.tax_amount) || 0,
//   total_amount: qty * (Number(item.unit_price) || 0) -
//                 (Number(item.discount_amount) || 0) +
//                 (Number(item.tax_amount) || 0),
//   notes: item.notes || null,
//   batch_lot_id: Number(item.batch_lot_id),
// };

// // ===== NEW LOGIC: Handle Load vs Unload =====
// if (loadingType === 'L') {
//   // LOAD: Add to van_inventory_items (existing logic works)
//   if (item.id) {
//     const existingItem = await tx.van_inventory_items.findFirst({
//       where: { id: Number(item.id), parent_id: inventory.id },
//     });

//     if (existingItem) {
//       itemsToUpdate.push({ id: Number(item.id), data: itemData });
//       processedItemIds.push(Number(item.id));
//     } else {
//       itemsToCreate.push(itemData);
//     }
//   } else {
//     itemsToCreate.push(itemData);
//   }

// } else if (loadingType === 'U') {
//   // UNLOAD: Remove/Decrease from van_inventory_items

//   // Find existing item in van that matches product and batch
//   const existingVanItem = await tx.van_inventory_items.findFirst({
//     where: {
//       parent_id: inventory.id,
//       product_id: Number(item.product_id),
//       batch_lot_id: Number(item.batch_lot_id),
//     },
//   });

//   if (!existingVanItem) {
//     throw new Error(
//       `Cannot unload: Product ${product.name} (Batch: ${item.batch_lot_id}) not found in van inventory`
//     );
//   }

//   if (existingVanItem.quantity < qty) {
//     throw new Error(
//       `Cannot unload: Insufficient quantity in van. Product: ${product.name}, Available: ${existingVanItem.quantity}, Requested: ${qty}`
//     );
//   }

//   const newQuantity = existingVanItem.quantity - qty;

//   if (newQuantity === 0) {
//     // Remove item completely if quantity becomes 0
//     await tx.van_inventory_items.delete({
//       where: { id: existingVanItem.id },
//     });
//   } else {
//     // Decrease quantity
//     const updatedItemData = {
//       ...itemData,
//       quantity: newQuantity,
//       total_amount: newQuantity * (Number(item.unit_price) || 0) -
//                     (Number(item.discount_amount) || 0) +
//                     (Number(item.tax_amount) || 0),
//     };

//     itemsToUpdate.push({
//       id: existingVanItem.id,
//       data: updatedItemData
//     });
//     processedItemIds.push(existingVanItem.id);
//   }
// }
