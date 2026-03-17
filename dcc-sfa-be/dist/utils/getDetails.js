"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
// const getRequestDetailsByType = async (
//   request_type: string,
//   reference_id: number | null
// ): Promise<any> => {
//   if (!reference_id) {
//     return null;
//   }
//   try {
//     switch (request_type) {
//       case 'ORDER_APPROVAL':
//         const order = await prisma.orders.findUnique({
//           where: { id: reference_id },
//           select: {
//             id: true,
//             order_number: true,
//             parent_id: true,
//             total_amount: true,
//             status: true,
//             order_date: true,
//             delivery_date: true,
//             payment_method: true,
//             notes: true,
//             orders_customers: {
//               select: {
//                 id: true,
//                 name: true,
//                 code: true,
//                 phone_number: true,
//               },
//             },
//             orders_salesperson_users: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//               },
//             },
//           },
//         });
//         if (order) {
//           return {
//             order_number: order.order_number || 'N/A',
//             customer_name: order.orders_customers?.name || 'N/A',
//             customer_code: order.orders_customers?.code || 'N/A',
//             customer_phone: order.orders_customers?.phone_number || 'N/A',
//             salesperson_name: order.orders_salesperson_users?.name || 'N/A',
//             salesperson_email: order.orders_salesperson_users?.email || 'N/A',
//             total_amount: `₹${order.total_amount?.toString() || '0'}`,
//             order_date: order.order_date
//               ? new Date(order.order_date).toLocaleDateString('en-IN')
//               : 'N/A',
//             delivery_date: order.delivery_date
//               ? new Date(order.delivery_date).toLocaleDateString('en-IN')
//               : 'N/A',
//             payment_method: order.payment_method || 'N/A',
//             status: order.status || 'PENDING',
//             notes: order.notes || 'No additional notes',
//           };
//         }
//         return null;
//       default:
//         console.log(`⚠ No handler for request_type: ${request_type}`);
//         return {
//           message: `Request type '${request_type}' is not yet implemented`,
//           reference_id,
//         };
//     }
//   } catch (error: any) {
//     console.error('Error in getRequestDetailsByType:', error);
//     return {
//       error: 'Failed to fetch request details',
//       message: error.message,
//     };
//   }
// };
async function getRequestDetailsByType(request_type, reference_id) {
    if (!reference_id)
        return {};
    try {
        switch (request_type) {
            case 'ORDER_APPROVAL':
                const order = await prisma_client_1.default.orders.findUnique({
                    where: { id: reference_id },
                    include: {
                        orders_customers: true,
                        orders_salesperson_users: true,
                    },
                });
                if (!order)
                    return {};
                return {
                    order_number: order.order_number,
                    customer_name: order.orders_customers?.name || 'N/A',
                    customer_code: order.orders_customers?.code || 'N/A',
                    salesperson_name: order.orders_salesperson_users?.name || 'N/A',
                    total_amount: order.total_amount
                        ? `$${Number(order.total_amount).toFixed(2)}`
                        : '$0.00',
                    order_date: order.order_date
                        ? new Date(order.order_date).toLocaleDateString()
                        : new Date().toLocaleDateString(),
                    status: order.status || 'pending',
                    payment_method: order.payment_method || 'N/A',
                    notes: order.notes || '',
                };
            case 'ASSET_MOVEMENT_APPROVAL':
                const assetMovement = await prisma_client_1.default.asset_movements.findUnique({
                    where: { id: reference_id },
                    include: {
                        asset_movement_assets: {
                            include: {
                                asset_movement_assets_asset: {
                                    select: {
                                        id: true,
                                        name: true,
                                        code: true,
                                        serial_number: true,
                                        asset_master_asset_types: {
                                            select: { name: true },
                                        },
                                    },
                                },
                            },
                        },
                        asset_movements_performed_by: {
                            select: { name: true },
                        },
                        asset_movement_from_depot: {
                            select: { name: true },
                        },
                        asset_movement_from_customer: {
                            select: { name: true },
                        },
                        asset_movement_to_depot: {
                            select: { name: true },
                        },
                        asset_movement_to_customer: {
                            select: { name: true },
                        },
                    },
                });
                if (!assetMovement)
                    return {};
                const fromLocation = assetMovement.from_depot_id
                    ? `Depot: ${assetMovement.asset_movement_from_depot?.name || 'N/A'}`
                    : assetMovement.from_customer_id
                        ? `Customer: ${assetMovement.asset_movement_from_customer?.name || 'N/A'}`
                        : 'N/A';
                const toLocation = assetMovement.to_depot_id
                    ? `Depot: ${assetMovement.asset_movement_to_depot?.name || 'N/A'}`
                    : assetMovement.to_customer_id
                        ? `Customer: ${assetMovement.asset_movement_to_customer?.name || 'N/A'}`
                        : 'N/A';
                const assetList = assetMovement.asset_movement_assets
                    .map((aa) => `${aa.asset_movement_assets_asset.name || aa.asset_movement_assets_asset.code || aa.asset_movement_assets_asset.serial_number} (${aa.asset_movement_assets_asset.asset_master_asset_types?.name || 'Unknown'})`)
                    .join(', ');
                return {
                    movement_number: `AM-${reference_id}`,
                    movement_type: assetMovement.movement_type || 'N/A',
                    from_location: fromLocation,
                    to_location: toLocation,
                    performed_by: assetMovement.asset_movements_performed_by?.name || 'N/A',
                    movement_date: assetMovement.movement_date
                        ? new Date(assetMovement.movement_date).toLocaleDateString()
                        : new Date().toLocaleDateString(),
                    assets: assetList,
                    notes: assetMovement.notes || '',
                    approval_status: assetMovement.approval_status || 'P',
                };
            default:
                return {};
        }
    }
    catch (error) {
        console.error('Error getting request details:', error);
        return {};
    }
}
exports.default = getRequestDetailsByType;
//# sourceMappingURL=getDetails.js.map