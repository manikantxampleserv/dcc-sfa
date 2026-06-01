import prisma from '../configs/prisma.client';

async function getRequestDetailsByType(
  request_type: string,
  reference_id: number | null,
  request_data?: string | null
): Promise<any> {
  if (!reference_id && !request_data) return {};

  try {
    switch (request_type) {
      case 'ORDER_APPROVAL':
        const order = await prisma.orders.findUnique({
          where: { id: reference_id || 0 },
          include: {
            orders_customers: true,
            orders_salesperson_users: true,
          },
        });

        if (!order) return {};

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
        break;

      case 'LOCATION_RESET':
        const customer = await prisma.customers.findUnique({
          where: { id: reference_id || 0 },
          select: {
            id: true,
            code: true,
            name: true,
            email: true,
            phone_number: true,
            address: true,
            city: true,
            state: true,
            zipcode: true,
            contact_person: true,
            type: true,
            latitude: true,
            longitude: true,
            is_active: true,
            createdate: true,
          },
        });

        if (!customer) {
          return {};
        }

        const result = {
          customer_id: customer.id,
          customer_code: customer.code || 'N/A',
          customer_name: customer.name || 'N/A',
          customer_email: customer.email || 'N/A',
          customer_phone: customer.phone_number || 'N/A',
          customer_address: customer.address || 'N/A',
          customer_city: customer.city || 'N/A',
          customer_state: customer.state || 'N/A',
          customer_zipcode: customer.zipcode || 'N/A',
          customer_contact_person: customer.contact_person || 'N/A',
          customer_type: customer.type || 'N/A',
          current_latitude: customer.latitude,
          current_longitude: customer.longitude,
          customer_status: customer.is_active || 'N/A',
          created_date: customer.createdate
            ? new Date(customer.createdate).toLocaleDateString()
            : 'N/A',
        };

        return result;

      case 'CUSTOMER_CREATION':
        if (request_data) {
          try {
            const parsedData = JSON.parse(request_data);

            const customerData = parsedData.customer_data;

            if (customerData) {
              const result = {
                customer_status: 'Pending Creation',
                customer_id: 'Pending',
                customer_name: customerData.name || 'N/A',
                customer_code: customerData.code || 'N/A',
                customer_email: customerData.email || 'N/A',
                customer_phone: customerData.phone_number || 'N/A',
                customer_city: customerData.city || 'N/A',
                customer_state: customerData.state || 'N/A',
                platform_type: parsedData.platform_type || 'N/A',
                requested_by: parsedData.requested_by || 'N/A',
                requested_date: parsedData.requested_date || 'N/A',
                message: 'Customer creation request - customer not yet created',
              };
              return result;
            }
          } catch (parseError) {
            console.error(
              'Error parsing customer creation request data:',
              parseError
            );
          }
        }

        return {
          customer_status: 'Pending Creation',
          customer_id: 'Pending',
          message: 'Customer creation request - customer not yet created',
        };
      case 'ASSET_MOVEMENT_APPROVAL':
        const assetMovement = await prisma.asset_movements.findUnique({
          where: { id: reference_id || 0 },
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

        if (!assetMovement) return {};

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
          .map(
            (aa: any) =>
              `${aa.asset_movement_assets_asset.name || aa.asset_movement_assets_asset.code || aa.asset_movement_assets_asset.serial_number} (${aa.asset_movement_assets_asset.asset_master_asset_types?.name || 'Unknown'})`
          )
          .join(', ');

        return {
          movement_number: `AM-${reference_id}`,
          movement_type: assetMovement.movement_type || 'N/A',
          from_location: fromLocation,
          to_location: toLocation,
          performed_by:
            assetMovement.asset_movements_performed_by?.name || 'N/A',
          movement_date: assetMovement.movement_date
            ? new Date(assetMovement.movement_date).toLocaleDateString()
            : new Date().toLocaleDateString(),
          assets: assetList,
          notes: assetMovement.notes || '',
          approval_status: assetMovement.approval_status || 'P',
        };

      case 'ASSET_MASTER_APPROVAL':
        const assetMaster = await prisma.asset_master.findUnique({
          where: { id: reference_id || 0 },
          include: {
            asset_master_asset_types: {
              select: { id: true, name: true },
            },
            asset_master_asset_sub_types: {
              select: { id: true, name: true },
            },
            asset_master_brands: {
              select: { id: true, name: true },
            },
            asset_master_depot: {
              select: { id: true, name: true, code: true },
            },
            asset_master_outlet: {
              select: { id: true, name: true, code: true },
            },
          },
        });

        if (!assetMaster) return {};

        const parsedAssetData = request_data ? JSON.parse(request_data) : {};

        return {
          asset_id: assetMaster.id,
          asset_name: assetMaster.name,
          asset_code: assetMaster.code,
          asset_serial_number: assetMaster.serial_number,
          asset_type: assetMaster.asset_master_asset_types?.name || 'N/A',
          asset_sub_type:
            assetMaster.asset_master_asset_sub_types?.name || 'N/A',
          asset_brand: assetMaster.asset_master_brands?.name || 'N/A',
          current_status: assetMaster.current_status || 'N/A',
          requested_status: parsedAssetData.requested_status || 'N/A',
          previous_status: parsedAssetData.previous_status || 'N/A',
          current_location: assetMaster.current_location || 'N/A',
          depot_name: assetMaster.asset_master_depot?.name || 'N/A',
          depot_code: assetMaster.asset_master_depot?.code || 'N/A',
          customer_name: assetMaster.asset_master_outlet?.name || 'N/A',
          customer_code: assetMaster.asset_master_outlet?.code || 'N/A',
          requested_depot_id: parsedAssetData.depot_id || null,
          requested_customer_id: parsedAssetData.customer_id || null,
          barcode: assetMaster.barcode || 'N/A',
          nfc_tag: assetMaster.nfc_tag || 'N/A',
          purchase_date: assetMaster.purchase_date
            ? new Date(assetMaster.purchase_date).toLocaleDateString()
            : 'N/A',
          warranty_expiry: assetMaster.warranty_expiry
            ? new Date(assetMaster.warranty_expiry).toLocaleDateString()
            : 'N/A',
          is_active: assetMaster.is_active,
          created_date: assetMaster.createdate
            ? new Date(assetMaster.createdate).toLocaleDateString()
            : 'N/A',
        };

      default:
        return {};
    }
  } catch (error) {
    console.error('Error getting request details:', error);
    return {};
  }
}

export default getRequestDetailsByType;
