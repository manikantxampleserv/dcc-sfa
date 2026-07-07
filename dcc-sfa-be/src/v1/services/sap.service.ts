// import prisma from '../../configs/prisma.client';
// import { createRequest } from '../controllers/requests.controller';

// async function updateInventoryStock(
//   tx: any,
//   productId: number,
//   locationId: number | null,
//   quantity: number,
//   loadingType: string,
//   batchId?: number | null,
//   serialId?: number | null,
//   userId?: number,
//   vanUserId?: number | null
// ): Promise<void> {
//   let validLocationId = locationId;
//   let salespersonId: number | null = vanUserId || null;
//   if (!validLocationId) {
//     const targetUserId = vanUserId || userId || 1;
//     const user = await tx.users.findUnique({ where: { id: targetUserId } });
//     const depotName = `Van - ${user?.name || targetUserId}`;
//     let vanDepot = await tx.depots.findFirst({ where: { name: depotName } });

//     if (!vanDepot) {
//       const parentDepot = await tx.depots.findFirst({ orderBy: { id: 'asc' } });
//       vanDepot = await tx.depots.create({
//         data: {
//           parent_id: parentDepot ? parentDepot.parent_id : 1,
//           name: depotName,
//           code: `VAN-${targetUserId}`,
//           is_active: 'Y',
//           createdby: userId || 1,
//         },
//       });
//     }
//     validLocationId = vanDepot.id;
//   }

//   const whereClause: any = {
//     product_id: productId,
//     location_id: validLocationId,
//   };

//   if (batchId !== null) whereClause.batch_id = batchId;
//   if (serialId !== null) whereClause.serial_number_id = serialId;

//   const existingStock = await tx.inventory_stock.findFirst({
//     where: whereClause,
//   });

//   if (loadingType === 'L') {
//     if (existingStock) {
//       const prevCurrent = existingStock.current_stock ?? 0;
//       const prevAvailable = existingStock.available_stock ?? 0;
//       const newCurrent = prevCurrent + quantity;
//       const newAvailable = prevAvailable + quantity;
//       console.log(
//         `updateInventoryStock LOAD: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} +${quantity} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
//       );
//       await tx.inventory_stock.update({
//         where: { id: existingStock.id },
//         data: {
//           current_stock: newCurrent,
//           available_stock: newAvailable,
//           updatedate: new Date(),
//           updatedby: userId,
//         },
//       });
//     } else {
//       console.log(
//         `updateInventoryStock CREATE: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} set current ${quantity} available ${quantity}`
//       );
//       await tx.inventory_stock.create({
//         data: {
//           product_id: productId,
//           location_id: validLocationId,
//           salesperson_id: salespersonId,
//           current_stock: quantity,
//           reserved_stock: 0,
//           available_stock: quantity,
//           minimum_stock: 0,
//           maximum_stock: 0,
//           batch_id: batchId || null,
//           serial_number_id: serialId || null,
//           is_active: 'Y',
//           createdate: new Date(),
//           createdby: userId || 1,
//           log_inst: 1,
//         },
//       });
//     }
//   } else if (loadingType === 'U') {
//     if (existingStock) {
//       const prevCurrent = existingStock.current_stock ?? 0;
//       const prevAvailable = existingStock.available_stock ?? 0;
//       const newCurrentStock = Math.max(0, prevCurrent - quantity);
//       const newAvailableStock = Math.max(0, prevAvailable - quantity);
//       console.log(
//         `updateInventoryStock UNLOAD: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} -${quantity} current ${prevCurrent}→${newCurrentStock} available ${prevAvailable}→${newAvailableStock}`
//       );
//       await tx.inventory_stock.update({
//         where: { id: existingStock.id },
//         data: {
//           current_stock: newCurrentStock,
//           available_stock: newAvailableStock,
//           updatedate: new Date(),
//           updatedby: userId,
//         },
//       });
//     }
//     return;
//   } else {
//     throw new Error(`Invalid loading type: ${loadingType}`);
//   }
// }

// async function createStockMovement(
//   tx: any,
//   data: {
//     product_id: number;
//     batch_id?: number | null;
//     serial_id?: number | null;
//     movement_type: string;
//     reference_type: string;
//     reference_id: number;
//     from_location_id?: number | null;
//     to_location_id?: number | null;
//     quantity: number;
//     remarks?: string;
//     van_inventory_id?: number;
//     createdby: number;
//   }
// ): Promise<void> {
//   await tx.stock_movements.create({
//     data: {
//       product_id: data.product_id,
//       batch_id: data.batch_id ?? null,
//       serial_id: data.serial_id ?? null,
//       movement_type: data.movement_type,
//       reference_type: data.reference_type,
//       reference_id: data.reference_id,
//       from_location_id: data.from_location_id ?? null,
//       to_location_id: data.to_location_id ?? null,
//       quantity: data.quantity,
//       movement_date: new Date(),
//       remarks: data.remarks || null,
//       is_active: 'Y',
//       createdate: new Date(),
//       createdby: data.createdby,
//       log_inst: 1,
//       van_inventory_id: data.van_inventory_id ?? null,
//     },
//   });
// }

// const SOURCE_SYSTEM_LABELS: Record<string, string> = {
//   sap_arinvoice: 'AR Invoice',
//   sap_inventorytrf: 'Inventory Transfer',
// };

// const getSourceSystemLabel = (
//   sourceSystem: string | null | undefined
// ): string | null => {
//   if (!sourceSystem) return null;
//   const key = sourceSystem.toLowerCase();
//   return SOURCE_SYSTEM_LABELS[key] || sourceSystem;
// };

// export const sapService = {
//   async createOrUpdateVanInventorySAP(payload: any, userId: number = 1) {
//     const { van_inventory_items, inventoryItems, ...inventoryData } = payload;

//     const items = van_inventory_items || inventoryItems || payload.items || [];
//     let inventoryId = inventoryData.id;
//     let loadingType = inventoryData.loading_type || 'L';
//     if (!['L', 'U'].includes(loadingType.toUpperCase())) {
//       loadingType = 'L';
//     }

//     if (!inventoryData.salesman_sap_code) {
//       throw new Error('salesman_sap_code is required');
//     }

//     const spUser = await prisma.users.findFirst({
//       where: { sap_code: inventoryData.salesman_sap_code },
//     });

//     if (!spUser) {
//       throw new Error(
//         `Salesman with SAP code ${inventoryData.salesman_sap_code} not found`
//       );
//     }
//     inventoryData.user_id = spUser.id;

//     let workflowExists = false;
//     const requesterZoneId = spUser.zone_id;
//     const requesterDepotId = spUser.depot_id;

//     if (requesterZoneId && requesterDepotId) {
//       const zoneDepotWorkflow = await prisma.approval_work_flow.findMany({
//         where: {
//           request_type: 'VAN_INVENTORY',
//           zone_id: requesterZoneId,
//           depot_id: requesterDepotId,
//           is_active: 'Y',
//         },
//       });
//       if (zoneDepotWorkflow.length > 0) workflowExists = true;
//     }

//     if (!workflowExists && requesterZoneId) {
//       const zoneWorkflow = await prisma.approval_work_flow.findMany({
//         where: {
//           request_type: 'VAN_INVENTORY',
//           zone_id: requesterZoneId,
//           depot_id: null,
//           is_active: 'Y',
//         },
//       });
//       if (zoneWorkflow.length > 0) workflowExists = true;
//     }

//     if (!workflowExists && requesterDepotId) {
//       const depotWorkflow = await prisma.approval_work_flow.findMany({
//         where: {
//           request_type: 'VAN_INVENTORY',
//           zone_id: null,
//           depot_id: requesterDepotId,
//           is_active: 'Y',
//         },
//       });
//       if (depotWorkflow.length > 0) workflowExists = true;
//     }

//     if (!workflowExists) {
//       const globalWorkflow = await prisma.approval_work_flow.findMany({
//         where: {
//           request_type: 'VAN_INVENTORY',
//           zone_id: null,
//           depot_id: null,
//           is_active: 'Y',
//         },
//       });
//       if (globalWorkflow.length > 0) workflowExists = true;
//     }

//     const finalResult = await prisma.$transaction(
//       async tx => {
//         let inventory;
//         let isUpdate = false;
//         let existingInventoryToCheck: any = null;

//         if (inventoryId) {
//           const existingInventory = await tx.van_inventory.findUnique({
//             where: { id: Number(inventoryId) },
//           });

//           if (existingInventory) {
//             isUpdate = true;
//             existingInventoryToCheck = existingInventory;
//           }
//         }

//         if (
//           !workflowExists &&
//           (!isUpdate || existingInventoryToCheck?.approval_status === 'P')
//         ) {
//           inventoryData.approval_status = 'A';
//         }

//         const docDate = inventoryData.document_date
//           ? new Date(inventoryData.document_date)
//           : new Date();

//         const normalizedDocDate = new Date(
//           docDate.getFullYear(),
//           docDate.getMonth(),
//           docDate.getDate()
//         );

//         if (!inventoryId) {
//           const existingAnyInventory = await tx.van_inventory.findFirst({
//             where: {
//               user_id: Number(inventoryData.user_id),
//               document_date: {
//                 gte: new Date(
//                   normalizedDocDate.getFullYear(),
//                   normalizedDocDate.getMonth(),
//                   normalizedDocDate.getDate()
//                 ),
//                 lt: new Date(
//                   normalizedDocDate.getFullYear(),
//                   normalizedDocDate.getMonth(),
//                   normalizedDocDate.getDate() + 1
//                 ),
//               },
//             },
//             orderBy: {
//               createdate: 'desc',
//             },
//           });

//           if (existingAnyInventory) {
//             inventoryData.user_id = existingAnyInventory.user_id;
//             const effectiveApprovalStatus =
//               existingAnyInventory.approval_status || 'P';
//             if (effectiveApprovalStatus === 'P' || loadingType === 'U') {
//               inventoryId = existingAnyInventory.id;
//               isUpdate = true;
//               existingInventoryToCheck = existingAnyInventory;
//             } else {
//               throw new Error(
//                 `Cannot create new van inventory. There is already an existing inventory (ID: ${existingAnyInventory.id}) with approval_status '${effectiveApprovalStatus}' for this user and document date. Only pending (P) inventories or unloading operations are allowed.`
//               );
//             }
//           } else {
//             if (!inventoryData.user_id) {
//               inventoryData.user_id = userId;
//             }
//           }
//         }

//         let depot;
//         if (inventoryData.depot_sap_code) {
//           depot = await tx.depots.findFirst({
//             where: { sap_code: inventoryData.depot_sap_code },
//           });
//           if (!depot) {
//             throw new Error(
//               `Depot with SAP code ${inventoryData.depot_sap_code} not found`
//             );
//           }
//         } else {
//           depot = await tx.depots.findFirst({
//             where: { name: { contains: 'MOSHI' } },
//           });
//           if (!depot) {
//             throw new Error(
//               'depot_sap_code is missing and default MOSHI depot was not found'
//             );
//           }
//         }
//         inventoryData.location_id = depot.id;

//         if (isUpdate && existingInventoryToCheck && loadingType !== 'U') {
//           const effectiveApprovalStatus =
//             existingInventoryToCheck.approval_status || 'P';
//           if (effectiveApprovalStatus !== 'P') {
//             throw new Error(
//               `Cannot edit van inventory with approval_status '${effectiveApprovalStatus}'. Only pending (P) inventories or unloading operations are allowed.`
//             );
//           }
//         }

//         if (inventoryData.vehicle_sap_code) {
//           const vehicleExists = await tx.vehicles.findFirst({
//             where: { sap_code: inventoryData.vehicle_sap_code },
//           });
//           if (!vehicleExists) {
//             throw new Error(
//               `Vehicle with SAP code ${inventoryData.vehicle_sap_code} not found`
//             );
//           }
//           inventoryData.vehicle_id = vehicleExists.id;
//         }

//         const payload = {
//           user_id: Number(inventoryData.user_id),
//           is_cancelled: inventoryData.is_cancelled || 'N',
//           approval_status: inventoryData.approval_status || 'P',
//           remarks: inventoryData.remarks || null,
//           status: inventoryData.status || 'A',
//           loading_type: loadingType,
//           document_date: inventoryData.document_date
//             ? new Date(inventoryData.document_date)
//             : new Date(),
//           vehicle_id: inventoryData.vehicle_id
//             ? Number(inventoryData.vehicle_id)
//             : null,
//           vehicle_code:
//             inventoryData.vehicle_sap_code ||
//             inventoryData.vehicle_code ||
//             null,
//           sales_person_code:
//             inventoryData.salesman_sap_code ||
//             inventoryData.sales_person_code ||
//             null,
//           location_type: inventoryData.location_type || 'van',
//           location_id: inventoryData.location_id
//             ? Number(inventoryData.location_id)
//             : null,
//           is_active: inventoryData.is_active || 'Y',
//         };

//         if (isUpdate && inventoryId) {
//           inventory = await tx.van_inventory.update({
//             where: { id: Number(inventoryId) },
//             data: {
//               ...payload,
//               updatedby: userId,
//               updatedate: new Date(),
//               log_inst: { increment: 1 },
//             },
//           });
//         } else {
//           inventory = await tx.van_inventory.create({
//             data: {
//               ...payload,
//               createdby: userId,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           });
//           inventoryId = inventory.id;
//         }

//         const shouldPerformLoadingUnloading =
//           payload.approval_status === 'A' && payload.is_cancelled === 'N';

//         if (isUpdate && inventoryId && loadingType === 'L') {
//           await tx.van_inventory_items.deleteMany({
//             where: { parent_id: Number(inventoryId) },
//           });
//         }

//         if (Array.isArray(items) && items.length > 0) {
//           for (const item of items) {
//             const qty = parseInt(item.quantity, 10) || 0;

//             if (!item.product_sap_code) {
//               throw new Error('product_sap_code is required for each item');
//             }
//             if (!item.source_system) {
//               throw new Error('source_system is required for each item');
//             }

//             if (!item.sap_docentry) {
//               throw new Error('sap_docentry is required for each item');
//             }

//             if (!item.sap_docnum) {
//               throw new Error('sap_docnum is required for each item');
//             }

//             if (!item.sap_lineid) {
//               throw new Error('sap_lineid is required for each item');
//             }

//             const sapDocEntry = item.sap_docentry.toString();
//             const sapDocNum = item.sap_docnum.toString();
//             const sapLineid = item.sap_lineid.toString();
//             const sourceSystem = item.source_system;
//             const compositeKey = `${sourceSystem}_${sapDocEntry}_${sapLineid}`;
//             const existingSapDoc = await tx.van_inventory_items.findFirst({
//               where: {
//                 source_system: sourceSystem,
//                 sap_docentry: sapDocEntry,
//                 sap_lineid: sapLineid,
//                 ...(isUpdate && inventoryId
//                   ? {
//                     NOT: {
//                       parent_id: Number(inventoryId),
//                     },
//                   }
//                   : {}),
//               },
//             });

//             if (existingSapDoc) {
//               throw new Error(`SAP document already imported: ${compositeKey}`);
//             }
//             const product = await tx.products.findFirst({
//               where: { sap_code: item.product_sap_code },
//               include: { product_unit_of_measurement: true },
//             });

//             if (!product) {
//               throw new Error(
//                 `Product with SAP code ${item.product_sap_code} not found`
//               );
//             }

//             const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
//             const itemIsCancelled =
//               item.is_cancelled === 'T' || item.is_cancelled === 'Y';

//             const batchData = item.batches || item.product_batches;
//             const serialData = item.serials || item.product_serials;
//             if (trackingType === 'BATCH') {
//               if (
//                 !batchData ||
//                 !Array.isArray(batchData) ||
//                 batchData.length === 0
//               ) {
//                 throw new Error(
//                   `Batches are required for batch-tracked product ${product.name}`
//                 );
//               }

//               for (const batchInput of batchData) {
//                 if (!batchInput.batch_number) {
//                   throw new Error(
//                     `Batch number is required for each batch for product "${product.name}"`
//                   );
//                 }
//               }

//               const totalBatchQty = (batchData || []).reduce(
//                 (acc: number, b: any) => acc + (parseInt(b.quantity, 10) || 0),
//                 0
//               );
//               if (
//                 typeof item.quantity === 'undefined' ||
//                 item.quantity === null
//               ) {
//                 throw new Error(
//                   `Quantity is required for batch-tracked product "${product.name}" when batches are provided`
//                 );
//               }
//               const declaredQty = parseInt(item.quantity, 10);
//               if (Number.isNaN(declaredQty) || declaredQty !== totalBatchQty) {
//                 throw new Error(
//                   `Quantity mismatch for batch-tracked product "${product.name}": declared quantity ${item.quantity} does not match sum of batches ${totalBatchQty}`
//                 );
//               }
//             } else if (trackingType === 'SERIAL') {
//               if (
//                 !serialData ||
//                 !Array.isArray(serialData) ||
//                 serialData.length === 0
//               ) {
//                 throw new Error(
//                   `Serial numbers are required for serial-tracked product "${product.name}"`
//                 );
//               }

//               if (
//                 typeof item.quantity !== 'undefined' &&
//                 item.quantity !== null
//               ) {
//                 const declaredQty = parseInt(item.quantity, 10);
//                 if (
//                   !Number.isNaN(declaredQty) &&
//                   declaredQty !== serialData.length
//                 ) {
//                   throw new Error(
//                     `Quantity mismatch for serial-tracked product "${product.name}": declared quantity ${declaredQty} does not match number of serials ${serialData.length}`
//                   );
//                 }
//               }

//               for (const serialInput of serialData) {
//                 const serialNumber =
//                   typeof serialInput === 'string'
//                     ? serialInput
//                     : serialInput?.serial_number;
//                 if (!serialNumber) {
//                   throw new Error('Serial number is required');
//                 }
//               }
//             }

//             if (loadingType === 'L') {
//               if (trackingType === 'BATCH') {
//                 for (const batchInput of batchData) {
//                   const batchQty = parseInt(batchInput.quantity, 10) || 0;

//                   if (batchQty <= 0) {
//                     throw new Error('Batch quantity must be greater than 0');
//                   }

//                   if (batchQty <= 0) {
//                     throw new Error('Batch quantity must be greater than 0');
//                   }

//                   if (batchQty <= 0) {
//                     throw new Error('Batch quantity must be greater than 0');
//                   }

//                   let batchLot: any = null;
//                   let productBatch: any = null;

//                   batchLot = await tx.batch_lots.findFirst({
//                     where: {
//                       batch_number: batchInput.batch_number,
//                       productsId: product.id,
//                       is_active: 'Y',
//                       createdby: Number(inventoryData.user_id),
//                     },
//                   });

//                   if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                     if (batchLot) {
//                       await tx.batch_lots.update({
//                         where: { id: batchLot.id },
//                         data: {
//                           quantity: batchLot.quantity + batchQty,
//                           remaining_quantity:
//                             batchLot.remaining_quantity + batchQty,
//                           updatedate: new Date(),
//                         },
//                       });
//                       console.log(
//                         ` Updated batch_lots: ${batchLot.batch_number}`
//                       );
//                     } else {
//                       batchLot = await tx.batch_lots.create({
//                         data: {
//                           batch_number: batchInput.batch_number,
//                           lot_number:
//                             batchInput.lot_number || `LOT-${Date.now()}`,
//                           manufacturing_date: batchInput.manufacturing_date
//                             ? new Date(batchInput.manufacturing_date)
//                             : new Date(),
//                           expiry_date: batchInput.expiry_date
//                             ? new Date(batchInput.expiry_date)
//                             : new Date(
//                               new Date().setFullYear(
//                                 new Date().getFullYear() + 2
//                               )
//                             ),
//                           quantity: batchQty,
//                           remaining_quantity: batchQty,
//                           supplier_name: batchInput.supplier_name || null,
//                           purchase_price: batchInput.purchase_price || null,
//                           quality_grade: batchInput.quality_grade || 'A',
//                           storage_location: batchInput.storage_location || null,
//                           is_active: 'Y',
//                           createdate: new Date(),
//                           createdby: Number(inventoryData.user_id),
//                           log_inst: 1,
//                           productsId: product.id,
//                         },
//                       });
//                       console.log(
//                         ` Created batch_lots: ${batchLot.batch_number}`
//                       );
//                     }

//                     productBatch = await tx.product_batches.findFirst({
//                       where: {
//                         product_id: product.id,
//                         batch_lot_id: batchLot.id,
//                         is_active: 'Y',
//                       },
//                     });

//                     if (productBatch) {
//                       await tx.product_batches.update({
//                         where: { id: productBatch.id },
//                         data: {
//                           quantity: productBatch.quantity + batchQty,
//                           updatedate: new Date(),
//                         },
//                       });
//                       console.log(` Updated product_batches: +${batchQty}`);
//                     } else {
//                       await tx.product_batches.create({
//                         data: {
//                           product_id: product.id,
//                           batch_lot_id: batchLot.id,
//                           quantity: batchQty,
//                           is_active: 'Y',
//                           createdate: new Date(),
//                           createdby: userId,
//                           log_inst: 1,
//                         },
//                       });
//                       console.log(` Created product_batches`);
//                     }
//                   } else {
//                     if (!batchLot) {
//                       batchLot = await tx.batch_lots.create({
//                         data: {
//                           batch_number: batchInput.batch_number,
//                           lot_number:
//                             batchInput.lot_number || `LOT-${Date.now()}`,
//                           manufacturing_date: batchInput.manufacturing_date
//                             ? new Date(batchInput.manufacturing_date)
//                             : new Date(),
//                           expiry_date: batchInput.expiry_date
//                             ? new Date(batchInput.expiry_date)
//                             : new Date(
//                               new Date().setFullYear(
//                                 new Date().getFullYear() + 2
//                               )
//                             ),
//                           quantity: 0,
//                           remaining_quantity: 0,
//                           supplier_name: batchInput.supplier_name || null,
//                           purchase_price: batchInput.purchase_price || null,
//                           quality_grade: batchInput.quality_grade || 'A',
//                           storage_location: batchInput.storage_location || null,
//                           is_active: 'Y',
//                           createdate: new Date(),
//                           createdby: Number(inventoryData.user_id),
//                           log_inst: 1,
//                           productsId: product.id,
//                         },
//                       });
//                     }
//                   }

//                   // const existingVanItem =
//                   //   await tx.van_inventory_items.findFirst({
//                   //     where: {
//                   //       product_id: product.id,
//                   //       batch_lot_id: batchLot.id,
//                   //       van_inventory_items_inventory: {
//                   //         user_id: inventoryData.user_id,
//                   //         is_active: 'Y',
//                   //       },
//                   //     },
//                   //     include: {
//                   //       van_inventory_items_inventory: true,
//                   //     },
//                   //   });
//                   await tx.van_inventory_items.create({
//                     data: {
//                       parent_id: inventory.id,
//                       sap_lineid: item.sap_lineid || null,
//                       sap_item_code:
//                         item.product_sap_code || item.sap_item_code || null,
//                       product_id: product.id,
//                       product_name: product.name,
//                       unit:
//                         product.product_unit_of_measurement?.name || 'pcs',
//                       quantity: batchQty,
//                       sap_docnum: sapDocNum,
//                       sap_docentry: sapDocEntry,
//                       source_system: sourceSystem,
//                       is_cancelled:
//                         item.is_cancelled ||
//                         inventoryData.is_cancelled ||
//                         'N',
//                       remarks: item.remarks || inventoryData.remarks || null,
//                       unit_price: Number(item.unit_price || 0),
//                       discount_amount: Number(item.discount_amount || 0),
//                       tax_amount: Number(item.tax_amount || 0),
//                       total_amount: batchQty * Number(item.unit_price || 0),
//                       notes: item.notes || null,
//                       batch_lot_id: batchLot.id,
//                     },
//                   });
//                   console.log(` Created van_inventory_items`);

//                   if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                     await updateInventoryStock(
//                       tx,
//                       product.id,
//                       inventoryData.location_id || null,
//                       batchQty,
//                       'L',
//                       batchLot.id,
//                       null,
//                       userId,
//                       inventoryData.user_id
//                     );

//                     await createStockMovement(tx, {
//                       product_id: product.id,
//                       batch_id: batchLot.id,
//                       serial_id: null,
//                       movement_type: 'VAN_LOAD',
//                       reference_type: 'VAN_INVENTORY',
//                       reference_id: inventory.id,
//                       from_location_id: null,
//                       to_location_id: null,
//                       quantity: batchQty,
//                       remarks: `Loaded to van - Batch ${batchLot.batch_number}`,
//                       van_inventory_id: inventory.id,
//                       createdby: userId,
//                     });
//                   }
//                 }
//               } else if (trackingType === 'SERIAL') {
//                 const serialData = item.serials || item.product_serials;
//                 console.log(` Product: ${product.name}, ID: ${product.id}`);

//                 for (const serialInput of serialData) {
//                   const serialNumber =
//                     typeof serialInput === 'string'
//                       ? serialInput
//                       : serialInput.serial_number;

//                   let existingSerial = await tx.serial_numbers.findUnique({
//                     where: { serial_number: serialNumber },
//                   });

//                   if (existingSerial && existingSerial.status === 'in_van') {
//                     throw new Error(
//                       `Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`
//                     );
//                   }
//                   if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                     if (existingSerial) {
//                       if (existingSerial.status === 'in_van') {
//                         throw new Error(
//                           `Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`
//                         );
//                       }

//                       await tx.serial_numbers.update({
//                         where: { id: existingSerial.id },
//                         data: {
//                           status: 'in_van',
//                           location_id: null,
//                           updatedate: new Date(),
//                           updatedby: userId,
//                         },
//                       });
//                       console.log(
//                         ` Updated serial ${serialNumber} status → in_van`
//                       );
//                     } else {
//                       existingSerial = await tx.serial_numbers.create({
//                         data: {
//                           product_id: product.id,
//                           serial_number: serialNumber,
//                           batch_id: serialInput.batch_id || null,
//                           status: 'in_van',
//                           location_id: null,
//                           warranty_expiry: serialInput.warranty_expiry
//                             ? new Date(serialInput.warranty_expiry)
//                             : null,
//                           customer_id: serialInput.customer_id || null,
//                           is_active: 'Y',
//                           createdate: new Date(),
//                           createdby: userId,
//                           log_inst: 1,
//                         },
//                       });
//                       console.log(` Created new serial ${serialNumber}`);
//                     }
//                   } else {
//                     if (!existingSerial) {
//                       existingSerial = await tx.serial_numbers.create({
//                         data: {
//                           product_id: product.id,
//                           serial_number: serialNumber,
//                           batch_id: serialInput.batch_id || null,
//                           status: 'available',
//                           location_id: null,
//                           warranty_expiry: serialInput.warranty_expiry
//                             ? new Date(serialInput.warranty_expiry)
//                             : null,
//                           customer_id: serialInput.customer_id || null,
//                           is_active: 'Y',
//                           createdate: new Date(),
//                           createdby: userId,
//                           log_inst: 1,
//                         },
//                       });
//                     }
//                   }

//                   // const existingVanItem =
//                   //   await tx.van_inventory_items.findFirst({
//                   //     where: {
//                   //       product_id: product.id,
//                   //       serial_id: existingSerial.id,
//                   //       van_inventory_items_inventory: {
//                   //         user_id: inventoryData.user_id,
//                   //         is_active: 'Y',
//                   //       },
//                   //     },
//                   //     include: {
//                   //       van_inventory_items_inventory: true,
//                   //     },
//                   //   });

//                   console.log(`Creating new serial item`, {
//                     serial: serialNumber,
//                     quantity: 1,
//                   });
//                   await tx.van_inventory_items.create({
//                     data: {
//                       parent_id: inventory.id,
//                       sap_lineid: item.sap_lineid || null,
//                       sap_item_code:
//                         item.product_sap_code || item.sap_item_code || null,
//                       product_id: product.id,
//                       product_name: product.name,
//                       unit:
//                         product.product_unit_of_measurement?.name || 'pcs',
//                       quantity: 1,
//                       sap_docnum: sapDocNum,
//                       sap_docentry: sapDocEntry,
//                       source_system: sourceSystem,
//                       is_cancelled:
//                         item.is_cancelled ||
//                         inventoryData.is_cancelled ||
//                         'N',
//                       remarks: item.remarks || inventoryData.remarks || null,
//                       unit_price: Number(item.unit_price || 0),
//                       discount_amount: Number(item.discount_amount || 0),
//                       tax_amount: Number(item.tax_amount || 0),
//                       total_amount: 1 * Number(item.unit_price || 0),
//                       notes: item.notes || null,
//                       serial_id: existingSerial.id,
//                     },
//                   });
//                   console.log(
//                     `Created new van_inventory_items for serial ${serialNumber}`
//                   );

//                   if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                     await updateInventoryStock(
//                       tx,
//                       product.id,
//                       inventoryData.location_id || null,
//                       1,
//                       'L',
//                       null,
//                       existingSerial.id,
//                       userId,
//                       inventoryData.user_id
//                     );
//                     console.log(
//                       ` INCREASED inventory_stock for serial ${serialNumber}`
//                     );

//                     await createStockMovement(tx, {
//                       product_id: product.id,
//                       batch_id: null,
//                       serial_id: existingSerial.id,
//                       movement_type: 'VAN_LOAD',
//                       reference_type: 'VAN_INVENTORY',
//                       reference_id: inventory.id,
//                       from_location_id: null,
//                       to_location_id: null,
//                       quantity: 1,
//                       remarks: `Loaded serial ${serialNumber} to van`,
//                       van_inventory_id: inventory.id,
//                       createdby: userId,
//                     });
//                     console.log(
//                       ` Created VAN_LOAD stock movement for ${serialNumber}`
//                     );
//                   }
//                 }
//               } else {
//                 if (qty <= 0) {
//                   throw new Error(
//                     'Quantity must be greater than 0 for NONE-tracked product'
//                   );
//                 }
//                 await tx.van_inventory_items.create({
//                   data: {
//                     parent_id: inventory.id,
//                     sap_lineid: item.sap_lineid || null,
//                     sap_item_code:
//                       item.product_sap_code || item.sap_item_code || null,
//                     product_id: product.id,
//                     product_name: product.name,
//                     unit: product.product_unit_of_measurement?.name || 'pcs',
//                     quantity: qty,
//                     unit_price: Number(item.unit_price || 0),
//                     discount_amount: Number(item.discount_amount || 0),
//                     sap_docnum: sapDocNum,
//                     sap_docentry: sapDocEntry,
//                     source_system: sourceSystem,
//                     is_cancelled:
//                       item.is_cancelled || inventoryData.is_cancelled || 'N',
//                     remarks: item.remarks || inventoryData.remarks || null,
//                     tax_amount: Number(item.tax_amount || 0),
//                     total_amount: qty * Number(item.unit_price || 0),
//                     notes: item.notes || null,
//                     batch_lot_id: null,
//                     serial_id: null,
//                   },
//                 });
//                 console.log(`    Created van_inventory_items`);

//                 const itemIsCancelled =
//                   item.is_cancelled === 'T' || item.is_cancelled === 'Y';

//                 if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                   await updateInventoryStock(
//                     tx,
//                     product.id,
//                     inventoryData.location_id || null,
//                     qty,
//                     'L',
//                     null,
//                     null,
//                     userId,
//                     inventoryData.user_id
//                   );
//                   console.log(`    Updated inventory_stock`);

//                   await createStockMovement(tx, {
//                     product_id: product.id,
//                     batch_id: null,
//                     serial_id: null,
//                     movement_type: 'VAN_LOAD',
//                     reference_type: 'VAN_INVENTORY',
//                     reference_id: inventory.id,
//                     from_location_id: null,
//                     to_location_id: null,
//                     quantity: qty,
//                     remarks: `Loaded ${qty} units to van`,
//                     van_inventory_id: inventory.id,
//                     createdby: userId,
//                   });

//                   console.log(
//                     ` Loaded ${qty} units of NONE-tracked product ${product.name}\n`
//                   );
//                 }
//               }
//               // } else if (loadingType === 'U') {
//               //   if (trackingType === 'BATCH') {
//               //     const batchData = item.batches || item.product_batches;

//               //     if (
//               //       !batchData ||
//               //       !Array.isArray(batchData) ||
//               //       batchData.length === 0
//               //     ) {
//               //       throw new Error(
//               //         `Batches are required for batch-tracked product ${product.name}`
//               //       );
//               //     }

//               //     const totalBatchQtyUnload = (batchData || []).reduce(
//               //       (acc: number, b: any) =>
//               //         acc + (parseInt(b.quantity, 10) || 0),
//               //       0
//               //     );
//               //     if (
//               //       typeof item.quantity === 'undefined' ||
//               //       item.quantity === null
//               //     ) {
//               //       throw new Error(
//               //         `Quantity is required for batch-tracked product "${product.name}" when batches are provided`
//               //       );
//               //     }
//               //     const declaredQtyUnload = parseInt(item.quantity, 10);
//               //     if (
//               //       Number.isNaN(declaredQtyUnload) ||
//               //       declaredQtyUnload !== totalBatchQtyUnload
//               //     ) {
//               //       throw new Error(
//               //         `Quantity mismatch for batch-tracked product "${product.name}": declared quantity ${item.quantity} does not match sum of batches ${totalBatchQtyUnload}`
//               //       );
//               //     }

//               //     for (const batchInput of batchData) {
//               //       const batchQty = parseInt(batchInput.quantity, 10) || 0;

//               //       const batchLot = await tx.batch_lots.findFirst({
//               //         where: {
//               //           batch_number: batchInput.batch_number,
//               //           productsId: product.id,
//               //           is_active: 'Y',
//               //         },
//               //       });

//               //       if (!batchLot)
//               //         throw new Error(
//               //           `Batch ${batchInput.batch_number} not found`
//               //         );

//               //       const vanItem = await tx.van_inventory_items.findFirst({
//               //         where: {
//               //           product_id: product.id,
//               //           batch_lot_id: batchLot.id,
//               //           van_inventory_items_inventory: {
//               //             user_id: Number(inventoryData.user_id),
//               //             is_active: 'Y',
//               //             loading_type: 'L',
//               //           },
//               //         },
//               //       });
//               //       if (!vanItem)
//               //         throw new Error(
//               //           `Batch ${batchInput.batch_number} for product ${product.id} not found in van inventory for user ${inventoryData.user_id}`
//               //         );
//               //       if (vanItem.quantity < batchQty)
//               //         throw new Error(`Insufficient van quantity`);

//               //       // await tx.van_inventory_items.update({
//               //       //   where: { id: vanItem.id },
//               //       //   data: {
//               //       //     quantity: vanItem.quantity - batchQty,
//               //       //     total_amount:
//               //       //       (vanItem.quantity - batchQty) *
//               //       //       Number(vanItem.unit_price || 0),
//               //       //   },
//               //       // });

//               //       // await tx.batch_lots.update({
//               //       //   where: { id: batchLot.id },
//               //       //   data: {
//               //       //     remaining_quantity:
//               //       //       batchLot.remaining_quantity - batchQty,
//               //       //     updatedate: new Date(),
//               //       //   },
//               //       // });

//               //       // const productBatch = await tx.product_batches.findFirst({
//               //       //   where: {
//               //       //     product_id: product.id,
//               //       //     batch_lot_id: batchLot.id,
//               //       //     is_active: 'Y',
//               //       //   },
//               //       // });

//               //       // if (productBatch) {
//               //       //   await tx.product_batches.update({
//               //       //     where: { id: productBatch.id },
//               //       //     data: {
//               //       //       quantity: productBatch.quantity - batchQty,
//               //       //       updatedate: new Date(),
//               //       //     },
//               //       //   });
//               //       // }

//               //       // Check if we should perform unloading operations for this item
//               //       const itemIsCancelled =
//               //         item.is_cancelled === 'T' || item.is_cancelled === 'Y';

//               //       if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//               //         const inventoryStock = await tx.inventory_stock.findFirst({
//               //           where: {
//               //             product_id: product.id,
//               //             location_id: inventoryData.location_id || 1,
//               //             batch_id: batchLot.id,
//               //           },
//               //         });

//               //         if (inventoryStock) {
//               //           const prevCurrent = inventoryStock.current_stock ?? 0;
//               //           const prevAvailable = inventoryStock.available_stock ?? 0;
//               //           const newCurrent = Math.max(0, prevCurrent - batchQty);
//               //           const newAvailable = Math.max(
//               //             0,
//               //             prevAvailable - batchQty
//               //           );
//               //           console.log(
//               //             `updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} batch=${batchLot.id} -${batchQty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
//               //           );
//               //           await tx.inventory_stock.update({
//               //             where: { id: inventoryStock.id },
//               //             data: {
//               //               current_stock: newCurrent,
//               //               available_stock: newAvailable,
//               //               updatedate: new Date(),
//               //               updatedby: userId,
//               //             },
//               //           });
//               //         }
//               //       }

//               //       await tx.van_inventory_items.create({
//               //         data: {
//               //           parent_id: inventory.id,
//               //           sap_lineid: item.sap_lineid || null,
//               //           product_id: product.id,
//               //           product_name: product.name,
//               //           unit: product.product_unit_of_measurement?.name || 'pcs',
//               //           quantity: batchQty,
//               //           unit_price: Number(item.unit_price || 0),
//               //           sap_docnum: sapDocNum,
//               //           sap_docentry: sapDocEntry,
//               //           source_system: sourceSystem,
//               //           is_cancelled:
//               //             item.is_cancelled || inventoryData.is_cancelled || 'N',
//               //           remarks: item.remarks || inventoryData.remarks || null,
//               //           discount_amount: Number(item.discount_amount || 0),
//               //           tax_amount: Number(item.tax_amount || 0),
//               //           total_amount: batchQty * Number(item.unit_price || 0),
//               //           notes: item.notes || null,
//               //           batch_lot_id: batchLot.id,
//               //         },
//               //       });

//               //       if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//               //         await createStockMovement(tx, {
//               //           product_id: product.id,
//               //           batch_id: batchLot.id,
//               //           serial_id: null,
//               //           movement_type: 'VAN_UNLOAD',
//               //           reference_type: 'VAN_INVENTORY',
//               //           reference_id: inventory.id,
//               //           from_location_id: null,
//               //           to_location_id: null,
//               //           quantity: batchQty,
//               //           remarks: `Unloaded from van - Batch ${batchLot.batch_number}`,
//               //           van_inventory_id: inventory.id,
//               //           createdby: userId,
//               //         });
//               //       }
//               //     }
//               //   } else if (trackingType === 'SERIAL') {
//               //     const serialData = item.serials || item.product_serials;

//               //     // If item.quantity is provided, ensure it matches number of serials
//               //     if (
//               //       typeof item.quantity !== 'undefined' &&
//               //       item.quantity !== null
//               //     ) {
//               //       const declaredQty = parseInt(item.quantity, 10);
//               //       if (
//               //         !Number.isNaN(declaredQty) &&
//               //         declaredQty !== serialData.length
//               //       ) {
//               //         throw new Error(
//               //           `Quantity mismatch for serial-tracked product "${product.name}": declared quantity ${declaredQty} does not match number of serials ${serialData.length}`
//               //         );
//               //       }
//               //     }

//               //     for (const serialInput of serialData) {
//               //       const serialNumber =
//               //         typeof serialInput === 'string'
//               //           ? serialInput
//               //           : serialInput.serial_number;

//               //       const existingSerial = await tx.serial_numbers.findUnique({
//               //         where: { serial_number: serialNumber },
//               //       });

//               //       if (!existingSerial)
//               //         throw new Error(`Serial ${serialNumber} not found`);

//               //       const vanItem = await tx.van_inventory_items.findFirst({
//               //         where: {
//               //           product_id: product.id,
//               //           serial_id: existingSerial.id,
//               //           quantity: { gt: 0 },
//               //           van_inventory_items_inventory: {
//               //             user_id: Number(inventoryData.user_id),
//               //             is_active: 'Y',
//               //           },
//               //         },
//               //       });

//               //       if (!vanItem) {
//               //         throw new Error(
//               //           `Serial ${serialNumber} not found in any van inventory`
//               //         );
//               //       }

//               //       console.log(
//               //         ` Found in van_inventory_items ID: ${vanItem.id}, parent_id: ${vanItem.parent_id}`
//               //       );

//               //       const vanInventoryId = vanItem.parent_id;

//               //       // Check if we should perform unloading operations for this item
//               //       const itemIsCancelled =
//               //         item.is_cancelled === 'T' || item.is_cancelled === 'Y';

//               //       if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//               //         try {
//               //           const newVanQty = Math.max(
//               //             0,
//               //             (vanItem.quantity || 0) - 1
//               //           );
//               //           await tx.van_inventory_items.update({
//               //             where: { id: vanItem.id },
//               //             data: {
//               //               quantity: newVanQty,
//               //               total_amount:
//               //                 newVanQty * Number(vanItem.unit_price || 0),
//               //             },
//               //           });
//               //           console.log(
//               //             ` Updated van_inventory_items ID: ${vanItem.id}, quantity: ${vanItem.quantity}→${newVanQty}`
//               //           );
//               //         } catch (err) {
//               //           console.log(
//               //             ` Failed updating van_inventory_items ID ${vanItem.id}:`,
//               //             err
//               //           );
//               //         }

//               //         try {
//               //           await tx.serial_numbers.update({
//               //             where: { id: existingSerial.id },
//               //             data: {
//               //               status: 'available',
//               //               location_id: inventoryData.location_id || null,
//               //               updatedate: new Date(),
//               //               updatedby: userId,
//               //             },
//               //           });
//               //           console.log(
//               //             ` Updated serial ${serialNumber} status → available`
//               //           );
//               //         } catch (err) {
//               //           console.log(
//               //             ` Failed updating serial ${serialNumber} status:`,
//               //             err
//               //           );
//               //         }

//               //         const inventoryStock = await tx.inventory_stock.findFirst({
//               //           where: {
//               //             product_id: product.id,
//               //             serial_number_id: existingSerial.id,
//               //           },
//               //         });

//               //         if (inventoryStock) {
//               //           await tx.inventory_stock.update({
//               //             where: { id: inventoryStock.id },
//               //             data: {
//               //               current_stock: Math.max(
//               //                 0,
//               //                 (inventoryStock.current_stock || 0) - 1
//               //               ),
//               //               available_stock: Math.max(
//               //                 0,
//               //                 (inventoryStock.available_stock || 0) - 1
//               //               ),
//               //               updatedate: new Date(),
//               //               updatedby: userId,
//               //             },
//               //           });
//               //           console.log(
//               //             ` DECREASED inventory_stock for ${serialNumber}`
//               //           );
//               //         }

//               //         await createStockMovement(tx, {
//               //           product_id: product.id,
//               //           batch_id: null,
//               //           serial_id: existingSerial.id,
//               //           movement_type: 'VAN_UNLOAD',
//               //           reference_type: 'VAN_INVENTORY',
//               //           reference_id: inventory.id,
//               //           from_location_id: null,
//               //           to_location_id: null,
//               //           quantity: 1,
//               //           remarks: `Sold serial ${serialNumber}`,
//               //           van_inventory_id: inventory.id,
//               //           createdby: userId,
//               //         });
//               //       }

//               //       await tx.van_inventory_items.create({
//               //         data: {
//               //           parent_id: inventory.id,
//               //           sap_lineid: item.sap_lineid || null,
//               //           product_id: product.id,
//               //           product_name: product.name,
//               //           unit: product.product_unit_of_measurement?.name || 'pcs',
//               //           quantity: 1,
//               //           sap_docnum: sapDocNum,
//               //           sap_docentry: sapDocEntry,
//               //           source_system: sourceSystem,
//               //           is_cancelled:
//               //             item.is_cancelled || inventoryData.is_cancelled || 'N',
//               //           remarks: item.remarks || inventoryData.remarks || null,
//               //           unit_price: Number(item.unit_price || 0),
//               //           discount_amount: Number(item.discount_amount || 0),
//               //           tax_amount: Number(item.tax_amount || 0),
//               //           total_amount: 1 * Number(item.unit_price || 0),
//               //           notes: item.notes || null,
//               //           serial_id: existingSerial.id,
//               //         },
//               //       });
//               //     }
//               //   } else {
//               //     //   const vanItem = await tx.van_inventory_items.findFirst({
//               //     //     where: {
//               //     //       parent_id: inventory.id,
//               //     //       product_id: product.id,
//               //     //       batch_lot_id: null,
//               //     //       serial_id: null,
//               //     //     },
//               //     //   });

//               //     const vanItem = await tx.van_inventory_items.findFirst({
//               //       where: {
//               //         product_id: product.id,
//               //         batch_lot_id: null,
//               //         serial_id: null,
//               //         van_inventory_items_inventory: {
//               //           user_id: Number(inventoryData.user_id),
//               //           is_active: 'Y',
//               //           loading_type: 'L',
//               //         },
//               //       },
//               //     });

//               //     if (!vanItem) throw new Error(`Product not found in van`);
//               //     if (vanItem.quantity < qty)
//               //       throw new Error(`Insufficient van quantity`);

//               //     // Check if we should perform unloading operations for this item
//               //     const itemIsCancelled =
//               //       item.is_cancelled === 'T' || item.is_cancelled === 'Y';

//               //     if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//               //       const inventoryStock = await tx.inventory_stock.findFirst({
//               //         where: {
//               //           product_id: product.id,
//               //           location_id: inventoryData.location_id || 1,
//               //           batch_id: null,
//               //           serial_number_id: null,
//               //         },
//               //       });

//               //       if (inventoryStock) {
//               //         const prevCurrent = inventoryStock.current_stock ?? 0;
//               //         const prevAvailable = inventoryStock.available_stock ?? 0;
//               //         const newCurrent = Math.max(0, prevCurrent - qty);
//               //         const newAvailable = Math.max(0, prevAvailable - qty);
//               //         console.log(
//               //           `updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} -${qty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
//               //         );
//               //         await tx.inventory_stock.update({
//               //           where: { id: inventoryStock.id },
//               //           data: {
//               //             current_stock: newCurrent,
//               //             available_stock: newAvailable,
//               //             updatedate: new Date(),
//               //             updatedby: userId,
//               //           },
//               //         });
//               //       }

//               //       await createStockMovement(tx, {
//               //         product_id: product.id,
//               //         batch_id: null,
//               //         serial_id: null,
//               //         movement_type: 'VAN_UNLOAD',
//               //         reference_type: 'VAN_INVENTORY',
//               //         reference_id: inventory.id,
//               //         from_location_id: null,
//               //         to_location_id: null,
//               //         quantity: qty,
//               //         remarks: `Sold ${qty} units from van`,
//               //         van_inventory_id: inventory.id,
//               //         createdby: userId,
//               //       });
//               //     }

//               //     await tx.van_inventory_items.create({
//               //       data: {
//               //         parent_id: inventory.id,
//               //         sap_lineid: item.sap_lineid || null,
//               //         product_id: product.id,
//               //         product_name: product.name,
//               //         unit: product.product_unit_of_measurement?.name || 'pcs',
//               //         quantity: qty,
//               //         sap_docnum: sapDocNum,
//               //         sap_docentry: sapDocEntry,
//               //         source_system: sourceSystem,
//               //         is_cancelled:
//               //           item.is_cancelled || inventoryData.is_cancelled || 'N',
//               //         remarks: item.remarks || inventoryData.remarks || null,
//               //         unit_price: Number(item.unit_price || 0),
//               //         discount_amount: Number(item.discount_amount || 0),
//               //         tax_amount: Number(item.tax_amount || 0),
//               //         total_amount: qty * Number(item.unit_price || 0),
//               //         notes: item.notes || null,
//               //         batch_lot_id: null,
//               //         serial_id: null,
//               //       },
//               //     });
//               //   }
//               // }
//             } else if (loadingType === 'U') {
//               const existingUnloadSapDoc =
//                 await tx.van_inventory_items.findFirst({
//                   where: {
//                     source_system: sourceSystem,
//                     sap_docentry: sapDocEntry,
//                     van_inventory_items_inventory: {
//                       loading_type: 'U',
//                     },
//                   },
//                 });

//               if (existingUnloadSapDoc) {
//                 throw new Error(
//                   `SAP document already unloaded: ${compositeKey}`
//                 );
//               }

//               if (trackingType === 'BATCH') {
//                 const batchData = item.batches || item.product_batches;

//                 if (
//                   !batchData ||
//                   !Array.isArray(batchData) ||
//                   batchData.length === 0
//                 ) {
//                   throw new Error(
//                     `Batches are required for batch-tracked product ${product.name}`
//                   );
//                 }

//                 const totalBatchQtyUnload = (batchData || []).reduce(
//                   (acc: number, b: any) =>
//                     acc + (parseInt(b.quantity, 10) || 0),
//                   0
//                 );
//                 if (
//                   typeof item.quantity === 'undefined' ||
//                   item.quantity === null
//                 ) {
//                   throw new Error(
//                     `Quantity is required for batch-tracked product "${product.name}" when batches are provided`
//                   );
//                 }
//                 const declaredQtyUnload = parseInt(item.quantity, 10);
//                 if (
//                   Number.isNaN(declaredQtyUnload) ||
//                   declaredQtyUnload !== totalBatchQtyUnload
//                 ) {
//                   throw new Error(
//                     `Quantity mismatch for batch-tracked product "${product.name}": declared quantity ${item.quantity} does not match sum of batches ${totalBatchQtyUnload}`
//                   );
//                 }

//                 for (const batchInput of batchData) {
//                   const batchQty = parseInt(batchInput.quantity, 10) || 0;

//                   const batchLot = await tx.batch_lots.findFirst({
//                     where: {
//                       batch_number: batchInput.batch_number,
//                       productsId: product.id,
//                       is_active: 'Y',
//                     },
//                   });

//                   if (!batchLot)
//                     throw new Error(
//                       `Batch ${batchInput.batch_number} not found`
//                     );

//                   const vanItem = await tx.van_inventory_items.findFirst({
//                     where: {
//                       product_id: product.id,
//                       batch_lot_id: batchLot.id,
//                       van_inventory_items_inventory: {
//                         user_id: Number(inventoryData.user_id),
//                         is_active: 'Y',
//                         loading_type: 'L',
//                       },
//                     },
//                   });
//                   if (!vanItem)
//                     throw new Error(
//                       `Batch ${batchInput.batch_number} for product ${product.id} not found in van inventory for user ${inventoryData.user_id}`
//                     );
//                   if (vanItem.quantity < batchQty)
//                     throw new Error(`Insufficient van quantity`);

//                   const itemIsCancelled =
//                     item.is_cancelled === 'T' || item.is_cancelled === 'Y';

//                   if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                     const inventoryStock = await tx.inventory_stock.findFirst({
//                       where: {
//                         product_id: product.id,
//                         location_id: inventoryData.location_id || 1,
//                         batch_id: batchLot.id,
//                       },
//                     });

//                     if (inventoryStock) {
//                       const prevCurrent = inventoryStock.current_stock ?? 0;
//                       const prevAvailable = inventoryStock.available_stock ?? 0;
//                       const newCurrent = Math.max(0, prevCurrent - batchQty);
//                       const newAvailable = Math.max(
//                         0,
//                         prevAvailable - batchQty
//                       );
//                       console.log(
//                         `updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} batch=${batchLot.id} -${batchQty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
//                       );
//                       await tx.inventory_stock.update({
//                         where: { id: inventoryStock.id },
//                         data: {
//                           current_stock: newCurrent,
//                           available_stock: newAvailable,
//                           updatedate: new Date(),
//                           updatedby: userId,
//                         },
//                       });
//                     }
//                   }

//                   await tx.van_inventory_items.create({
//                     data: {
//                       parent_id: inventory.id,
//                       sap_lineid: item.sap_lineid || null,
//                       product_id: product.id,
//                       product_name: product.name,
//                       unit: product.product_unit_of_measurement?.name || 'pcs',
//                       quantity: batchQty,
//                       unit_price: Number(item.unit_price || 0),
//                       sap_docnum: sapDocNum,
//                       sap_docentry: sapDocEntry,
//                       source_system: sourceSystem,
//                       is_cancelled:
//                         item.is_cancelled || inventoryData.is_cancelled || 'N',
//                       remarks: item.remarks || inventoryData.remarks || null,
//                       discount_amount: Number(item.discount_amount || 0),
//                       tax_amount: Number(item.tax_amount || 0),
//                       total_amount: batchQty * Number(item.unit_price || 0),
//                       notes: item.notes || null,
//                       batch_lot_id: batchLot.id,
//                     },
//                   });

//                   if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                     await createStockMovement(tx, {
//                       product_id: product.id,
//                       batch_id: batchLot.id,
//                       serial_id: null,
//                       movement_type: 'VAN_UNLOAD',
//                       reference_type: 'VAN_INVENTORY',
//                       reference_id: inventory.id,
//                       from_location_id: null,
//                       to_location_id: null,
//                       quantity: batchQty,
//                       remarks: `Unloaded from van - Batch ${batchLot.batch_number}`,
//                       van_inventory_id: inventory.id,
//                       createdby: userId,
//                     });
//                   }
//                 }
//               } else if (trackingType === 'SERIAL') {
//                 const serialData = item.serials || item.product_serials;

//                 if (
//                   typeof item.quantity !== 'undefined' &&
//                   item.quantity !== null
//                 ) {
//                   const declaredQty = parseInt(item.quantity, 10);
//                   if (
//                     !Number.isNaN(declaredQty) &&
//                     declaredQty !== serialData.length
//                   ) {
//                     throw new Error(
//                       `Quantity mismatch for serial-tracked product "${product.name}": declared quantity ${declaredQty} does not match number of serials ${serialData.length}`
//                     );
//                   }
//                 }

//                 for (const serialInput of serialData) {
//                   const serialNumber =
//                     typeof serialInput === 'string'
//                       ? serialInput
//                       : serialInput.serial_number;

//                   const existingSerial = await tx.serial_numbers.findUnique({
//                     where: { serial_number: serialNumber },
//                   });

//                   if (!existingSerial)
//                     throw new Error(`Serial ${serialNumber} not found`);

//                   const vanItem = await tx.van_inventory_items.findFirst({
//                     where: {
//                       product_id: product.id,
//                       serial_id: existingSerial.id,
//                       quantity: { gt: 0 },
//                       van_inventory_items_inventory: {
//                         user_id: Number(inventoryData.user_id),
//                         is_active: 'Y',
//                       },
//                     },
//                   });

//                   if (!vanItem) {
//                     throw new Error(
//                       `Serial ${serialNumber} not found in any van inventory`
//                     );
//                   }

//                   console.log(
//                     ` Found in van_inventory_items ID: ${vanItem.id}, parent_id: ${vanItem.parent_id}`
//                   );

//                   const vanInventoryId = vanItem.parent_id;

//                   const itemIsCancelled =
//                     item.is_cancelled === 'T' || item.is_cancelled === 'Y';

//                   if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                     try {
//                       const newVanQty = Math.max(
//                         0,
//                         (vanItem.quantity || 0) - 1
//                       );
//                       await tx.van_inventory_items.update({
//                         where: { id: vanItem.id },
//                         data: {
//                           quantity: newVanQty,
//                           total_amount:
//                             newVanQty * Number(vanItem.unit_price || 0),
//                         },
//                       });
//                       console.log(
//                         ` Updated van_inventory_items ID: ${vanItem.id}, quantity: ${vanItem.quantity}→${newVanQty}`
//                       );
//                     } catch (err) {
//                       console.log(
//                         ` Failed updating van_inventory_items ID ${vanItem.id}:`,
//                         err
//                       );
//                     }

//                     try {
//                       await tx.serial_numbers.update({
//                         where: { id: existingSerial.id },
//                         data: {
//                           status: 'available',
//                           location_id: inventoryData.location_id || null,
//                           updatedate: new Date(),
//                           updatedby: userId,
//                         },
//                       });
//                       console.log(
//                         ` Updated serial ${serialNumber} status → available`
//                       );
//                     } catch (err) {
//                       console.log(
//                         ` Failed updating serial ${serialNumber} status:`,
//                         err
//                       );
//                     }

//                     const inventoryStock = await tx.inventory_stock.findFirst({
//                       where: {
//                         product_id: product.id,
//                         serial_number_id: existingSerial.id,
//                       },
//                     });

//                     if (inventoryStock) {
//                       await tx.inventory_stock.update({
//                         where: { id: inventoryStock.id },
//                         data: {
//                           current_stock: Math.max(
//                             0,
//                             (inventoryStock.current_stock || 0) - 1
//                           ),
//                           available_stock: Math.max(
//                             0,
//                             (inventoryStock.available_stock || 0) - 1
//                           ),
//                           updatedate: new Date(),
//                           updatedby: userId,
//                         },
//                       });
//                       console.log(
//                         ` DECREASED inventory_stock for ${serialNumber}`
//                       );
//                     }

//                     await createStockMovement(tx, {
//                       product_id: product.id,
//                       batch_id: null,
//                       serial_id: existingSerial.id,
//                       movement_type: 'VAN_UNLOAD',
//                       reference_type: 'VAN_INVENTORY',
//                       reference_id: inventory.id,
//                       from_location_id: null,
//                       to_location_id: null,
//                       quantity: 1,
//                       remarks: `Sold serial ${serialNumber}`,
//                       van_inventory_id: inventory.id,
//                       createdby: userId,
//                     });
//                   }

//                   await tx.van_inventory_items.create({
//                     data: {
//                       parent_id: inventory.id,
//                       sap_lineid: item.sap_lineid || null,
//                       product_id: product.id,
//                       product_name: product.name,
//                       unit: product.product_unit_of_measurement?.name || 'pcs',
//                       quantity: 1,
//                       sap_docnum: sapDocNum,
//                       sap_docentry: sapDocEntry,
//                       source_system: sourceSystem,
//                       is_cancelled:
//                         item.is_cancelled || inventoryData.is_cancelled || 'N',
//                       remarks: item.remarks || inventoryData.remarks || null,
//                       unit_price: Number(item.unit_price || 0),
//                       discount_amount: Number(item.discount_amount || 0),
//                       tax_amount: Number(item.tax_amount || 0),
//                       total_amount: 1 * Number(item.unit_price || 0),
//                       notes: item.notes || null,
//                       serial_id: existingSerial.id,
//                     },
//                   });
//                 }
//               } else {
//                 const vanItem = await tx.van_inventory_items.findFirst({
//                   where: {
//                     product_id: product.id,
//                     batch_lot_id: null,
//                     serial_id: null,
//                     van_inventory_items_inventory: {
//                       user_id: Number(inventoryData.user_id),
//                       is_active: 'Y',
//                       loading_type: 'L',
//                     },
//                   },
//                 });

//                 if (!vanItem) throw new Error(`Product not found in van`);
//                 if (vanItem.quantity < qty)
//                   throw new Error(`Insufficient van quantity`);

//                 const itemIsCancelled =
//                   item.is_cancelled === 'T' || item.is_cancelled === 'Y';

//                 if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                   const inventoryStock = await tx.inventory_stock.findFirst({
//                     where: {
//                       product_id: product.id,
//                       location_id: inventoryData.location_id || 1,
//                       batch_id: null,
//                       serial_number_id: null,
//                     },
//                   });

//                   if (inventoryStock) {
//                     const prevCurrent = inventoryStock.current_stock ?? 0;
//                     const prevAvailable = inventoryStock.available_stock ?? 0;
//                     const newCurrent = Math.max(0, prevCurrent - qty);
//                     const newAvailable = Math.max(0, prevAvailable - qty);
//                     console.log(
//                       `updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} -${qty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
//                     );
//                     await tx.inventory_stock.update({
//                       where: { id: inventoryStock.id },
//                       data: {
//                         current_stock: newCurrent,
//                         available_stock: newAvailable,
//                         updatedate: new Date(),
//                         updatedby: userId,
//                       },
//                     });
//                   }

//                   await createStockMovement(tx, {
//                     product_id: product.id,
//                     batch_id: null,
//                     serial_id: null,
//                     movement_type: 'VAN_UNLOAD',
//                     reference_type: 'VAN_INVENTORY',
//                     reference_id: inventory.id,
//                     from_location_id: null,
//                     to_location_id: null,
//                     quantity: qty,
//                     remarks: `Sold ${qty} units from van`,
//                     van_inventory_id: inventory.id,
//                     createdby: userId,
//                   });
//                 }

//                 await tx.van_inventory_items.create({
//                   data: {
//                     parent_id: inventory.id,
//                     sap_lineid: item.sap_lineid || null,
//                     product_id: product.id,
//                     product_name: product.name,
//                     unit: product.product_unit_of_measurement?.name || 'pcs',
//                     quantity: qty,
//                     sap_docnum: sapDocNum,
//                     sap_docentry: sapDocEntry,
//                     source_system: sourceSystem,
//                     is_cancelled:
//                       item.is_cancelled || inventoryData.is_cancelled || 'N',
//                     remarks: item.remarks || inventoryData.remarks || null,
//                     unit_price: Number(item.unit_price || 0),
//                     discount_amount: Number(item.discount_amount || 0),
//                     tax_amount: Number(item.tax_amount || 0),
//                     total_amount: qty * Number(item.unit_price || 0),
//                     notes: item.notes || null,
//                     batch_lot_id: null,
//                     serial_id: null,
//                   },
//                 });
//               }
//             }
//           }
//         }
//         const finalInventory = await tx.van_inventory.findUnique({
//           where: { id: inventory.id },
//           include: {
//             van_inventory_users: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 sap_code: true,
//                 employee_id: true,
//               },
//             },
//             vehicle: {
//               select: {
//                 id: true,
//                 vehicle_number: true,
//                 sap_code: true,
//                 type: true,
//                 make: true,
//                 model: true,
//               },
//             },
//             van_inventory_depot: {
//               select: {
//                 id: true,
//                 name: true,
//                 code: true,
//                 sap_code: true,
//                 city: true,
//               },
//             },
//             van_inventory_items_inventory: {
//               include: {
//                 van_inventory_items_products: {
//                   select: {
//                     id: true,
//                     name: true,
//                     code: true,
//                     sap_code: true,
//                     tracking_type: true,

//                     product_unit_of_measurement: {
//                       select: {
//                         id: true,
//                         name: true,
//                         description: true,
//                       },
//                     },

//                     product_tax_master: {
//                       select: {
//                         id: true,
//                         name: true,
//                         code: true,
//                       },
//                     },

//                     product_product_batches: {
//                       select: {
//                         id: true,
//                         quantity: true,
//                         batch_lot_product_batches: {
//                           select: {
//                             id: true,
//                             batch_number: true,
//                             lot_number: true,
//                           },
//                         },
//                       },
//                     },

//                     serial_numbers_products: {
//                       select: {
//                         id: true,
//                         serial_number: true,
//                         status: true,
//                         warranty_expiry: true,
//                         serial_numbers_customers: {
//                           select: {
//                             id: true,
//                             name: true,
//                             code: true,
//                           },
//                         },
//                       },
//                     },
//                   },
//                 },
//                 van_inventory_items_batch_lot: {
//                   select: {
//                     id: true,
//                     batch_number: true,
//                     expiry_date: true,
//                   },
//                 },
//               },
//             },
//             van_inventory_stock_movements: {
//               select: {
//                 id: true,
//                 movement_type: true,
//                 quantity: true,
//                 movement_date: true,
//                 remarks: true,
//               },
//             },
//           },
//         });

//         // return { finalInventory, wasUpdate: isUpdate };
//         const firstItem = finalInventory?.van_inventory_items_inventory?.[0];

//         const result = {
//           finalInventory: {
//             id: finalInventory?.id,
//             user_id: finalInventory?.user_id,
//             last_updated: finalInventory?.last_updated,
//             is_active: finalInventory?.is_active,
//             is_cancelled: finalInventory?.is_cancelled,
//             approval_status: finalInventory?.approval_status,
//             remarks: finalInventory?.remarks,
//             createdate: finalInventory?.createdate,
//             createdby: finalInventory?.createdby,
//             updatedate: finalInventory?.updatedate,
//             updatedby: finalInventory?.updatedby,
//             log_inst: finalInventory?.log_inst,
//             location_id: finalInventory?.location_id,
//             location_type: finalInventory?.location_type,
//             vehicle_id: finalInventory?.vehicle_id,
//             vehicle_code: finalInventory?.vehicle_code,
//             sales_person_code: finalInventory?.sales_person_code,
//             loading_type: finalInventory?.loading_type,
//             status: finalInventory?.status,
//             document_date: finalInventory?.document_date,
//             sale_type: finalInventory?.sale_type,
//             van_inventory_users: finalInventory?.van_inventory_users,
//             vehicle: finalInventory?.vehicle,
//             van_inventory_depot: finalInventory?.van_inventory_depot,
//             van_inventory_items_inventory:
//               finalInventory?.van_inventory_items_inventory?.map(item => ({
//                 id: item.id,
//                 parent_id: item.parent_id,
//                 sap_docnum: item.sap_docnum,
//                 sap_docentry: item.sap_docentry,
//                 source_system: item.source_system,
//                 source_system_label: getSourceSystemLabel(item.source_system),

//                 sap_lineid: item.sap_lineid,
//                 remarks: item.remarks,
//                 sap_item_code: item.sap_item_code,
//                 product_id: item.product_id,
//                 product_name: item.product_name,
//                 unit: item.unit,
//                 batch_lot_id: item.batch_lot_id,
//                 serial_id: item.serial_id,
//                 quantity: item.quantity,
//                 unit_price: item.unit_price,
//                 discount_amount: item.discount_amount,
//                 tax_amount: item.tax_amount,
//                 total_amount: item.total_amount,
//                 notes: item.notes,
//                 is_cancelled: item.is_cancelled,

//                 van_inventory_items_products: item.van_inventory_items_products,
//                 van_inventory_items_batch_lot:
//                   item.van_inventory_items_batch_lot,
//               })),
//             van_inventory_stock_movements:
//               finalInventory?.van_inventory_stock_movements,
//           },
//           wasUpdate: isUpdate,
//         };
//         return result;
//       },
//       {
//         maxWait: 6000000,
//         timeout: 1200000,
//       }
//     );

//     // Create approval request if workflow exists and it's a new or pending update
//     if (workflowExists && finalResult.finalInventory.approval_status === 'P') {
//       const formattedVanInventoryItems = items.map((item: any) => {
//         const product = finalResult.finalInventory.van_inventory_items_inventory?.find(
//           (i: any) => i.sap_item_code === item.product_sap_code
//         )?.van_inventory_items_products;

//         return {
//           product_id: product?.id,
//           product_name: product?.name,
//           tracking_type: product?.tracking_type,
//           quantity: item.quantity,
//           notes: item.notes || item.remarks || '',
//           unit_price: item.unit_price,
//           discount_amount: item.discount_amount || 0,
//           tax_amount: item.tax_amount || 0,
//           total_amount:
//             Number(item.quantity || 0) * Number(item.unit_price || 0) +
//             Number(item.tax_amount || 0) -
//             Number(item.discount_amount || 0),
//           sap_docentry: item.sap_docentry,
//           sap_docnum: item.sap_docnum,
//           sap_lineid: item.sap_lineid,
//           source_system: item.source_system,
//           product_batches:
//             item.batches?.map((b: any) => ({
//               batch_number: b.batch_number,
//               lot_number: b.lot_number || '',
//               manufacturing_date: b.manufacturing_date,
//               expiry_date: b.expiry_date,
//               quantity: b.quantity,
//               remaining_quantity: b.quantity,
//               total_quantity: b.quantity,
//             })) || [],
//           product_serials:
//             item.serials?.map((s: any) => ({
//               serial_number: s.serial_number || s,
//               quantity: s.quantity || 1,
//             })) || [],
//         };
//       });

//       await createRequest({
//         requester_id: Number(inventoryData.user_id),
//         request_type: 'VAN_INVENTORY',
//         reference_id: finalResult.finalInventory.id,
//         request_data: JSON.stringify({
//           ...inventoryData,
//           items,
//           van_inventory_items: formattedVanInventoryItems,
//         }),
//         createdby: userId,
//         log_inst: 1,
//       });
//     }

//     return finalResult;
//   },

//   async processApprovedVanInventoryStock(
//     inventoryId: number,
//     userId: number = 1
//   ) {
//     console.log('processApprovedVanInventoryStock called', {
//       inventoryId,
//       userId,
//     });
//     console.log(
//       `Processing stock operations for approved van inventory ID: ${inventoryId}`
//     );

//     const inventory = await prisma.van_inventory.findUnique({
//       where: { id: Number(inventoryId) },
//     });

//     if (!inventory) {
//       throw new Error(`Van inventory not found with ID: ${inventoryId}`);
//     }

//     const approvalRequest = await prisma.sfa_d_requests.findFirst({
//       where: {
//         request_type: 'VAN_INVENTORY',
//         reference_id: Number(inventoryId),
//       },
//       orderBy: { createdate: 'desc' },
//     });

//     if (!approvalRequest?.request_data) {
//       throw new Error('No approval request found with original payload data');
//     }

//     const originalPayload = JSON.parse(approvalRequest.request_data);
//     const items = originalPayload.items || [];
//     const loadingType = originalPayload.loading_type || 'L';
//     const shouldPerformLoadingUnloading =
//       inventory.approval_status === 'A' && inventory.is_cancelled === 'N';

//     console.log(
//       `shouldPerformLoadingUnloading: ${shouldPerformLoadingUnloading}`
//     );

//     await prisma.$transaction(
//       async tx => {
//         if (loadingType === 'L') {
//           const existingProcessedMovements = await tx.stock_movements.count({
//             where: {
//               reference_type: 'VAN_INVENTORY',
//               reference_id: inventoryId,
//               movement_type: 'VAN_LOAD',
//             },
//           });
//           console.log(
//             ` Existing VAN_LOAD stock movements for this inventory: ${existingProcessedMovements}`
//           );

//           if (existingProcessedMovements > 0) {
//             console.log(
//               ' Skipping: VAN_LOAD stock movements already processed'
//             );
//             return;
//           }
//         } else if (loadingType === 'U') {
//           const existingProcessedMovements = await tx.stock_movements.count({
//             where: {
//               reference_type: 'VAN_INVENTORY',
//               reference_id: inventoryId,
//               movement_type: 'VAN_UNLOAD',
//             },
//           });
//           console.log(
//             ` Existing VAN_UNLOAD stock movements for this inventory: ${existingProcessedMovements}`
//           );

//           if (existingProcessedMovements > 0) {
//             console.log(
//               ' Skipping: VAN_UNLOAD stock movements already processed'
//             );
//             return;
//           }
//         }

//         for (const item of items) {
//           if (!item.product_sap_code) continue;

//           const product = await tx.products.findFirst({
//             where: { sap_code: item.product_sap_code },
//             include: { product_unit_of_measurement: true },
//           });

//           if (!product) {
//             console.warn(
//               `Product with SAP code ${item.product_sap_code} not found, skipping`
//             );
//             continue;
//           }

//           const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
//           const itemIsCancelled =
//             item.is_cancelled === 'T' ||
//             item.is_cancelled === 'Y' ||
//             inventory.is_cancelled === 'Y';

//           const sapDocEntry = item.sap_docentry?.toString() || '';
//           const sapDocNum = item.sap_docnum?.toString() || '';
//           const sourceSystem = item.source_system || '';

//           if (loadingType === 'L') {
//             if (trackingType === 'BATCH') {
//               const batchData = item.batches || item.product_batches;
//               if (
//                 !batchData ||
//                 !Array.isArray(batchData) ||
//                 batchData.length === 0
//               ) {
//                 continue;
//               }

//               for (const batchInput of batchData) {
//                 const batchQty = parseInt(batchInput.quantity, 10) || 0;
//                 if (batchQty <= 0) continue;

//                 let batchLot = await tx.batch_lots.findFirst({
//                   where: {
//                     batch_number: batchInput.batch_number,
//                     productsId: product.id,
//                     is_active: 'Y',
//                     createdby: Number(inventory.user_id),
//                   },
//                 });

//                 if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                   if (batchLot) {
//                     await tx.batch_lots.update({
//                       where: { id: batchLot.id },
//                       data: {
//                         quantity: batchLot.quantity + batchQty,
//                         remaining_quantity:
//                           batchLot.remaining_quantity + batchQty,
//                         updatedate: new Date(),
//                       },
//                     });
//                     console.log(
//                       `Updated batch_lots: ${batchLot.batch_number} (+${batchQty})`
//                     );
//                   } else {
//                     batchLot = await tx.batch_lots.create({
//                       data: {
//                         batch_number: batchInput.batch_number,
//                         lot_number:
//                           batchInput.lot_number || `LOT-${Date.now()}`,
//                         manufacturing_date: batchInput.manufacturing_date
//                           ? new Date(batchInput.manufacturing_date)
//                           : new Date(),
//                         expiry_date: batchInput.expiry_date
//                           ? new Date(batchInput.expiry_date)
//                           : new Date(
//                             new Date().setFullYear(
//                               new Date().getFullYear() + 2
//                             )
//                           ),
//                         quantity: batchQty,
//                         remaining_quantity: batchQty,
//                         supplier_name: batchInput.supplier_name || null,
//                         purchase_price: batchInput.purchase_price || null,
//                         quality_grade: batchInput.quality_grade || 'A',
//                         storage_location: batchInput.storage_location || null,
//                         is_active: 'Y',
//                         createdate: new Date(),
//                         createdby: Number(inventory.user_id),
//                         log_inst: 1,
//                         productsId: product.id,
//                       },
//                     });
//                     console.log(`Created batch_lots: ${batchLot.batch_number}`);
//                   }

//                   const productBatch = await tx.product_batches.findFirst({
//                     where: {
//                       product_id: product.id,
//                       batch_lot_id: batchLot.id,
//                       is_active: 'Y',
//                     },
//                   });

//                   if (productBatch) {
//                     await tx.product_batches.update({
//                       where: { id: productBatch.id },
//                       data: {
//                         quantity: productBatch.quantity + batchQty,
//                         updatedate: new Date(),
//                       },
//                     });
//                   } else {
//                     await tx.product_batches.create({
//                       data: {
//                         product_id: product.id,
//                         batch_lot_id: batchLot.id,
//                         quantity: batchQty,
//                         is_active: 'Y',
//                         createdate: new Date(),
//                         createdby: userId,
//                         log_inst: 1,
//                       },
//                     });
//                   }

//                   await updateInventoryStock(
//                     tx,
//                     product.id,
//                     inventory.location_id,
//                     batchQty,
//                     'L',
//                     batchLot.id,
//                     null,
//                     userId,
//                     inventory.user_id
//                   );

//                   await createStockMovement(tx, {
//                     product_id: product.id,
//                     batch_id: batchLot.id,
//                     serial_id: null,
//                     movement_type: 'VAN_LOAD',
//                     reference_type: 'VAN_INVENTORY',
//                     reference_id: inventoryId,
//                     quantity: batchQty,
//                     remarks: item.remarks || 'Approved stock load',
//                     van_inventory_id: inventoryId,
//                     createdby: userId,
//                   });
//                 }
//               }
//             } else if (trackingType === 'SERIAL') {
//               let serialData: any[] = [];
//               if (Array.isArray(item.serials)) {
//                 serialData = item.serials;
//               } else if (Array.isArray(item.serial_numbers)) {
//                 serialData = item.serial_numbers;
//               }
//               if (!serialData.length) continue;

//               for (const serialInput of serialData) {
//                 const serialNumber =
//                   typeof serialInput === 'string'
//                     ? serialInput
//                     : serialInput.serial_number;
//                 if (!serialNumber) continue;

//                 const existingSerial = await tx.serial_numbers.findFirst({
//                   where: { serial_number: serialNumber },
//                 });

//                 if (!existingSerial) continue;
//                 if (
//                   shouldPerformLoadingUnloading &&
//                   !itemIsCancelled &&
//                   existingSerial.status === 'in_van'
//                 ) {
//                   throw new Error(
//                     `Cannot approve van inventory ID ${inventoryId}: Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`
//                   );
//                 }
//                 if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                   await tx.serial_numbers.update({
//                     where: { id: existingSerial.id },
//                     data: {
//                       status: 'in_van',
//                       location_id: inventory.location_id,
//                       updatedate: new Date(),
//                       updatedby: userId,
//                     },
//                   });
//                   console.log(`Updated serial ${serialNumber} status → in_van`);

//                   await updateInventoryStock(
//                     tx,
//                     product.id,
//                     inventory.location_id,
//                     1,
//                     'L',
//                     null,
//                     existingSerial.id,
//                     userId,
//                     inventory.user_id
//                   );

//                   await createStockMovement(tx, {
//                     product_id: product.id,
//                     batch_id: null,
//                     serial_id: existingSerial.id,
//                     movement_type: 'VAN_LOAD',
//                     reference_type: 'VAN_INVENTORY',
//                     reference_id: inventoryId,
//                     quantity: 1,
//                     remarks: item.remarks || 'Approved serial load',
//                     van_inventory_id: inventoryId,
//                     createdby: userId,
//                   });
//                 }
//               }
//             } else if (trackingType === 'NONE') {
//               const itemQty = parseInt(item.quantity, 10) || 0;
//               if (itemQty <= 0) continue;

//               if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                 await updateInventoryStock(
//                   tx,
//                   product.id,
//                   inventory.location_id,
//                   itemQty,
//                   'L',
//                   null,
//                   null,
//                   userId,
//                   inventory.user_id
//                 );

//                 await createStockMovement(tx, {
//                   product_id: product.id,
//                   batch_id: null,
//                   serial_id: null,
//                   movement_type: 'VAN_LOAD',
//                   reference_type: 'VAN_INVENTORY',
//                   reference_id: inventoryId,
//                   quantity: itemQty,
//                   remarks: item.remarks || 'Approved stock load',
//                   van_inventory_id: inventoryId,
//                   createdby: userId,
//                 });
//               }
//             }
//           } else if (loadingType === 'U') {
//             if (trackingType === 'BATCH') {
//               const batchData = item.batches || item.product_batches;
//               if (
//                 !batchData ||
//                 !Array.isArray(batchData) ||
//                 batchData.length === 0
//               ) {
//                 continue;
//               }

//               for (const batchInput of batchData) {
//                 const batchQty = parseInt(batchInput.quantity, 10) || 0;
//                 if (batchQty <= 0) continue;

//                 const batchLot = await tx.batch_lots.findFirst({
//                   where: {
//                     batch_number: batchInput.batch_number,
//                     productsId: product.id,
//                     is_active: 'Y',
//                   },
//                 });

//                 if (!batchLot) continue;

//                 if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                   await tx.batch_lots.update({
//                     where: { id: batchLot.id },
//                     data: {
//                       quantity: Math.max(0, batchLot.quantity - batchQty),
//                       remaining_quantity: Math.max(
//                         0,
//                         batchLot.remaining_quantity - batchQty
//                       ),
//                       updatedate: new Date(),
//                     },
//                   });

//                   const productBatch = await tx.product_batches.findFirst({
//                     where: {
//                       product_id: product.id,
//                       batch_lot_id: batchLot.id,
//                       is_active: 'Y',
//                     },
//                   });

//                   if (productBatch) {
//                     await tx.product_batches.update({
//                       where: { id: productBatch.id },
//                       data: {
//                         quantity: Math.max(0, productBatch.quantity - batchQty),
//                         updatedate: new Date(),
//                       },
//                     });
//                   }

//                   await updateInventoryStock(
//                     tx,
//                     product.id,
//                     inventory.location_id,
//                     batchQty,
//                     'U',
//                     batchLot.id,
//                     null,
//                     userId,
//                     inventory.user_id
//                   );

//                   await createStockMovement(tx, {
//                     product_id: product.id,
//                     batch_id: batchLot.id,
//                     serial_id: null,
//                     movement_type: 'VAN_UNLOAD',
//                     reference_type: 'VAN_INVENTORY',
//                     reference_id: inventoryId,
//                     quantity: batchQty,
//                     remarks: item.remarks || 'Approved stock unload',
//                     van_inventory_id: inventoryId,
//                     createdby: userId,
//                   });
//                 }
//               }
//             } else if (trackingType === 'SERIAL') {
//               let serialData: any[] = [];
//               if (Array.isArray(item.serials)) {
//                 serialData = item.serials;
//               } else if (Array.isArray(item.serial_numbers)) {
//                 serialData = item.serial_numbers;
//               }
//               if (!serialData.length) continue;

//               for (const serialInput of serialData) {
//                 const serialNumber =
//                   typeof serialInput === 'string'
//                     ? serialInput
//                     : serialInput.serial_number;
//                 if (!serialNumber) continue;

//                 const existingSerial = await tx.serial_numbers.findFirst({
//                   where: { serial_number: serialNumber },
//                 });

//                 if (!existingSerial) continue;

//                 const vanItem = await tx.van_inventory_items.findFirst({
//                   where: {
//                     product_id: product.id,
//                     serial_id: existingSerial.id,
//                     quantity: { gt: 0 },
//                     van_inventory_items_inventory: {
//                       user_id: Number(inventory.user_id),
//                       is_active: 'Y',
//                     },
//                   },
//                 });

//                 if (!vanItem) continue;

//                 if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                   const newVanQty = Math.max(0, (vanItem.quantity || 0) - 1);
//                   await tx.van_inventory_items.update({
//                     where: { id: vanItem.id },
//                     data: {
//                       quantity: newVanQty,
//                       total_amount: newVanQty * Number(vanItem.unit_price || 0),
//                     },
//                   });

//                   await tx.serial_numbers.update({
//                     where: { id: existingSerial.id },
//                     data: {
//                       status: 'available',
//                       location_id: inventory.location_id,
//                       updatedate: new Date(),
//                       updatedby: userId,
//                     },
//                   });

//                   await updateInventoryStock(
//                     tx,
//                     product.id,
//                     inventory.location_id,
//                     1,
//                     'U',
//                     null,
//                     existingSerial.id,
//                     userId,
//                     inventory.user_id
//                   );

//                   await createStockMovement(tx, {
//                     product_id: product.id,
//                     batch_id: null,
//                     serial_id: existingSerial.id,
//                     movement_type: 'VAN_UNLOAD',
//                     reference_type: 'VAN_INVENTORY',
//                     reference_id: inventoryId,
//                     quantity: 1,
//                     remarks: item.remarks || 'Approved serial unload',
//                     van_inventory_id: inventoryId,
//                     createdby: userId,
//                   });
//                 }
//               }
//             } else if (trackingType === 'NONE') {
//               const itemQty = parseInt(item.quantity, 10) || 0;
//               if (itemQty <= 0) continue;

//               if (shouldPerformLoadingUnloading && !itemIsCancelled) {
//                 await updateInventoryStock(
//                   tx,
//                   product.id,
//                   inventory.location_id,
//                   itemQty,
//                   'U',
//                   null,
//                   null,
//                   userId,
//                   inventory.user_id
//                 );

//                 await createStockMovement(tx, {
//                   product_id: product.id,
//                   batch_id: null,
//                   serial_id: null,
//                   movement_type: 'VAN_UNLOAD',
//                   reference_type: 'VAN_INVENTORY',
//                   reference_id: inventoryId,
//                   quantity: itemQty,
//                   remarks: item.remarks || 'Approved stock unload',
//                   van_inventory_id: inventoryId,
//                   createdby: userId,
//                 });
//               }
//             }
//           }
//         }
//       },
//       {
//         maxWait: 6000000,
//         timeout: 300000,
//       }
//     );

//     console.log(
//       `Successfully processed stock operations for van inventory ID: ${inventoryId}`
//     );
//   },
// };


import prisma from '../../configs/prisma.client';
import { createRequest } from '../controllers/requests.controller';

async function updateInventoryStock(
  tx: any,
  productId: number,
  locationId: number | null,
  quantity: number,
  loadingType: string,
  batchId?: number | null,
  serialId?: number | null,
  userId?: number,
  vanUserId?: number | null
): Promise<void> {
  let validLocationId = locationId;
  let salespersonId: number | null = vanUserId || null;
  if (!validLocationId) {
    const targetUserId = vanUserId || userId || 1;
    const user = await tx.users.findUnique({ where: { id: targetUserId } });
    const depotName = `Van - ${user?.name || targetUserId}`;
    let vanDepot = await tx.depots.findFirst({ where: { name: depotName } });

    if (!vanDepot) {
      const parentDepot = await tx.depots.findFirst({ orderBy: { id: 'asc' } });
      vanDepot = await tx.depots.create({
        data: {
          parent_id: parentDepot ? parentDepot.parent_id : 1,
          name: depotName,
          code: `VAN-${targetUserId}`,
          is_active: 'Y',
          createdby: userId || 1,
        },
      });
    }
    validLocationId = vanDepot.id;
  }

  const whereClause: any = {
    product_id: productId,
    location_id: validLocationId,
  };

  if (batchId !== null) whereClause.batch_id = batchId;
  if (serialId !== null) whereClause.serial_number_id = serialId;

  const existingStock = await tx.inventory_stock.findFirst({
    where: whereClause,
  });

  if (loadingType === 'L') {
    if (existingStock) {
      const prevCurrent = existingStock.current_stock ?? 0;
      const prevAvailable = existingStock.available_stock ?? 0;
      const newCurrent = prevCurrent + quantity;
      const newAvailable = prevAvailable + quantity;
      console.log(
        `updateInventoryStock LOAD: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} +${quantity} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
      );
      await tx.inventory_stock.update({
        where: { id: existingStock.id },
        data: {
          current_stock: newCurrent,
          available_stock: newAvailable,
          updatedate: new Date(),
          updatedby: userId,
        },
      });
    } else {
      console.log(
        `updateInventoryStock CREATE: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} set current ${quantity} available ${quantity}`
      );
      await tx.inventory_stock.create({
        data: {
          product_id: productId,
          location_id: validLocationId,
          salesperson_id: salespersonId,
          current_stock: quantity,
          reserved_stock: 0,
          available_stock: quantity,
          minimum_stock: 0,
          maximum_stock: 0,
          batch_id: batchId || null,
          serial_number_id: serialId || null,
          is_active: 'Y',
          createdate: new Date(),
          createdby: userId || 1,
          log_inst: 1,
        },
      });
    }
  } else if (loadingType === 'U') {
    if (existingStock) {
      const prevCurrent = existingStock.current_stock ?? 0;
      const prevAvailable = existingStock.available_stock ?? 0;
      const newCurrentStock = Math.max(0, prevCurrent - quantity);
      const newAvailableStock = Math.max(0, prevAvailable - quantity);
      console.log(
        `updateInventoryStock UNLOAD: product=${productId} location=${validLocationId} batch=${batchId} serial=${serialId} -${quantity} current ${prevCurrent}→${newCurrentStock} available ${prevAvailable}→${newAvailableStock}`
      );
      await tx.inventory_stock.update({
        where: { id: existingStock.id },
        data: {
          current_stock: newCurrentStock,
          available_stock: newAvailableStock,
          updatedate: new Date(),
          updatedby: userId,
        },
      });
    }
    return;
  } else {
    throw new Error(`Invalid loading type: ${loadingType}`);
  }
}

async function createStockMovement(
  tx: any,
  data: {
    product_id: number;
    batch_id?: number | null;
    serial_id?: number | null;
    movement_type: string;
    reference_type: string;
    reference_id: number;
    from_location_id?: number | null;
    to_location_id?: number | null;
    quantity: number;
    remarks?: string;
    van_inventory_id?: number;
    createdby: number;
  }
): Promise<void> {
  await tx.stock_movements.create({
    data: {
      product_id: data.product_id,
      batch_id: data.batch_id ?? null,
      serial_id: data.serial_id ?? null,
      movement_type: data.movement_type,
      reference_type: data.reference_type,
      reference_id: data.reference_id,
      from_location_id: data.from_location_id ?? null,
      to_location_id: data.to_location_id ?? null,
      quantity: data.quantity,
      movement_date: new Date(),
      remarks: data.remarks || null,
      is_active: 'Y',
      createdate: new Date(),
      createdby: data.createdby,
      log_inst: 1,
      van_inventory_id: data.van_inventory_id ?? null,
    },
  });
}

const SOURCE_SYSTEM_LABELS: Record<string, string> = {
  sap_arinvoice: 'AR Invoice',
  sap_inventorytrf: 'Inventory Transfer',
};

const getSourceSystemLabel = (
  sourceSystem: string | null | undefined
): string | null => {
  if (!sourceSystem) return null;
  const key = sourceSystem.toLowerCase();
  return SOURCE_SYSTEM_LABELS[key] || sourceSystem;
};

export const sapService = {
  async createOrUpdateVanInventorySAP(payload: any, userId: number = 1) {
    const { van_inventory_items, inventoryItems, ...inventoryData } = payload;

    const items = van_inventory_items || inventoryItems || payload.items || [];
    let inventoryId = inventoryData.id;
    let loadingType = inventoryData.loading_type || 'L';
    if (!['L', 'U'].includes(loadingType.toUpperCase())) {
      loadingType = 'L';
    }

    if (!inventoryData.salesman_sap_code) {
      throw new Error('salesman_sap_code is required');
    }

    const spUser = await prisma.users.findFirst({
      where: { sap_code: inventoryData.salesman_sap_code },
    });

    if (!spUser) {
      throw new Error(
        `Salesman with SAP code ${inventoryData.salesman_sap_code} not found`
      );
    }
    inventoryData.user_id = spUser.id;

    let workflowExists = false;
    const requesterZoneId = spUser.zone_id;
    const requesterDepotId = spUser.depot_id;

    if (requesterZoneId && requesterDepotId) {
      const zoneDepotWorkflow = await prisma.approval_work_flow.findMany({
        where: {
          request_type: 'VAN_INVENTORY',
          zone_id: requesterZoneId,
          depot_id: requesterDepotId,
          is_active: 'Y',
        },
      });
      if (zoneDepotWorkflow.length > 0) workflowExists = true;
    }

    if (!workflowExists && requesterZoneId) {
      const zoneWorkflow = await prisma.approval_work_flow.findMany({
        where: {
          request_type: 'VAN_INVENTORY',
          zone_id: requesterZoneId,
          depot_id: null,
          is_active: 'Y',
        },
      });
      if (zoneWorkflow.length > 0) workflowExists = true;
    }

    if (!workflowExists && requesterDepotId) {
      const depotWorkflow = await prisma.approval_work_flow.findMany({
        where: {
          request_type: 'VAN_INVENTORY',
          zone_id: null,
          depot_id: requesterDepotId,
          is_active: 'Y',
        },
      });
      if (depotWorkflow.length > 0) workflowExists = true;
    }

    if (!workflowExists) {
      const globalWorkflow = await prisma.approval_work_flow.findMany({
        where: {
          request_type: 'VAN_INVENTORY',
          zone_id: null,
          depot_id: null,
          is_active: 'Y',
        },
      });
      if (globalWorkflow.length > 0) workflowExists = true;
    }

    const finalResult = await prisma.$transaction(
      async tx => {
        let inventory;
        let isUpdate = false;
        let existingInventoryToCheck: any = null;

        if (inventoryId) {
          const existingInventory = await tx.van_inventory.findUnique({
            where: { id: Number(inventoryId) },
          });

          if (existingInventory) {
            isUpdate = true;
            existingInventoryToCheck = existingInventory;
          }
        }

        if (
          !workflowExists &&
          (!isUpdate || existingInventoryToCheck?.approval_status === 'P')
        ) {
          inventoryData.approval_status = 'A';
        }

        const docDate = inventoryData.document_date
          ? new Date(inventoryData.document_date)
          : new Date();

        const normalizedDocDate = new Date(
          docDate.getFullYear(),
          docDate.getMonth(),
          docDate.getDate()
        );

        if (!inventoryId) {
          const existingAnyInventory = await tx.van_inventory.findFirst({
            where: {
              user_id: Number(inventoryData.user_id),
              loading_type: loadingType,
              document_date: {
                gte: new Date(
                  normalizedDocDate.getFullYear(),
                  normalizedDocDate.getMonth(),
                  normalizedDocDate.getDate()
                ),
                lt: new Date(
                  normalizedDocDate.getFullYear(),
                  normalizedDocDate.getMonth(),
                  normalizedDocDate.getDate() + 1
                ),
              },
            },
            orderBy: {
              createdate: 'desc',
            },
          });

          if (existingAnyInventory) {
            inventoryData.user_id = existingAnyInventory.user_id;
            const effectiveApprovalStatus =
              existingAnyInventory.approval_status || 'P';
            if (effectiveApprovalStatus === 'P' || loadingType === 'U') {
              inventoryId = existingAnyInventory.id;
              isUpdate = true;
              existingInventoryToCheck = existingAnyInventory;
            } else {
              throw new Error(
                `Cannot create new van inventory. There is already an existing inventory (ID: ${existingAnyInventory.id}) with approval_status '${effectiveApprovalStatus}' for this user and document date. Only pending (P) inventories or unloading operations are allowed.`
              );
            }
          } else {
            if (!inventoryData.user_id) {
              inventoryData.user_id = userId;
            }
          }
        }

        let depot;
        if (inventoryData.depot_sap_code) {
          depot = await tx.depots.findFirst({
            where: { sap_code: inventoryData.depot_sap_code },
          });
          if (!depot) {
            throw new Error(
              `Depot with SAP code ${inventoryData.depot_sap_code} not found`
            );
          }
        } else {
          depot = await tx.depots.findFirst({
            where: { name: { contains: 'MOSHI' } },
          });
          if (!depot) {
            throw new Error(
              'depot_sap_code is missing and default MOSHI depot was not found'
            );
          }
        }
        inventoryData.location_id = depot.id;

        if (isUpdate && existingInventoryToCheck && loadingType !== 'U') {
          const effectiveApprovalStatus =
            existingInventoryToCheck.approval_status || 'P';
          if (effectiveApprovalStatus !== 'P') {
            throw new Error(
              `Cannot edit van inventory with approval_status '${effectiveApprovalStatus}'. Only pending (P) inventories or unloading operations are allowed.`
            );
          }
        }

        if (inventoryData.vehicle_sap_code) {
          const vehicleExists = await tx.vehicles.findFirst({
            where: { sap_code: inventoryData.vehicle_sap_code },
          });
          if (!vehicleExists) {
            throw new Error(
              `Vehicle with SAP code ${inventoryData.vehicle_sap_code} not found`
            );
          }
          inventoryData.vehicle_id = vehicleExists.id;
        }

        const payload = {
          user_id: Number(inventoryData.user_id),
          is_cancelled: inventoryData.is_cancelled || 'N',
          approval_status: inventoryData.approval_status || 'P',
          remarks: inventoryData.remarks || null,
          status: inventoryData.status || 'A',
          loading_type: loadingType,
          document_date: inventoryData.document_date
            ? new Date(inventoryData.document_date)
            : new Date(),
          vehicle_id: inventoryData.vehicle_id
            ? Number(inventoryData.vehicle_id)
            : null,
          vehicle_code:
            inventoryData.vehicle_sap_code ||
            inventoryData.vehicle_code ||
            null,
          sales_person_code:
            inventoryData.salesman_sap_code ||
            inventoryData.sales_person_code ||
            null,
          location_type: inventoryData.location_type || 'van',
          location_id: inventoryData.location_id
            ? Number(inventoryData.location_id)
            : null,
          is_active: inventoryData.is_active || 'Y',
        };

        if (isUpdate && inventoryId) {
          inventory = await tx.van_inventory.update({
            where: { id: Number(inventoryId) },
            data: {
              ...payload,
              updatedby: userId,
              updatedate: new Date(),
              log_inst: { increment: 1 },
            },
          });
        } else {
          inventory = await tx.van_inventory.create({
            data: {
              ...payload,
              createdby: userId,
              createdate: new Date(),
              log_inst: 1,
            },
          });
          inventoryId = inventory.id;
        }

        const shouldPerformLoadingUnloading =
          payload.approval_status === 'A' && payload.is_cancelled === 'N';

        if (isUpdate && inventoryId && loadingType === 'L') {
          await tx.van_inventory_items.deleteMany({
            where: { parent_id: Number(inventoryId) },
          });
        }

        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            const qty = parseInt(item.quantity, 10) || 0;

            if (!item.product_sap_code) {
              throw new Error('product_sap_code is required for each item');
            }
            if (!item.source_system) {
              throw new Error('source_system is required for each item');
            }

            if (!item.sap_docentry) {
              throw new Error('sap_docentry is required for each item');
            }

            if (!item.sap_docnum) {
              throw new Error('sap_docnum is required for each item');
            }

            if (!item.sap_lineid) {
              throw new Error('sap_lineid is required for each item');
            }

            const sapDocEntry = item.sap_docentry.toString();
            const sapDocNum = item.sap_docnum.toString();
            const sapLineid = item.sap_lineid.toString();
            const sourceSystem = item.source_system;
            const compositeKey = `${sourceSystem}_${sapDocEntry}_${sapLineid}`;
            const existingSapDoc = await tx.van_inventory_items.findFirst({
              where: {
                source_system: sourceSystem,
                sap_docentry: sapDocEntry,
                sap_lineid: sapLineid,
                ...(isUpdate && inventoryId
                  ? {
                    NOT: {
                      parent_id: Number(inventoryId),
                    },
                  }
                  : {}),
              },
            });

            if (existingSapDoc) {
              throw new Error(`SAP document already imported: ${compositeKey}`);
            }
            const product = await tx.products.findFirst({
              where: { sap_code: item.product_sap_code },
              include: { product_unit_of_measurement: true },
            });

            if (!product) {
              throw new Error(
                `Product with SAP code ${item.product_sap_code} not found`
              );
            }

            const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
            const itemIsCancelled =
              item.is_cancelled === 'T' || item.is_cancelled === 'Y';

            const batchData = item.batches || item.product_batches;
            const serialData = item.serials || item.product_serials;
            if (trackingType === 'BATCH') {
              if (
                !batchData ||
                !Array.isArray(batchData) ||
                batchData.length === 0
              ) {
                throw new Error(
                  `Batches are required for batch-tracked product ${product.name}`
                );
              }

              for (const batchInput of batchData) {
                if (!batchInput.batch_number) {
                  throw new Error(
                    `Batch number is required for each batch for product "${product.name}"`
                  );
                }
              }

              const totalBatchQty = (batchData || []).reduce(
                (acc: number, b: any) => acc + (parseInt(b.quantity, 10) || 0),
                0
              );
              if (
                typeof item.quantity === 'undefined' ||
                item.quantity === null
              ) {
                throw new Error(
                  `Quantity is required for batch-tracked product "${product.name}" when batches are provided`
                );
              }
              const declaredQty = parseInt(item.quantity, 10);
              if (Number.isNaN(declaredQty) || declaredQty !== totalBatchQty) {
                throw new Error(
                  `Quantity mismatch for batch-tracked product "${product.name}": declared quantity ${item.quantity} does not match sum of batches ${totalBatchQty}`
                );
              }
            } else if (trackingType === 'SERIAL') {
              if (
                !serialData ||
                !Array.isArray(serialData) ||
                serialData.length === 0
              ) {
                throw new Error(
                  `Serial numbers are required for serial-tracked product "${product.name}"`
                );
              }

              if (
                typeof item.quantity !== 'undefined' &&
                item.quantity !== null
              ) {
                const declaredQty = parseInt(item.quantity, 10);
                if (
                  !Number.isNaN(declaredQty) &&
                  declaredQty !== serialData.length
                ) {
                  throw new Error(
                    `Quantity mismatch for serial-tracked product "${product.name}": declared quantity ${declaredQty} does not match number of serials ${serialData.length}`
                  );
                }
              }

              for (const serialInput of serialData) {
                const serialNumber =
                  typeof serialInput === 'string'
                    ? serialInput
                    : serialInput?.serial_number;
                if (!serialNumber) {
                  throw new Error('Serial number is required');
                }
              }
            }

            if (loadingType === 'L') {
              if (trackingType === 'BATCH') {
                for (const batchInput of batchData) {
                  const batchQty = parseInt(batchInput.quantity, 10) || 0;

                  if (batchQty <= 0) {
                    throw new Error('Batch quantity must be greater than 0');
                  }

                  if (batchQty <= 0) {
                    throw new Error('Batch quantity must be greater than 0');
                  }

                  if (batchQty <= 0) {
                    throw new Error('Batch quantity must be greater than 0');
                  }

                  let batchLot: any = null;
                  let productBatch: any = null;

                  batchLot = await tx.batch_lots.findFirst({
                    where: {
                      batch_number: batchInput.batch_number,
                      productsId: product.id,
                      is_active: 'Y',
                      createdby: Number(inventoryData.user_id),
                    },
                  });

                  if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                    if (batchLot) {
                      await tx.batch_lots.update({
                        where: { id: batchLot.id },
                        data: {
                          quantity: batchLot.quantity + batchQty,
                          remaining_quantity:
                            batchLot.remaining_quantity + batchQty,
                          updatedate: new Date(),
                        },
                      });
                      console.log(
                        ` Updated batch_lots: ${batchLot.batch_number}`
                      );
                    } else {
                      batchLot = await tx.batch_lots.create({
                        data: {
                          batch_number: batchInput.batch_number,
                          lot_number:
                            batchInput.lot_number || `LOT-${Date.now()}`,
                          manufacturing_date: batchInput.manufacturing_date
                            ? new Date(batchInput.manufacturing_date)
                            : new Date(),
                          expiry_date: batchInput.expiry_date
                            ? new Date(batchInput.expiry_date)
                            : new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() + 2
                              )
                            ),
                          quantity: batchQty,
                          remaining_quantity: batchQty,
                          supplier_name: batchInput.supplier_name || null,
                          purchase_price: batchInput.purchase_price || null,
                          quality_grade: batchInput.quality_grade || 'A',
                          storage_location: batchInput.storage_location || null,
                          is_active: 'Y',
                          createdate: new Date(),
                          createdby: Number(inventoryData.user_id),
                          log_inst: 1,
                          productsId: product.id,
                        },
                      });
                      console.log(
                        ` Created batch_lots: ${batchLot.batch_number}`
                      );
                    }

                    productBatch = await tx.product_batches.findFirst({
                      where: {
                        product_id: product.id,
                        batch_lot_id: batchLot.id,
                        is_active: 'Y',
                      },
                    });

                    if (productBatch) {
                      await tx.product_batches.update({
                        where: { id: productBatch.id },
                        data: {
                          quantity: productBatch.quantity + batchQty,
                          updatedate: new Date(),
                        },
                      });
                      console.log(` Updated product_batches: +${batchQty}`);
                    } else {
                      await tx.product_batches.create({
                        data: {
                          product_id: product.id,
                          batch_lot_id: batchLot.id,
                          quantity: batchQty,
                          is_active: 'Y',
                          createdate: new Date(),
                          createdby: userId,
                          log_inst: 1,
                        },
                      });
                      console.log(` Created product_batches`);
                    }
                  } else {
                    if (!batchLot) {
                      batchLot = await tx.batch_lots.create({
                        data: {
                          batch_number: batchInput.batch_number,
                          lot_number:
                            batchInput.lot_number || `LOT-${Date.now()}`,
                          manufacturing_date: batchInput.manufacturing_date
                            ? new Date(batchInput.manufacturing_date)
                            : new Date(),
                          expiry_date: batchInput.expiry_date
                            ? new Date(batchInput.expiry_date)
                            : new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() + 2
                              )
                            ),
                          quantity: 0,
                          remaining_quantity: 0,
                          supplier_name: batchInput.supplier_name || null,
                          purchase_price: batchInput.purchase_price || null,
                          quality_grade: batchInput.quality_grade || 'A',
                          storage_location: batchInput.storage_location || null,
                          is_active: 'Y',
                          createdate: new Date(),
                          createdby: Number(inventoryData.user_id),
                          log_inst: 1,
                          productsId: product.id,
                        },
                      });
                    }
                  }

                  // const existingVanItem =
                  //   await tx.van_inventory_items.findFirst({
                  //     where: {
                  //       product_id: product.id,
                  //       batch_lot_id: batchLot.id,
                  //       van_inventory_items_inventory: {
                  //         user_id: inventoryData.user_id,
                  //         is_active: 'Y',
                  //       },
                  //     },
                  //     include: {
                  //       van_inventory_items_inventory: true,
                  //     },
                  //   });
                  await tx.van_inventory_items.create({
                    data: {
                      parent_id: inventory.id,
                      sap_lineid: item.sap_lineid || null,
                      sap_item_code:
                        item.product_sap_code || item.sap_item_code || null,
                      product_id: product.id,
                      product_name: product.name,
                      unit:
                        product.product_unit_of_measurement?.name || 'pcs',
                      quantity: batchQty,
                      sap_docnum: sapDocNum,
                      sap_docentry: sapDocEntry,
                      source_system: sourceSystem,
                      is_cancelled:
                        item.is_cancelled ||
                        inventoryData.is_cancelled ||
                        'N',
                      remarks: item.remarks || inventoryData.remarks || null,
                      unit_price: Number(item.unit_price || 0),
                      discount_amount: Number(item.discount_amount || 0),
                      tax_amount: Number(item.tax_amount || 0),
                      total_amount: batchQty * Number(item.unit_price || 0),
                      notes: item.notes || null,
                      batch_lot_id: batchLot.id,
                    },
                  });
                  console.log(` Created van_inventory_items`);

                  if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                    await updateInventoryStock(
                      tx,
                      product.id,
                      inventoryData.location_id || null,
                      batchQty,
                      'L',
                      batchLot.id,
                      null,
                      userId,
                      inventoryData.user_id
                    );

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: batchLot.id,
                      serial_id: null,
                      movement_type: 'VAN_LOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: null,
                      quantity: batchQty,
                      remarks: `Loaded to van - Batch ${batchLot.batch_number}`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });
                  }
                }
              } else if (trackingType === 'SERIAL') {
                const serialData = item.serials || item.product_serials;
                console.log(` Product: ${product.name}, ID: ${product.id}`);

                for (const serialInput of serialData) {
                  const serialNumber =
                    typeof serialInput === 'string'
                      ? serialInput
                      : serialInput.serial_number;

                  let existingSerial = await tx.serial_numbers.findUnique({
                    where: { serial_number: serialNumber },
                  });

                  if (existingSerial && existingSerial.status === 'in_van') {
                    throw new Error(
                      `Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`
                    );
                  }
                  if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                    if (existingSerial) {
                      if (existingSerial.status === 'in_van') {
                        throw new Error(
                          `Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`
                        );
                      }

                      await tx.serial_numbers.update({
                        where: { id: existingSerial.id },
                        data: {
                          status: 'in_van',
                          location_id: null,
                          updatedate: new Date(),
                          updatedby: userId,
                        },
                      });
                      console.log(
                        ` Updated serial ${serialNumber} status → in_van`
                      );
                    } else {
                      existingSerial = await tx.serial_numbers.create({
                        data: {
                          product_id: product.id,
                          serial_number: serialNumber,
                          batch_id: serialInput.batch_id || null,
                          status: 'in_van',
                          location_id: null,
                          warranty_expiry: serialInput.warranty_expiry
                            ? new Date(serialInput.warranty_expiry)
                            : null,
                          customer_id: serialInput.customer_id || null,
                          is_active: 'Y',
                          createdate: new Date(),
                          createdby: userId,
                          log_inst: 1,
                        },
                      });
                      console.log(` Created new serial ${serialNumber}`);
                    }
                  } else {
                    if (!existingSerial) {
                      existingSerial = await tx.serial_numbers.create({
                        data: {
                          product_id: product.id,
                          serial_number: serialNumber,
                          batch_id: serialInput.batch_id || null,
                          status: 'available',
                          location_id: null,
                          warranty_expiry: serialInput.warranty_expiry
                            ? new Date(serialInput.warranty_expiry)
                            : null,
                          customer_id: serialInput.customer_id || null,
                          is_active: 'Y',
                          createdate: new Date(),
                          createdby: userId,
                          log_inst: 1,
                        },
                      });
                    }
                  }

                  // const existingVanItem =
                  //   await tx.van_inventory_items.findFirst({
                  //     where: {
                  //       product_id: product.id,
                  //       serial_id: existingSerial.id,
                  //       van_inventory_items_inventory: {
                  //         user_id: inventoryData.user_id,
                  //         is_active: 'Y',
                  //       },
                  //     },
                  //     include: {
                  //       van_inventory_items_inventory: true,
                  //     },
                  //   });

                  console.log(`Creating new serial item`, {
                    serial: serialNumber,
                    quantity: 1,
                  });
                  await tx.van_inventory_items.create({
                    data: {
                      parent_id: inventory.id,
                      sap_lineid: item.sap_lineid || null,
                      sap_item_code:
                        item.product_sap_code || item.sap_item_code || null,
                      product_id: product.id,
                      product_name: product.name,
                      unit:
                        product.product_unit_of_measurement?.name || 'pcs',
                      quantity: 1,
                      sap_docnum: sapDocNum,
                      sap_docentry: sapDocEntry,
                      source_system: sourceSystem,
                      is_cancelled:
                        item.is_cancelled ||
                        inventoryData.is_cancelled ||
                        'N',
                      remarks: item.remarks || inventoryData.remarks || null,
                      unit_price: Number(item.unit_price || 0),
                      discount_amount: Number(item.discount_amount || 0),
                      tax_amount: Number(item.tax_amount || 0),
                      total_amount: 1 * Number(item.unit_price || 0),
                      notes: item.notes || null,
                      serial_id: existingSerial.id,
                    },
                  });
                  console.log(
                    `Created new van_inventory_items for serial ${serialNumber}`
                  );

                  if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                    await updateInventoryStock(
                      tx,
                      product.id,
                      inventoryData.location_id || null,
                      1,
                      'L',
                      null,
                      existingSerial.id,
                      userId,
                      inventoryData.user_id
                    );
                    console.log(
                      ` INCREASED inventory_stock for serial ${serialNumber}`
                    );

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: null,
                      serial_id: existingSerial.id,
                      movement_type: 'VAN_LOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: null,
                      quantity: 1,
                      remarks: `Loaded serial ${serialNumber} to van`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });
                    console.log(
                      ` Created VAN_LOAD stock movement for ${serialNumber}`
                    );
                  }
                }
              } else {
                if (qty <= 0) {
                  throw new Error(
                    'Quantity must be greater than 0 for NONE-tracked product'
                  );
                }
                await tx.van_inventory_items.create({
                  data: {
                    parent_id: inventory.id,
                    sap_lineid: item.sap_lineid || null,
                    sap_item_code:
                      item.product_sap_code || item.sap_item_code || null,
                    product_id: product.id,
                    product_name: product.name,
                    unit: product.product_unit_of_measurement?.name || 'pcs',
                    quantity: qty,
                    unit_price: Number(item.unit_price || 0),
                    discount_amount: Number(item.discount_amount || 0),
                    sap_docnum: sapDocNum,
                    sap_docentry: sapDocEntry,
                    source_system: sourceSystem,
                    is_cancelled:
                      item.is_cancelled || inventoryData.is_cancelled || 'N',
                    remarks: item.remarks || inventoryData.remarks || null,
                    tax_amount: Number(item.tax_amount || 0),
                    total_amount: qty * Number(item.unit_price || 0),
                    notes: item.notes || null,
                    batch_lot_id: null,
                    serial_id: null,
                  },
                });
                console.log(`    Created van_inventory_items`);

                const itemIsCancelled =
                  item.is_cancelled === 'T' || item.is_cancelled === 'Y';

                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                  await updateInventoryStock(
                    tx,
                    product.id,
                    inventoryData.location_id || null,
                    qty,
                    'L',
                    null,
                    null,
                    userId,
                    inventoryData.user_id
                  );
                  console.log(`    Updated inventory_stock`);

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: null,
                    serial_id: null,
                    movement_type: 'VAN_LOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventory.id,
                    from_location_id: null,
                    to_location_id: null,
                    quantity: qty,
                    remarks: `Loaded ${qty} units to van`,
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });

                  console.log(
                    ` Loaded ${qty} units of NONE-tracked product ${product.name}\n`
                  );
                }
              }
              // } else if (loadingType === 'U') {
              //   if (trackingType === 'BATCH') {
              //     const batchData = item.batches || item.product_batches;

              //     if (
              //       !batchData ||
              //       !Array.isArray(batchData) ||
              //       batchData.length === 0
              //     ) {
              //       throw new Error(
              //         `Batches are required for batch-tracked product ${product.name}`
              //       );
              //     }

              //     const totalBatchQtyUnload = (batchData || []).reduce(
              //       (acc: number, b: any) =>
              //         acc + (parseInt(b.quantity, 10) || 0),
              //       0
              //     );
              //     if (
              //       typeof item.quantity === 'undefined' ||
              //       item.quantity === null
              //     ) {
              //       throw new Error(
              //         `Quantity is required for batch-tracked product "${product.name}" when batches are provided`
              //       );
              //     }
              //     const declaredQtyUnload = parseInt(item.quantity, 10);
              //     if (
              //       Number.isNaN(declaredQtyUnload) ||
              //       declaredQtyUnload !== totalBatchQtyUnload
              //     ) {
              //       throw new Error(
              //         `Quantity mismatch for batch-tracked product "${product.name}": declared quantity ${item.quantity} does not match sum of batches ${totalBatchQtyUnload}`
              //       );
              //     }

              //     for (const batchInput of batchData) {
              //       const batchQty = parseInt(batchInput.quantity, 10) || 0;

              //       const batchLot = await tx.batch_lots.findFirst({
              //         where: {
              //           batch_number: batchInput.batch_number,
              //           productsId: product.id,
              //           is_active: 'Y',
              //         },
              //       });

              //       if (!batchLot)
              //         throw new Error(
              //           `Batch ${batchInput.batch_number} not found`
              //         );

              //       const vanItem = await tx.van_inventory_items.findFirst({
              //         where: {
              //           product_id: product.id,
              //           batch_lot_id: batchLot.id,
              //           van_inventory_items_inventory: {
              //             user_id: Number(inventoryData.user_id),
              //             is_active: 'Y',
              //             loading_type: 'L',
              //           },
              //         },
              //       });
              //       if (!vanItem)
              //         throw new Error(
              //           `Batch ${batchInput.batch_number} for product ${product.id} not found in van inventory for user ${inventoryData.user_id}`
              //         );
              //       if (vanItem.quantity < batchQty)
              //         throw new Error(`Insufficient van quantity`);

              //       // await tx.van_inventory_items.update({
              //       //   where: { id: vanItem.id },
              //       //   data: {
              //       //     quantity: vanItem.quantity - batchQty,
              //       //     total_amount:
              //       //       (vanItem.quantity - batchQty) *
              //       //       Number(vanItem.unit_price || 0),
              //       //   },
              //       // });

              //       // await tx.batch_lots.update({
              //       //   where: { id: batchLot.id },
              //       //   data: {
              //       //     remaining_quantity:
              //       //       batchLot.remaining_quantity - batchQty,
              //       //     updatedate: new Date(),
              //       //   },
              //       // });

              //       // const productBatch = await tx.product_batches.findFirst({
              //       //   where: {
              //       //     product_id: product.id,
              //       //     batch_lot_id: batchLot.id,
              //       //     is_active: 'Y',
              //       //   },
              //       // });

              //       // if (productBatch) {
              //       //   await tx.product_batches.update({
              //       //     where: { id: productBatch.id },
              //       //     data: {
              //       //       quantity: productBatch.quantity - batchQty,
              //       //       updatedate: new Date(),
              //       //     },
              //       //   });
              //       // }

              //       // Check if we should perform unloading operations for this item
              //       const itemIsCancelled =
              //         item.is_cancelled === 'T' || item.is_cancelled === 'Y';

              //       if (shouldPerformLoadingUnloading && !itemIsCancelled) {
              //         const inventoryStock = await tx.inventory_stock.findFirst({
              //           where: {
              //             product_id: product.id,
              //             location_id: inventoryData.location_id || 1,
              //             batch_id: batchLot.id,
              //           },
              //         });

              //         if (inventoryStock) {
              //           const prevCurrent = inventoryStock.current_stock ?? 0;
              //           const prevAvailable = inventoryStock.available_stock ?? 0;
              //           const newCurrent = Math.max(0, prevCurrent - batchQty);
              //           const newAvailable = Math.max(
              //             0,
              //             prevAvailable - batchQty
              //           );
              //           console.log(
              //             `updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} batch=${batchLot.id} -${batchQty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
              //           );
              //           await tx.inventory_stock.update({
              //             where: { id: inventoryStock.id },
              //             data: {
              //               current_stock: newCurrent,
              //               available_stock: newAvailable,
              //               updatedate: new Date(),
              //               updatedby: userId,
              //             },
              //           });
              //         }
              //       }

              //       await tx.van_inventory_items.create({
              //         data: {
              //           parent_id: inventory.id,
              //           sap_lineid: item.sap_lineid || null,
              //           product_id: product.id,
              //           product_name: product.name,
              //           unit: product.product_unit_of_measurement?.name || 'pcs',
              //           quantity: batchQty,
              //           unit_price: Number(item.unit_price || 0),
              //           sap_docnum: sapDocNum,
              //           sap_docentry: sapDocEntry,
              //           source_system: sourceSystem,
              //           is_cancelled:
              //             item.is_cancelled || inventoryData.is_cancelled || 'N',
              //           remarks: item.remarks || inventoryData.remarks || null,
              //           discount_amount: Number(item.discount_amount || 0),
              //           tax_amount: Number(item.tax_amount || 0),
              //           total_amount: batchQty * Number(item.unit_price || 0),
              //           notes: item.notes || null,
              //           batch_lot_id: batchLot.id,
              //         },
              //       });

              //       if (shouldPerformLoadingUnloading && !itemIsCancelled) {
              //         await createStockMovement(tx, {
              //           product_id: product.id,
              //           batch_id: batchLot.id,
              //           serial_id: null,
              //           movement_type: 'VAN_UNLOAD',
              //           reference_type: 'VAN_INVENTORY',
              //           reference_id: inventory.id,
              //           from_location_id: null,
              //           to_location_id: null,
              //           quantity: batchQty,
              //           remarks: `Unloaded from van - Batch ${batchLot.batch_number}`,
              //           van_inventory_id: inventory.id,
              //           createdby: userId,
              //         });
              //       }
              //     }
              //   } else if (trackingType === 'SERIAL') {
              //     const serialData = item.serials || item.product_serials;

              //     // If item.quantity is provided, ensure it matches number of serials
              //     if (
              //       typeof item.quantity !== 'undefined' &&
              //       item.quantity !== null
              //     ) {
              //       const declaredQty = parseInt(item.quantity, 10);
              //       if (
              //         !Number.isNaN(declaredQty) &&
              //         declaredQty !== serialData.length
              //       ) {
              //         throw new Error(
              //           `Quantity mismatch for serial-tracked product "${product.name}": declared quantity ${declaredQty} does not match number of serials ${serialData.length}`
              //         );
              //       }
              //     }

              //     for (const serialInput of serialData) {
              //       const serialNumber =
              //         typeof serialInput === 'string'
              //           ? serialInput
              //           : serialInput.serial_number;

              //       const existingSerial = await tx.serial_numbers.findUnique({
              //         where: { serial_number: serialNumber },
              //       });

              //       if (!existingSerial)
              //         throw new Error(`Serial ${serialNumber} not found`);

              //       const vanItem = await tx.van_inventory_items.findFirst({
              //         where: {
              //           product_id: product.id,
              //           serial_id: existingSerial.id,
              //           quantity: { gt: 0 },
              //           van_inventory_items_inventory: {
              //             user_id: Number(inventoryData.user_id),
              //             is_active: 'Y',
              //           },
              //         },
              //       });

              //       if (!vanItem) {
              //         throw new Error(
              //           `Serial ${serialNumber} not found in any van inventory`
              //         );
              //       }

              //       console.log(
              //         ` Found in van_inventory_items ID: ${vanItem.id}, parent_id: ${vanItem.parent_id}`
              //       );

              //       const vanInventoryId = vanItem.parent_id;

              //       // Check if we should perform unloading operations for this item
              //       const itemIsCancelled =
              //         item.is_cancelled === 'T' || item.is_cancelled === 'Y';

              //       if (shouldPerformLoadingUnloading && !itemIsCancelled) {
              //         try {
              //           const newVanQty = Math.max(
              //             0,
              //             (vanItem.quantity || 0) - 1
              //           );
              //           await tx.van_inventory_items.update({
              //             where: { id: vanItem.id },
              //             data: {
              //               quantity: newVanQty,
              //               total_amount:
              //                 newVanQty * Number(vanItem.unit_price || 0),
              //             },
              //           });
              //           console.log(
              //             ` Updated van_inventory_items ID: ${vanItem.id}, quantity: ${vanItem.quantity}→${newVanQty}`
              //           );
              //         } catch (err) {
              //           console.log(
              //             ` Failed updating van_inventory_items ID ${vanItem.id}:`,
              //             err
              //           );
              //         }

              //         try {
              //           await tx.serial_numbers.update({
              //             where: { id: existingSerial.id },
              //             data: {
              //               status: 'available',
              //               location_id: inventoryData.location_id || null,
              //               updatedate: new Date(),
              //               updatedby: userId,
              //             },
              //           });
              //           console.log(
              //             ` Updated serial ${serialNumber} status → available`
              //           );
              //         } catch (err) {
              //           console.log(
              //             ` Failed updating serial ${serialNumber} status:`,
              //             err
              //           );
              //         }

              //         const inventoryStock = await tx.inventory_stock.findFirst({
              //           where: {
              //             product_id: product.id,
              //             serial_number_id: existingSerial.id,
              //           },
              //         });

              //         if (inventoryStock) {
              //           await tx.inventory_stock.update({
              //             where: { id: inventoryStock.id },
              //             data: {
              //               current_stock: Math.max(
              //                 0,
              //                 (inventoryStock.current_stock || 0) - 1
              //               ),
              //               available_stock: Math.max(
              //                 0,
              //                 (inventoryStock.available_stock || 0) - 1
              //               ),
              //               updatedate: new Date(),
              //               updatedby: userId,
              //             },
              //           });
              //           console.log(
              //             ` DECREASED inventory_stock for ${serialNumber}`
              //           );
              //         }

              //         await createStockMovement(tx, {
              //           product_id: product.id,
              //           batch_id: null,
              //           serial_id: existingSerial.id,
              //           movement_type: 'VAN_UNLOAD',
              //           reference_type: 'VAN_INVENTORY',
              //           reference_id: inventory.id,
              //           from_location_id: null,
              //           to_location_id: null,
              //           quantity: 1,
              //           remarks: `Sold serial ${serialNumber}`,
              //           van_inventory_id: inventory.id,
              //           createdby: userId,
              //         });
              //       }

              //       await tx.van_inventory_items.create({
              //         data: {
              //           parent_id: inventory.id,
              //           sap_lineid: item.sap_lineid || null,
              //           product_id: product.id,
              //           product_name: product.name,
              //           unit: product.product_unit_of_measurement?.name || 'pcs',
              //           quantity: 1,
              //           sap_docnum: sapDocNum,
              //           sap_docentry: sapDocEntry,
              //           source_system: sourceSystem,
              //           is_cancelled:
              //             item.is_cancelled || inventoryData.is_cancelled || 'N',
              //           remarks: item.remarks || inventoryData.remarks || null,
              //           unit_price: Number(item.unit_price || 0),
              //           discount_amount: Number(item.discount_amount || 0),
              //           tax_amount: Number(item.tax_amount || 0),
              //           total_amount: 1 * Number(item.unit_price || 0),
              //           notes: item.notes || null,
              //           serial_id: existingSerial.id,
              //         },
              //       });
              //     }
              //   } else {
              //     //   const vanItem = await tx.van_inventory_items.findFirst({
              //     //     where: {
              //     //       parent_id: inventory.id,
              //     //       product_id: product.id,
              //     //       batch_lot_id: null,
              //     //       serial_id: null,
              //     //     },
              //     //   });

              //     const vanItem = await tx.van_inventory_items.findFirst({
              //       where: {
              //         product_id: product.id,
              //         batch_lot_id: null,
              //         serial_id: null,
              //         van_inventory_items_inventory: {
              //           user_id: Number(inventoryData.user_id),
              //           is_active: 'Y',
              //           loading_type: 'L',
              //         },
              //       },
              //     });

              //     if (!vanItem) throw new Error(`Product not found in van`);
              //     if (vanItem.quantity < qty)
              //       throw new Error(`Insufficient van quantity`);

              //     // Check if we should perform unloading operations for this item
              //     const itemIsCancelled =
              //       item.is_cancelled === 'T' || item.is_cancelled === 'Y';

              //     if (shouldPerformLoadingUnloading && !itemIsCancelled) {
              //       const inventoryStock = await tx.inventory_stock.findFirst({
              //         where: {
              //           product_id: product.id,
              //           location_id: inventoryData.location_id || 1,
              //           batch_id: null,
              //           serial_number_id: null,
              //         },
              //       });

              //       if (inventoryStock) {
              //         const prevCurrent = inventoryStock.current_stock ?? 0;
              //         const prevAvailable = inventoryStock.available_stock ?? 0;
              //         const newCurrent = Math.max(0, prevCurrent - qty);
              //         const newAvailable = Math.max(0, prevAvailable - qty);
              //         console.log(
              //           `updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} -${qty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
              //         );
              //         await tx.inventory_stock.update({
              //           where: { id: inventoryStock.id },
              //           data: {
              //             current_stock: newCurrent,
              //             available_stock: newAvailable,
              //             updatedate: new Date(),
              //             updatedby: userId,
              //           },
              //         });
              //       }

              //       await createStockMovement(tx, {
              //         product_id: product.id,
              //         batch_id: null,
              //         serial_id: null,
              //         movement_type: 'VAN_UNLOAD',
              //         reference_type: 'VAN_INVENTORY',
              //         reference_id: inventory.id,
              //         from_location_id: null,
              //         to_location_id: null,
              //         quantity: qty,
              //         remarks: `Sold ${qty} units from van`,
              //         van_inventory_id: inventory.id,
              //         createdby: userId,
              //       });
              //     }

              //     await tx.van_inventory_items.create({
              //       data: {
              //         parent_id: inventory.id,
              //         sap_lineid: item.sap_lineid || null,
              //         product_id: product.id,
              //         product_name: product.name,
              //         unit: product.product_unit_of_measurement?.name || 'pcs',
              //         quantity: qty,
              //         sap_docnum: sapDocNum,
              //         sap_docentry: sapDocEntry,
              //         source_system: sourceSystem,
              //         is_cancelled:
              //           item.is_cancelled || inventoryData.is_cancelled || 'N',
              //         remarks: item.remarks || inventoryData.remarks || null,
              //         unit_price: Number(item.unit_price || 0),
              //         discount_amount: Number(item.discount_amount || 0),
              //         tax_amount: Number(item.tax_amount || 0),
              //         total_amount: qty * Number(item.unit_price || 0),
              //         notes: item.notes || null,
              //         batch_lot_id: null,
              //         serial_id: null,
              //       },
              //     });
              //   }
              // }
            } else if (loadingType === 'U') {
              const existingUnloadSapDoc =
                await tx.van_inventory_items.findFirst({
                  where: {
                    source_system: sourceSystem,
                    sap_docentry: sapDocEntry,
                    van_inventory_items_inventory: {
                      loading_type: 'U',
                    },
                  },
                });

              if (existingUnloadSapDoc) {
                throw new Error(
                  `SAP document already unloaded: ${compositeKey}`
                );
              }

              if (trackingType === 'BATCH') {
                const batchData = item.batches || item.product_batches;

                if (
                  !batchData ||
                  !Array.isArray(batchData) ||
                  batchData.length === 0
                ) {
                  throw new Error(
                    `Batches are required for batch-tracked product ${product.name}`
                  );
                }

                const totalBatchQtyUnload = (batchData || []).reduce(
                  (acc: number, b: any) =>
                    acc + (parseInt(b.quantity, 10) || 0),
                  0
                );
                if (
                  typeof item.quantity === 'undefined' ||
                  item.quantity === null
                ) {
                  throw new Error(
                    `Quantity is required for batch-tracked product "${product.name}" when batches are provided`
                  );
                }
                const declaredQtyUnload = parseInt(item.quantity, 10);
                if (
                  Number.isNaN(declaredQtyUnload) ||
                  declaredQtyUnload !== totalBatchQtyUnload
                ) {
                  throw new Error(
                    `Quantity mismatch for batch-tracked product "${product.name}": declared quantity ${item.quantity} does not match sum of batches ${totalBatchQtyUnload}`
                  );
                }

                for (const batchInput of batchData) {
                  const batchQty = parseInt(batchInput.quantity, 10) || 0;

                  const batchLot = await tx.batch_lots.findFirst({
                    where: {
                      batch_number: batchInput.batch_number,
                      productsId: product.id,
                      is_active: 'Y',
                    },
                  });

                  if (!batchLot)
                    throw new Error(
                      `Batch ${batchInput.batch_number} not found`
                    );

                  const vanItem = await tx.van_inventory_items.findFirst({
                    where: {
                      product_id: product.id,
                      batch_lot_id: batchLot.id,
                      van_inventory_items_inventory: {
                        user_id: Number(inventoryData.user_id),
                        is_active: 'Y',
                        loading_type: 'L',
                      },
                    },
                  });
                  if (!vanItem)
                    throw new Error(
                      `Batch ${batchInput.batch_number} for product ${product.id} not found in van inventory for user ${inventoryData.user_id}`
                    );
                  if (vanItem.quantity < batchQty)
                    throw new Error(`Insufficient van quantity`);

                  const itemIsCancelled =
                    item.is_cancelled === 'T' || item.is_cancelled === 'Y';

                  if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                    const inventoryStock = await tx.inventory_stock.findFirst({
                      where: {
                        product_id: product.id,
                        location_id: inventoryData.location_id || 1,
                        batch_id: batchLot.id,
                      },
                    });

                    if (inventoryStock) {
                      const prevCurrent = inventoryStock.current_stock ?? 0;
                      const prevAvailable = inventoryStock.available_stock ?? 0;
                      const newCurrent = Math.max(0, prevCurrent - batchQty);
                      const newAvailable = Math.max(
                        0,
                        prevAvailable - batchQty
                      );
                      console.log(
                        `updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} batch=${batchLot.id} -${batchQty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
                      );
                      await tx.inventory_stock.update({
                        where: { id: inventoryStock.id },
                        data: {
                          current_stock: newCurrent,
                          available_stock: newAvailable,
                          updatedate: new Date(),
                          updatedby: userId,
                        },
                      });
                    }
                  }

                  await tx.van_inventory_items.create({
                    data: {
                      parent_id: inventory.id,
                      sap_lineid: item.sap_lineid || null,
                      sap_item_code: item.product_sap_code || null,
                      product_id: product.id,
                      product_name: product.name,
                      unit: product.product_unit_of_measurement?.name || 'pcs',
                      quantity: batchQty,
                      unit_price: Number(item.unit_price || 0),
                      sap_docnum: sapDocNum,
                      sap_docentry: sapDocEntry,
                      source_system: sourceSystem,
                      is_cancelled:
                        item.is_cancelled || inventoryData.is_cancelled || 'N',
                      remarks: item.remarks || inventoryData.remarks || null,
                      discount_amount: Number(item.discount_amount || 0),
                      tax_amount: Number(item.tax_amount || 0),
                      total_amount: batchQty * Number(item.unit_price || 0),
                      notes: item.notes || null,
                      batch_lot_id: batchLot.id,
                    },
                  });

                  if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: batchLot.id,
                      serial_id: null,
                      movement_type: 'VAN_UNLOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: null,
                      quantity: batchQty,
                      remarks: `Unloaded from van - Batch ${batchLot.batch_number}`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });
                  }
                }
              } else if (trackingType === 'SERIAL') {
                const serialData = item.serials || item.product_serials;

                if (
                  typeof item.quantity !== 'undefined' &&
                  item.quantity !== null
                ) {
                  const declaredQty = parseInt(item.quantity, 10);
                  if (
                    !Number.isNaN(declaredQty) &&
                    declaredQty !== serialData.length
                  ) {
                    throw new Error(
                      `Quantity mismatch for serial-tracked product "${product.name}": declared quantity ${declaredQty} does not match number of serials ${serialData.length}`
                    );
                  }
                }

                for (const serialInput of serialData) {
                  const serialNumber =
                    typeof serialInput === 'string'
                      ? serialInput
                      : serialInput.serial_number;

                  const existingSerial = await tx.serial_numbers.findUnique({
                    where: { serial_number: serialNumber },
                  });

                  if (!existingSerial)
                    throw new Error(`Serial ${serialNumber} not found`);

                  const vanItem = await tx.van_inventory_items.findFirst({
                    where: {
                      product_id: product.id,
                      serial_id: existingSerial.id,
                      quantity: { gt: 0 },
                      van_inventory_items_inventory: {
                        user_id: Number(inventoryData.user_id),
                        is_active: 'Y',
                      },
                    },
                  });

                  if (!vanItem) {
                    throw new Error(
                      `Serial ${serialNumber} not found in any van inventory`
                    );
                  }

                  console.log(
                    ` Found in van_inventory_items ID: ${vanItem.id}, parent_id: ${vanItem.parent_id}`
                  );

                  const vanInventoryId = vanItem.parent_id;

                  const itemIsCancelled =
                    item.is_cancelled === 'T' || item.is_cancelled === 'Y';

                  if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                    try {
                      const newVanQty = Math.max(
                        0,
                        (vanItem.quantity || 0) - 1
                      );
                      await tx.van_inventory_items.update({
                        where: { id: vanItem.id },
                        data: {
                          quantity: newVanQty,
                          total_amount:
                            newVanQty * Number(vanItem.unit_price || 0),
                        },
                      });
                      console.log(
                        ` Updated van_inventory_items ID: ${vanItem.id}, quantity: ${vanItem.quantity}→${newVanQty}`
                      );
                    } catch (err) {
                      console.log(
                        ` Failed updating van_inventory_items ID ${vanItem.id}:`,
                        err
                      );
                    }

                    try {
                      await tx.serial_numbers.update({
                        where: { id: existingSerial.id },
                        data: {
                          status: 'available',
                          location_id: inventoryData.location_id || null,
                          updatedate: new Date(),
                          updatedby: userId,
                        },
                      });
                      console.log(
                        ` Updated serial ${serialNumber} status → available`
                      );
                    } catch (err) {
                      console.log(
                        ` Failed updating serial ${serialNumber} status:`,
                        err
                      );
                    }

                    const inventoryStock = await tx.inventory_stock.findFirst({
                      where: {
                        product_id: product.id,
                        serial_number_id: existingSerial.id,
                      },
                    });

                    if (inventoryStock) {
                      await tx.inventory_stock.update({
                        where: { id: inventoryStock.id },
                        data: {
                          current_stock: Math.max(
                            0,
                            (inventoryStock.current_stock || 0) - 1
                          ),
                          available_stock: Math.max(
                            0,
                            (inventoryStock.available_stock || 0) - 1
                          ),
                          updatedate: new Date(),
                          updatedby: userId,
                        },
                      });
                      console.log(
                        ` DECREASED inventory_stock for ${serialNumber}`
                      );
                    }

                    await createStockMovement(tx, {
                      product_id: product.id,
                      batch_id: null,
                      serial_id: existingSerial.id,
                      movement_type: 'VAN_UNLOAD',
                      reference_type: 'VAN_INVENTORY',
                      reference_id: inventory.id,
                      from_location_id: null,
                      to_location_id: null,
                      quantity: 1,
                      remarks: `Sold serial ${serialNumber}`,
                      van_inventory_id: inventory.id,
                      createdby: userId,
                    });
                  }

                  await tx.van_inventory_items.create({
                    data: {
                      parent_id: inventory.id,
                      sap_lineid: item.sap_lineid || null,
                      sap_item_code: item.product_sap_code || null,
                      product_id: product.id,
                      product_name: product.name,
                      unit: product.product_unit_of_measurement?.name || 'pcs',
                      quantity: 1,
                      sap_docnum: sapDocNum,
                      sap_docentry: sapDocEntry,
                      source_system: sourceSystem,
                      is_cancelled:
                        item.is_cancelled || inventoryData.is_cancelled || 'N',
                      remarks: item.remarks || inventoryData.remarks || null,
                      unit_price: Number(item.unit_price || 0),
                      discount_amount: Number(item.discount_amount || 0),
                      tax_amount: Number(item.tax_amount || 0),
                      total_amount: 1 * Number(item.unit_price || 0),
                      notes: item.notes || null,
                      serial_id: existingSerial.id,
                    },
                  });
                }
              } else {
                const vanItem = await tx.van_inventory_items.findFirst({
                  where: {
                    product_id: product.id,
                    batch_lot_id: null,
                    serial_id: null,
                    van_inventory_items_inventory: {
                      user_id: Number(inventoryData.user_id),
                      is_active: 'Y',
                      loading_type: 'L',
                    },
                  },
                });

                if (!vanItem) throw new Error(`Product not found in van`);
                if (vanItem.quantity < qty)
                  throw new Error(`Insufficient van quantity`);

                const itemIsCancelled =
                  item.is_cancelled === 'T' || item.is_cancelled === 'Y';

                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                  const inventoryStock = await tx.inventory_stock.findFirst({
                    where: {
                      product_id: product.id,
                      location_id: inventoryData.location_id || 1,
                      batch_id: null,
                      serial_number_id: null,
                    },
                  });

                  if (inventoryStock) {
                    const prevCurrent = inventoryStock.current_stock ?? 0;
                    const prevAvailable = inventoryStock.available_stock ?? 0;
                    const newCurrent = Math.max(0, prevCurrent - qty);
                    const newAvailable = Math.max(0, prevAvailable - qty);
                    console.log(
                      `updateInventoryStock UNLOAD: product=${product.id} location=${inventoryData.location_id || 1} -${qty} current ${prevCurrent}→${newCurrent} available ${prevAvailable}→${newAvailable}`
                    );
                    await tx.inventory_stock.update({
                      where: { id: inventoryStock.id },
                      data: {
                        current_stock: newCurrent,
                        available_stock: newAvailable,
                        updatedate: new Date(),
                        updatedby: userId,
                      },
                    });
                  }

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: null,
                    serial_id: null,
                    movement_type: 'VAN_UNLOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventory.id,
                    from_location_id: null,
                    to_location_id: null,
                    quantity: qty,
                    remarks: `Sold ${qty} units from van`,
                    van_inventory_id: inventory.id,
                    createdby: userId,
                  });
                }

                await tx.van_inventory_items.create({
                  data: {
                    parent_id: inventory.id,
                    sap_lineid: item.sap_lineid || null,
                    sap_item_code: item.product_sap_code || null,
                    product_id: product.id,
                    product_name: product.name,
                    unit: product.product_unit_of_measurement?.name || 'pcs',
                    quantity: qty,
                    sap_docnum: sapDocNum,
                    sap_docentry: sapDocEntry,
                    source_system: sourceSystem,
                    is_cancelled:
                      item.is_cancelled || inventoryData.is_cancelled || 'N',
                    remarks: item.remarks || inventoryData.remarks || null,
                    unit_price: Number(item.unit_price || 0),
                    discount_amount: Number(item.discount_amount || 0),
                    tax_amount: Number(item.tax_amount || 0),
                    total_amount: qty * Number(item.unit_price || 0),
                    notes: item.notes || null,
                    batch_lot_id: null,
                    serial_id: null,
                  },
                });
              }
            }
          }
        }
        const finalInventory = await tx.van_inventory.findUnique({
          where: { id: inventory.id },
          include: {
            van_inventory_users: {
              select: {
                id: true,
                name: true,
                email: true,
                sap_code: true,
                employee_id: true,
              },
            },
            vehicle: {
              select: {
                id: true,
                vehicle_number: true,
                sap_code: true,
                type: true,
                make: true,
                model: true,
              },
            },
            van_inventory_depot: {
              select: {
                id: true,
                name: true,
                code: true,
                sap_code: true,
                city: true,
              },
            },
            van_inventory_items_inventory: {
              include: {
                van_inventory_items_products: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    sap_code: true,
                    tracking_type: true,

                    product_unit_of_measurement: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                      },
                    },

                    product_tax_master: {
                      select: {
                        id: true,
                        name: true,
                        code: true,
                      },
                    },

                    product_product_batches: {
                      select: {
                        id: true,
                        quantity: true,
                        batch_lot_product_batches: {
                          select: {
                            id: true,
                            batch_number: true,
                            lot_number: true,
                          },
                        },
                      },
                    },

                    serial_numbers_products: {
                      select: {
                        id: true,
                        serial_number: true,
                        status: true,
                        warranty_expiry: true,
                        serial_numbers_customers: {
                          select: {
                            id: true,
                            name: true,
                            code: true,
                          },
                        },
                      },
                    },
                  },
                },
                van_inventory_items_batch_lot: {
                  select: {
                    id: true,
                    batch_number: true,
                    expiry_date: true,
                  },
                },
              },
            },
            van_inventory_stock_movements: {
              select: {
                id: true,
                movement_type: true,
                quantity: true,
                movement_date: true,
                remarks: true,
              },
            },
          },
        });

        // return { finalInventory, wasUpdate: isUpdate };
        const firstItem = finalInventory?.van_inventory_items_inventory?.[0];

        const result = {
          finalInventory: {
            id: finalInventory?.id,
            user_id: finalInventory?.user_id,
            last_updated: finalInventory?.last_updated,
            is_active: finalInventory?.is_active,
            is_cancelled: finalInventory?.is_cancelled,
            approval_status: finalInventory?.approval_status,
            remarks: finalInventory?.remarks,
            createdate: finalInventory?.createdate,
            createdby: finalInventory?.createdby,
            updatedate: finalInventory?.updatedate,
            updatedby: finalInventory?.updatedby,
            log_inst: finalInventory?.log_inst,
            location_id: finalInventory?.location_id,
            location_type: finalInventory?.location_type,
            vehicle_id: finalInventory?.vehicle_id,
            vehicle_code: finalInventory?.vehicle_code,
            sales_person_code: finalInventory?.sales_person_code,
            loading_type: finalInventory?.loading_type,
            status: finalInventory?.status,
            document_date: finalInventory?.document_date,
            sale_type: finalInventory?.sale_type,
            van_inventory_users: finalInventory?.van_inventory_users,
            vehicle: finalInventory?.vehicle,
            van_inventory_depot: finalInventory?.van_inventory_depot,
            van_inventory_items_inventory:
              finalInventory?.van_inventory_items_inventory?.map(item => ({
                id: item.id,
                parent_id: item.parent_id,
                sap_docnum: item.sap_docnum,
                sap_docentry: item.sap_docentry,
                source_system: item.source_system,
                source_system_label: getSourceSystemLabel(item.source_system),

                sap_lineid: item.sap_lineid,
                remarks: item.remarks,
                sap_item_code: item.sap_item_code,
                product_id: item.product_id,
                product_name: item.product_name,
                unit: item.unit,
                batch_lot_id: item.batch_lot_id,
                serial_id: item.serial_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount_amount: item.discount_amount,
                tax_amount: item.tax_amount,
                total_amount: item.total_amount,
                notes: item.notes,
                is_cancelled: item.is_cancelled,

                van_inventory_items_products: item.van_inventory_items_products,
                van_inventory_items_batch_lot:
                  item.van_inventory_items_batch_lot,
              })),
            van_inventory_stock_movements:
              finalInventory?.van_inventory_stock_movements,
          },
          wasUpdate: isUpdate,
        };
        return result;
      },
      {
        maxWait: 6000000,
        timeout: 1200000,
      }
    );

    // Create approval request if workflow exists and it's a new or pending update
    if (workflowExists && finalResult.finalInventory.approval_status === 'P') {
      const formattedVanInventoryItems = items.map((item: any) => {
        const product = finalResult.finalInventory.van_inventory_items_inventory?.find(
          (i: any) => i.sap_item_code === item.product_sap_code
        )?.van_inventory_items_products;

        return {
          product_id: product?.id,
          product_name: product?.name,
          tracking_type: product?.tracking_type,
          quantity: item.quantity,
          notes: item.notes || item.remarks || '',
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          tax_amount: item.tax_amount || 0,
          total_amount:
            Number(item.quantity || 0) * Number(item.unit_price || 0) +
            Number(item.tax_amount || 0) -
            Number(item.discount_amount || 0),
          sap_docentry: item.sap_docentry,
          sap_docnum: item.sap_docnum,
          sap_lineid: item.sap_lineid,
          source_system: item.source_system,
          product_batches:
            item.batches?.map((b: any) => ({
              batch_number: b.batch_number,
              lot_number: b.lot_number || '',
              manufacturing_date: b.manufacturing_date,
              expiry_date: b.expiry_date,
              quantity: b.quantity,
              remaining_quantity: b.quantity,
              total_quantity: b.quantity,
            })) || [],
          product_serials:
            item.serials?.map((s: any) => ({
              serial_number: s.serial_number || s,
              quantity: s.quantity || 1,
            })) || [],
        };
      });

      await createRequest({
        requester_id: Number(inventoryData.user_id),
        request_type: 'VAN_INVENTORY',
        reference_id: finalResult.finalInventory.id,
        request_data: JSON.stringify({
          ...inventoryData,
          items,
          van_inventory_items: formattedVanInventoryItems,
        }),
        createdby: userId,
        log_inst: 1,
      });
    }

    return finalResult;
  },

  async processApprovedVanInventoryStock(
    inventoryId: number,
    userId: number = 1
  ) {
    console.log('processApprovedVanInventoryStock called', {
      inventoryId,
      userId,
    });
    console.log(
      `Processing stock operations for approved van inventory ID: ${inventoryId}`
    );

    const inventory = await prisma.van_inventory.findUnique({
      where: { id: Number(inventoryId) },
    });

    if (!inventory) {
      throw new Error(`Van inventory not found with ID: ${inventoryId}`);
    }

    const approvalRequest = await prisma.sfa_d_requests.findFirst({
      where: {
        request_type: 'VAN_INVENTORY',
        reference_id: Number(inventoryId),
      },
      orderBy: { createdate: 'desc' },
    });

    if (!approvalRequest?.request_data) {
      throw new Error('No approval request found with original payload data');
    }

    const originalPayload = JSON.parse(approvalRequest.request_data);
    const items = originalPayload.items || [];
    const loadingType = originalPayload.loading_type || 'L';
    const shouldPerformLoadingUnloading =
      inventory.approval_status === 'A' && inventory.is_cancelled === 'N';

    console.log(
      `shouldPerformLoadingUnloading: ${shouldPerformLoadingUnloading}`
    );

    await prisma.$transaction(
      async tx => {
        if (loadingType === 'L') {
          const existingProcessedMovements = await tx.stock_movements.count({
            where: {
              reference_type: 'VAN_INVENTORY',
              reference_id: inventoryId,
              movement_type: 'VAN_LOAD',
            },
          });
          console.log(
            ` Existing VAN_LOAD stock movements for this inventory: ${existingProcessedMovements}`
          );

          if (existingProcessedMovements > 0) {
            console.log(
              ' Skipping: VAN_LOAD stock movements already processed'
            );
            return;
          }
        } else if (loadingType === 'U') {
          const existingProcessedMovements = await tx.stock_movements.count({
            where: {
              reference_type: 'VAN_INVENTORY',
              reference_id: inventoryId,
              movement_type: 'VAN_UNLOAD',
            },
          });
          console.log(
            ` Existing VAN_UNLOAD stock movements for this inventory: ${existingProcessedMovements}`
          );

          if (existingProcessedMovements > 0) {
            console.log(
              ' Skipping: VAN_UNLOAD stock movements already processed'
            );
            return;
          }
        }

        for (const item of items) {
          if (!item.product_sap_code) continue;

          const product = await tx.products.findFirst({
            where: { sap_code: item.product_sap_code },
            include: { product_unit_of_measurement: true },
          });

          if (!product) {
            console.warn(
              `Product with SAP code ${item.product_sap_code} not found, skipping`
            );
            continue;
          }

          const trackingType = product.tracking_type?.toUpperCase() || 'NONE';
          const itemIsCancelled =
            item.is_cancelled === 'T' ||
            item.is_cancelled === 'Y' ||
            inventory.is_cancelled === 'Y';

          const sapDocEntry = item.sap_docentry?.toString() || '';
          const sapDocNum = item.sap_docnum?.toString() || '';
          const sourceSystem = item.source_system || '';

          if (loadingType === 'L') {
            if (trackingType === 'BATCH') {
              const batchData = item.batches || item.product_batches;
              if (
                !batchData ||
                !Array.isArray(batchData) ||
                batchData.length === 0
              ) {
                continue;
              }

              for (const batchInput of batchData) {
                const batchQty = parseInt(batchInput.quantity, 10) || 0;
                if (batchQty <= 0) continue;

                let batchLot = await tx.batch_lots.findFirst({
                  where: {
                    batch_number: batchInput.batch_number,
                    productsId: product.id,
                    is_active: 'Y',
                    createdby: Number(inventory.user_id),
                  },
                });

                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                  if (batchLot) {
                    await tx.batch_lots.update({
                      where: { id: batchLot.id },
                      data: {
                        quantity: batchLot.quantity + batchQty,
                        remaining_quantity:
                          batchLot.remaining_quantity + batchQty,
                        updatedate: new Date(),
                      },
                    });
                    console.log(
                      `Updated batch_lots: ${batchLot.batch_number} (+${batchQty})`
                    );
                  } else {
                    batchLot = await tx.batch_lots.create({
                      data: {
                        batch_number: batchInput.batch_number,
                        lot_number:
                          batchInput.lot_number || `LOT-${Date.now()}`,
                        manufacturing_date: batchInput.manufacturing_date
                          ? new Date(batchInput.manufacturing_date)
                          : new Date(),
                        expiry_date: batchInput.expiry_date
                          ? new Date(batchInput.expiry_date)
                          : new Date(
                            new Date().setFullYear(
                              new Date().getFullYear() + 2
                            )
                          ),
                        quantity: batchQty,
                        remaining_quantity: batchQty,
                        supplier_name: batchInput.supplier_name || null,
                        purchase_price: batchInput.purchase_price || null,
                        quality_grade: batchInput.quality_grade || 'A',
                        storage_location: batchInput.storage_location || null,
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: Number(inventory.user_id),
                        log_inst: 1,
                        productsId: product.id,
                      },
                    });
                    console.log(`Created batch_lots: ${batchLot.batch_number}`);
                  }

                  const productBatch = await tx.product_batches.findFirst({
                    where: {
                      product_id: product.id,
                      batch_lot_id: batchLot.id,
                      is_active: 'Y',
                    },
                  });

                  if (productBatch) {
                    await tx.product_batches.update({
                      where: { id: productBatch.id },
                      data: {
                        quantity: productBatch.quantity + batchQty,
                        updatedate: new Date(),
                      },
                    });
                  } else {
                    await tx.product_batches.create({
                      data: {
                        product_id: product.id,
                        batch_lot_id: batchLot.id,
                        quantity: batchQty,
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: userId,
                        log_inst: 1,
                      },
                    });
                  }

                  await updateInventoryStock(
                    tx,
                    product.id,
                    inventory.location_id,
                    batchQty,
                    'L',
                    batchLot.id,
                    null,
                    userId,
                    inventory.user_id
                  );

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: batchLot.id,
                    serial_id: null,
                    movement_type: 'VAN_LOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventoryId,
                    quantity: batchQty,
                    remarks: item.remarks || 'Approved stock load',
                    van_inventory_id: inventoryId,
                    createdby: userId,
                  });
                }
              }
            } else if (trackingType === 'SERIAL') {
              let serialData: any[] = [];
              if (Array.isArray(item.serials)) {
                serialData = item.serials;
              } else if (Array.isArray(item.serial_numbers)) {
                serialData = item.serial_numbers;
              }
              if (!serialData.length) continue;

              for (const serialInput of serialData) {
                const serialNumber =
                  typeof serialInput === 'string'
                    ? serialInput
                    : serialInput.serial_number;
                if (!serialNumber) continue;

                const existingSerial = await tx.serial_numbers.findFirst({
                  where: { serial_number: serialNumber },
                });

                if (!existingSerial) continue;
                if (
                  shouldPerformLoadingUnloading &&
                  !itemIsCancelled &&
                  existingSerial.status === 'in_van'
                ) {
                  throw new Error(
                    `Cannot approve van inventory ID ${inventoryId}: Serial ${serialNumber} is already loaded to van and cannot be loaded again until it becomes available`
                  );
                }
                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                  await tx.serial_numbers.update({
                    where: { id: existingSerial.id },
                    data: {
                      status: 'in_van',
                      location_id: inventory.location_id,
                      updatedate: new Date(),
                      updatedby: userId,
                    },
                  });
                  console.log(`Updated serial ${serialNumber} status → in_van`);

                  await updateInventoryStock(
                    tx,
                    product.id,
                    inventory.location_id,
                    1,
                    'L',
                    null,
                    existingSerial.id,
                    userId,
                    inventory.user_id
                  );

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: null,
                    serial_id: existingSerial.id,
                    movement_type: 'VAN_LOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventoryId,
                    quantity: 1,
                    remarks: item.remarks || 'Approved serial load',
                    van_inventory_id: inventoryId,
                    createdby: userId,
                  });
                }
              }
            } else if (trackingType === 'NONE') {
              const itemQty = parseInt(item.quantity, 10) || 0;
              if (itemQty <= 0) continue;

              if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                await updateInventoryStock(
                  tx,
                  product.id,
                  inventory.location_id,
                  itemQty,
                  'L',
                  null,
                  null,
                  userId,
                  inventory.user_id
                );

                await createStockMovement(tx, {
                  product_id: product.id,
                  batch_id: null,
                  serial_id: null,
                  movement_type: 'VAN_LOAD',
                  reference_type: 'VAN_INVENTORY',
                  reference_id: inventoryId,
                  quantity: itemQty,
                  remarks: item.remarks || 'Approved stock load',
                  van_inventory_id: inventoryId,
                  createdby: userId,
                });
              }
            }
          } else if (loadingType === 'U') {
            if (trackingType === 'BATCH') {
              const batchData = item.batches || item.product_batches;
              if (
                !batchData ||
                !Array.isArray(batchData) ||
                batchData.length === 0
              ) {
                continue;
              }

              for (const batchInput of batchData) {
                const batchQty = parseInt(batchInput.quantity, 10) || 0;
                if (batchQty <= 0) continue;

                const batchLot = await tx.batch_lots.findFirst({
                  where: {
                    batch_number: batchInput.batch_number,
                    productsId: product.id,
                    is_active: 'Y',
                  },
                });

                if (!batchLot) continue;

                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                  await tx.batch_lots.update({
                    where: { id: batchLot.id },
                    data: {
                      quantity: Math.max(0, batchLot.quantity - batchQty),
                      remaining_quantity: Math.max(
                        0,
                        batchLot.remaining_quantity - batchQty
                      ),
                      updatedate: new Date(),
                    },
                  });

                  const productBatch = await tx.product_batches.findFirst({
                    where: {
                      product_id: product.id,
                      batch_lot_id: batchLot.id,
                      is_active: 'Y',
                    },
                  });

                  if (productBatch) {
                    await tx.product_batches.update({
                      where: { id: productBatch.id },
                      data: {
                        quantity: Math.max(0, productBatch.quantity - batchQty),
                        updatedate: new Date(),
                      },
                    });
                  }

                  await updateInventoryStock(
                    tx,
                    product.id,
                    inventory.location_id,
                    batchQty,
                    'U',
                    batchLot.id,
                    null,
                    userId,
                    inventory.user_id
                  );

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: batchLot.id,
                    serial_id: null,
                    movement_type: 'VAN_UNLOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventoryId,
                    quantity: batchQty,
                    remarks: item.remarks || 'Approved stock unload',
                    van_inventory_id: inventoryId,
                    createdby: userId,
                  });
                }
              }
            } else if (trackingType === 'SERIAL') {
              let serialData: any[] = [];
              if (Array.isArray(item.serials)) {
                serialData = item.serials;
              } else if (Array.isArray(item.serial_numbers)) {
                serialData = item.serial_numbers;
              }
              if (!serialData.length) continue;

              for (const serialInput of serialData) {
                const serialNumber =
                  typeof serialInput === 'string'
                    ? serialInput
                    : serialInput.serial_number;
                if (!serialNumber) continue;

                const existingSerial = await tx.serial_numbers.findFirst({
                  where: { serial_number: serialNumber },
                });

                if (!existingSerial) continue;

                const vanItem = await tx.van_inventory_items.findFirst({
                  where: {
                    product_id: product.id,
                    serial_id: existingSerial.id,
                    quantity: { gt: 0 },
                    van_inventory_items_inventory: {
                      user_id: Number(inventory.user_id),
                      is_active: 'Y',
                    },
                  },
                });

                if (!vanItem) continue;

                if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                  const newVanQty = Math.max(0, (vanItem.quantity || 0) - 1);
                  await tx.van_inventory_items.update({
                    where: { id: vanItem.id },
                    data: {
                      quantity: newVanQty,
                      total_amount: newVanQty * Number(vanItem.unit_price || 0),
                    },
                  });

                  await tx.serial_numbers.update({
                    where: { id: existingSerial.id },
                    data: {
                      status: 'available',
                      location_id: inventory.location_id,
                      updatedate: new Date(),
                      updatedby: userId,
                    },
                  });

                  await updateInventoryStock(
                    tx,
                    product.id,
                    inventory.location_id,
                    1,
                    'U',
                    null,
                    existingSerial.id,
                    userId,
                    inventory.user_id
                  );

                  await createStockMovement(tx, {
                    product_id: product.id,
                    batch_id: null,
                    serial_id: existingSerial.id,
                    movement_type: 'VAN_UNLOAD',
                    reference_type: 'VAN_INVENTORY',
                    reference_id: inventoryId,
                    quantity: 1,
                    remarks: item.remarks || 'Approved serial unload',
                    van_inventory_id: inventoryId,
                    createdby: userId,
                  });
                }
              }
            } else if (trackingType === 'NONE') {
              const itemQty = parseInt(item.quantity, 10) || 0;
              if (itemQty <= 0) continue;

              if (shouldPerformLoadingUnloading && !itemIsCancelled) {
                await updateInventoryStock(
                  tx,
                  product.id,
                  inventory.location_id,
                  itemQty,
                  'U',
                  null,
                  null,
                  userId,
                  inventory.user_id
                );

                await createStockMovement(tx, {
                  product_id: product.id,
                  batch_id: null,
                  serial_id: null,
                  movement_type: 'VAN_UNLOAD',
                  reference_type: 'VAN_INVENTORY',
                  reference_id: inventoryId,
                  quantity: itemQty,
                  remarks: item.remarks || 'Approved stock unload',
                  van_inventory_id: inventoryId,
                  createdby: userId,
                });
              }
            }
          }
        }
      },
      {
        maxWait: 6000000,
        timeout: 300000,
      }
    );

    console.log(
      `Successfully processed stock operations for van inventory ID: ${inventoryId}`
    );
  },
};
