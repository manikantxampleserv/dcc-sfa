/**
 * @fileoverview Asset Types Seeder
 * @description Creates 11 sample asset types for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockAssetType {
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  is_active: string;
}

// Mock Asset Types Data (11 asset types)
const mockAssetTypes: MockAssetType[] = [
  {
    name: 'Coolers',
    description: 'Refrigeration units and cooling equipment',
    category: 'Appliances',
    brand: 'CoolTech',
    is_active: 'Y',
  },
  {
    name: 'Fridges',
    description: 'Refrigerators and freezing equipment',
    category: 'Appliances',
    brand: 'FreezeMaster',
    is_active: 'Y',
  },
  {
    name: 'Display Units',
    description: 'Product display cases and merchandising units',
    category: 'Retail',
    brand: 'DisplayPro',
    is_active: 'Y',
  },
  {
    name: 'POS Systems',
    description: 'Point of sale terminals and payment systems',
    category: 'Technology',
    brand: 'PayTech',
    is_active: 'Y',
  },
  {
    name: 'Security Equipment',
    description: 'CCTV cameras, alarms, and security systems',
    category: 'Security',
    brand: 'SecureVision',
    is_active: 'Y',
  },
  {
    name: 'Office Equipment',
    description: 'Computers, printers, and office machinery',
    category: 'Technology',
    brand: 'TechCorp',
    is_active: 'Y',
  },
  {
    name: 'Furniture',
    description: 'Tables, chairs, desks, and office furniture',
    category: 'Furniture',
    brand: 'FurniCorp',
    is_active: 'Y',
  },
  {
    name: 'Vehicles',
    description: 'Company vehicles for delivery and transportation',
    category: 'Transportation',
    brand: 'AutoCorp',
    is_active: 'Y',
  },
  {
    name: 'Tools & Equipment',
    description: 'Hand tools, power tools, and maintenance equipment',
    category: 'Tools',
    brand: 'ToolMaster',
    is_active: 'Y',
  },
  {
    name: 'Communication Devices',
    description: 'Phones, radios, and communication equipment',
    category: 'Technology',
    brand: 'CommTech',
    is_active: 'Y',
  },
  {
    name: 'Obsolete Equipment',
    description: 'Outdated equipment no longer in use',
    category: 'Discontinued',
    brand: 'OldCorp',
    is_active: 'N',
  },
];

/**
 * Seed Asset Types with mock data
 */
export async function seedAssetTypes(): Promise<void> {
  try {
    for (const assetType of mockAssetTypes) {
      const existingAssetType = await prisma.asset_types.findFirst({
        where: { name: assetType.name },
      });

      if (!existingAssetType) {
        await prisma.asset_types.create({
          data: {
            name: assetType.name,
            description: assetType.description,
            category: assetType.category,
            brand: assetType.brand,
            is_active: assetType.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Clear Asset Types data
 */
export async function clearAssetTypes(): Promise<void> {
  try {
    await prisma.asset_types.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockAssetTypes };
