/**
 * @fileoverview Asset Master Seeder
 * @description Creates 11 sample assets for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockAsset {
  asset_type_name: string;
  serial_number: string;
  purchase_date?: Date;
  warranty_expiry?: Date;
  current_location?: string;
  current_status?: string;
  assigned_to?: string;
  is_active: string;
}

// Mock Assets Data (11 assets)
const mockAssets: MockAsset[] = [
  {
    asset_type_name: 'Coolers',
    serial_number: 'REF-2024-001',
    purchase_date: new Date('2024-01-01'),
    warranty_expiry: new Date('2026-01-01'),
    current_location: 'Office Kitchen',
    current_status: 'Active',
    assigned_to: 'John Doe',
    is_active: 'Y',
  },
  {
    asset_type_name: 'Fridges',
    serial_number: 'FRZ-2024-002',
    purchase_date: new Date('2024-01-02'),
    warranty_expiry: new Date('2026-01-02'),
    current_location: 'Warehouse A',
    current_status: 'Active',
    assigned_to: 'Jane Smith',
    is_active: 'Y',
  },
  {
    asset_type_name: 'Display Units',
    serial_number: 'DPU-2024-003',
    purchase_date: new Date('2024-01-03'),
    warranty_expiry: new Date('2026-01-03'),
    current_location: 'Showroom',
    current_status: 'Active',
    assigned_to: 'Mike Johnson',
    is_active: 'Y',
  },
  {
    asset_type_name: 'POS Systems',
    serial_number: 'POS-2024-004',
    purchase_date: new Date('2024-01-04'),
    warranty_expiry: new Date('2026-01-04'),
    current_location: 'Cashier Desk',
    current_status: 'Active',
    assigned_to: 'Sarah Wilson',
    is_active: 'Y',
  },
  {
    asset_type_name: 'Security Equipment',
    serial_number: 'CAM-2024-005',
    purchase_date: new Date('2024-01-05'),
    warranty_expiry: new Date('2026-01-05'),
    current_location: 'Main Entrance',
    current_status: 'Active',
    assigned_to: 'David Brown',
    is_active: 'Y',
  },
  {
    asset_type_name: 'Office Equipment',
    serial_number: 'PC-2024-006',
    purchase_date: new Date('2024-01-06'),
    warranty_expiry: new Date('2026-01-06'),
    current_location: 'Office Desk',
    current_status: 'Active',
    assigned_to: 'Lisa Garcia',
    is_active: 'Y',
  },
  {
    asset_type_name: 'Furniture',
    serial_number: 'DSK-2024-007',
    purchase_date: new Date('2024-01-07'),
    warranty_expiry: new Date('2026-01-07'),
    current_location: 'Office Room 1',
    current_status: 'Active',
    assigned_to: 'Tom Anderson',
    is_active: 'Y',
  },
  {
    asset_type_name: 'Vehicles',
    serial_number: 'VAN-2024-008',
    purchase_date: new Date('2024-01-08'),
    warranty_expiry: new Date('2026-01-08'),
    current_location: 'Fleet Garage',
    current_status: 'Active',
    assigned_to: 'Alex Martinez',
    is_active: 'Y',
  },
  {
    asset_type_name: 'Tools & Equipment',
    serial_number: 'DRL-2024-009',
    purchase_date: new Date('2024-01-09'),
    warranty_expiry: new Date('2026-01-09'),
    current_location: 'Tool Room',
    current_status: 'Active',
    assigned_to: 'Emma Davis',
    is_active: 'Y',
  },
  {
    asset_type_name: 'Communication Devices',
    serial_number: 'RAD-2024-010',
    purchase_date: new Date('2024-01-10'),
    warranty_expiry: new Date('2026-01-10'),
    current_location: 'Operations Center',
    current_status: 'Active',
    assigned_to: 'Chris Taylor',
    is_active: 'Y',
  },
  {
    asset_type_name: 'Obsolete Equipment',
    serial_number: 'BRK-2024-011',
    purchase_date: new Date('2020-01-01'),
    warranty_expiry: new Date('2022-01-01'),
    current_location: 'Storage Room',
    current_status: 'Out of Service',
    assigned_to: 'Closed User',
    is_active: 'N',
  },
];

/**
 * Seed Asset Master with mock data
 */
export async function seedAssetMaster(): Promise<void> {
  try {
    // Get all asset types for lookup
    const assetTypes = await prisma.asset_types.findMany({
      select: { id: true, name: true },
    });

    for (const asset of mockAssets) {
      const existingAsset = await prisma.asset_master.findFirst({
        where: { serial_number: asset.serial_number },
      });

      if (!existingAsset) {
        // Find the asset type ID
        const assetType = assetTypes.find(
          at => at.name === asset.asset_type_name
        );

        if (assetType) {
          await prisma.asset_master.create({
            data: {
              asset_type_id: assetType.id,
              serial_number: asset.serial_number,
              purchase_date: asset.purchase_date,
              warranty_expiry: asset.warranty_expiry,
              current_location: asset.current_location,
              current_status: asset.current_status,
              assigned_to: asset.assigned_to,
              is_active: asset.is_active,
              createdate: new Date(),
              createdby: 1,
              log_inst: 1,
            },
          });
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Clear Asset Master data
 */
export async function clearAssetMaster(): Promise<void> {
  try {
    await prisma.asset_master.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockAssets };
