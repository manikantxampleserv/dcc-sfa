/**
 * @fileoverview Vehicles Seeder
 * @description Creates 11 sample vehicles for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockVehicle {
  vehicle_number: string;
  type: string;
  make?: string;
  model?: string;
  year?: number;
  capacity?: number;
  fuel_type?: string;
  assigned_to?: number;
  is_active: string;
}

// Mock Vehicles Data (11 vehicles)
const mockVehicles: MockVehicle[] = [
  {
    vehicle_number: 'VH-001',
    type: 'Delivery Van',
    make: 'Ford',
    model: 'Transit',
    year: 2023,
    capacity: 1500,
    fuel_type: 'Diesel',
    assigned_to: undefined,
    is_active: 'Y',
  },
  {
    vehicle_number: 'VH-002',
    type: 'Truck',
    make: 'Mercedes',
    model: 'Sprinter',
    year: 2022,
    capacity: 3000,
    fuel_type: 'Diesel',
    assigned_to: undefined,
    is_active: 'Y',
  },
  {
    vehicle_number: 'VH-003',
    type: 'Pickup Truck',
    make: 'Toyota',
    model: 'Hilux',
    year: 2023,
    capacity: 1000,
    fuel_type: 'Petrol',
    assigned_to: undefined,
    is_active: 'Y',
  },
  {
    vehicle_number: 'VH-004',
    type: 'Refrigerated Van',
    make: 'Isuzu',
    model: 'NPR',
    year: 2022,
    capacity: 2000,
    fuel_type: 'Diesel',
    assigned_to: undefined,
    is_active: 'Y',
  },
  {
    vehicle_number: 'VH-005',
    type: 'Box Truck',
    make: 'Hino',
    model: '300 Series',
    year: 2021,
    capacity: 4000,
    fuel_type: 'Diesel',
    assigned_to: undefined,
    is_active: 'Y',
  },
  {
    vehicle_number: 'VH-006',
    type: 'Motorcycle',
    make: 'Honda',
    model: 'CB150R',
    year: 2023,
    capacity: 50,
    fuel_type: 'Petrol',
    assigned_to: undefined,
    is_active: 'Y',
  },
  {
    vehicle_number: 'VH-007',
    type: 'SUV',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2022,
    capacity: 500,
    fuel_type: 'Diesel',
    assigned_to: undefined,
    is_active: 'Y',
  },
  {
    vehicle_number: 'VH-008',
    type: 'Cargo Van',
    make: 'Nissan',
    model: 'NV200',
    year: 2023,
    capacity: 800,
    fuel_type: 'Petrol',
    assigned_to: undefined,
    is_active: 'Y',
  },
  {
    vehicle_number: 'VH-009',
    type: 'Flatbed Truck',
    make: 'Mitsubishi',
    model: 'Fuso',
    year: 2021,
    capacity: 5000,
    fuel_type: 'Diesel',
    assigned_to: undefined,
    is_active: 'Y',
  },
  {
    vehicle_number: 'VH-010',
    type: 'Electric Van',
    make: 'BYD',
    model: 'T3',
    year: 2023,
    capacity: 1200,
    fuel_type: 'Electric',
    assigned_to: undefined,
    is_active: 'Y',
  },
  {
    vehicle_number: 'VH-011',
    type: 'Decommissioned',
    make: 'Old Brand',
    model: 'Outdated Model',
    year: 2015,
    capacity: 1000,
    fuel_type: 'Petrol',
    assigned_to: undefined,
    is_active: 'N',
  },
];

/**
 * Seed Vehicles with mock data
 */
export async function seedVehicles(): Promise<void> {
  try {
    for (const vehicle of mockVehicles) {
      const existingVehicle = await prisma.vehicles.findFirst({
        where: { vehicle_number: vehicle.vehicle_number },
      });

      if (!existingVehicle) {
        await prisma.vehicles.create({
          data: {
            vehicle_number: vehicle.vehicle_number,
            type: vehicle.type,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            capacity: vehicle.capacity,
            fuel_type: vehicle.fuel_type,
            assigned_to: vehicle.assigned_to,
            is_active: vehicle.is_active,
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
 * Clear Vehicles data
 */
export async function clearVehicles(): Promise<void> {
  try {
    await prisma.vehicles.deleteMany({});
  } catch (error) {
    throw error;
  }
}

export { mockVehicles };
