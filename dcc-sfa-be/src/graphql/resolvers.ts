import { getPrisma } from '../configs/prisma.client';

export const resolvers = {
  Query: {
    assetMasters: async (_: any, { filter, limit = 50, offset = 0 }: any) => {
      const where: any = {};

      if (filter) {
        if (filter.id) where.id = filter.id;
        if (filter.assetTypeId) where.asset_type_id = filter.assetTypeId;
        if (filter.assetSubTypeId)
          where.asset_sub_type_id = filter.assetSubTypeId;
        if (filter.isActive) where.is_active = filter.isActive;
        if (filter.name) where.name = { contains: filter.name };
        if (filter.code) where.code = { contains: filter.code };
      }

      return await getPrisma().asset_master.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
          asset_master_image: true,
          asset_maintenance_master: true,
        },
      });
    },

    assetMaster: async (_: any, { id }: { id: number }) => {
      return await getPrisma().asset_master.findUnique({
        where: { id },
        include: {
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
          asset_master_image: true,
          asset_maintenance_master: true,
        },
      });
    },

    coolers: async (_: any, { filter, limit = 50, offset = 0 }: any) => {
      const where: any = {};

      if (filter) {
        if (filter.id) where.id = filter.id;
        if (filter.customerId) where.customer_id = filter.customerId;
        if (filter.assetMasterId) where.asset_master_id = filter.assetMasterId;
        if (filter.coolerTypeId) where.cooler_type_id = filter.coolerTypeId;
        if (filter.coolerSubTypeId)
          where.cooler_sub_type_id = filter.coolerSubTypeId;
        if (filter.technicianId) where.technician_id = filter.technicianId;
        if (filter.isActive) where.is_active = filter.isActive;
        if (filter.status) where.status = filter.status;
        if (filter.code) where.code = { contains: filter.code };
      }

      return await getPrisma().coolers.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          cooler_asset_master: true,
          coolers_customers: true,
          users: true,
          cooler_types: true,
          cooler_sub_types: true,
          cooler_inspections: true,
        },
      });
    },

    cooler: async (_: any, { id }: { id: number }) => {
      return await getPrisma().coolers.findUnique({
        where: { id },
        include: {
          cooler_asset_master: true,
          coolers_customers: true,
          users: true,
          cooler_types: true,
          cooler_sub_types: true,
          cooler_inspections: true,
        },
      });
    },

    coolersByCustomer: async (
      _: any,
      { customerId }: { customerId: number }
    ) => {
      return await getPrisma().coolers.findMany({
        where: { customer_id: customerId },
        include: {
          cooler_asset_master: true,
          coolers_customers: true,
          users: true,
          cooler_types: true,
          cooler_sub_types: true,
          cooler_inspections: true,
        },
      });
    },

    coolerInspections: async (
      _: any,
      { filter, limit = 50, offset = 0 }: any
    ) => {
      const where: any = {};

      if (filter) {
        if (filter.id) where.id = filter.id;
        if (filter.coolerId) where.cooler_id = filter.coolerId;
        if (filter.visitId) where.visit_id = filter.visitId;
        if (filter.inspectedBy) where.inspected_by = filter.inspectedBy;
        if (filter.isActive) where.is_active = filter.isActive;
        if (filter.isWorking) where.is_working = filter.isWorking;
        if (filter.actionRequired)
          where.action_required = filter.actionRequired;
      }

      return await getPrisma().cooler_inspections.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          coolers: true,
          users: true,
          visits: true,
        },
      });
    },

    coolerInspection: async (_: any, { id }: { id: number }) => {
      return await getPrisma().cooler_inspections.findUnique({
        where: { id },
        include: {
          coolers: true,
          users: true,
          visits: true,
        },
      });
    },

    coolerInspectionsByCooler: async (
      _: any,
      { coolerId }: { coolerId: number }
    ) => {
      return await getPrisma().cooler_inspections.findMany({
        where: { cooler_id: coolerId },
        include: {
          coolers: true,
          users: true,
          visits: true,
        },
      });
    },

    coolerInspectionsByInspector: async (
      _: any,
      { inspectedBy }: { inspectedBy: number }
    ) => {
      return await getPrisma().cooler_inspections.findMany({
        where: { inspected_by: inspectedBy },
        include: {
          coolers: true,
          users: true,
          visits: true,
        },
      });
    },
  },

  Mutation: {
    createAssetMaster: async (_: any, { input }: any) => {
      return await getPrisma().asset_master.create({
        data: {
          asset_type_id: input.assetTypeId,
          asset_sub_type_id: input.assetSubTypeId,
          name: input.name,
          code: input.code,
          serial_number: input.serialNumber,
          purchase_date: input.purchaseDate,
          warranty_expiry: input.warrantyExpiry,
          current_location: input.currentLocation,
          current_status: input.currentStatus,
          assigned_to: input.assignedTo,
          createdby: input.createdby,
        },
        include: {
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
        },
      });
    },

    updateAssetMaster: async (_: any, { id, input }: any) => {
      return await getPrisma().asset_master.update({
        where: { id },
        data: {
          asset_type_id: input.assetTypeId,
          asset_sub_type_id: input.assetSubTypeId,
          name: input.name,
          code: input.code,
          serial_number: input.serialNumber,
          purchase_date: input.purchaseDate,
          warranty_expiry: input.warrantyExpiry,
          current_location: input.currentLocation,
          current_status: input.currentStatus,
          assigned_to: input.assignedTo,
          updatedate: new Date(),
          updatedby: input.updatedby,
        },
        include: {
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
        },
      });
    },

    deleteAssetMaster: async (_: any, { id }: { id: number }) => {
      return await getPrisma().asset_master.delete({
        where: { id },
        include: {
          asset_master_asset_types: true,
          asset_master_asset_sub_types: true,
        },
      });
    },

    createCooler: async (_: any, { input }: any) => {
      return await getPrisma().coolers.create({
        data: {
          customer_id: input.customerId,
          code: input.code,
          asset_master_id: input.assetMasterId,
          brand: input.brand,
          model: input.model,
          serial_number: input.serialNumber,
          capacity: input.capacity,
          install_date: input.installDate,
          last_service_date: input.lastServiceDate,
          next_service_due: input.nextServiceDue,
          cooler_type_id: input.coolerTypeId,
          cooler_sub_type_id: input.coolerSubTypeId,
          status: input.status,
          temperature: input.temperature,
          energy_rating: input.energyRating,
          warranty_expiry: input.warrantyExpiry,
          maintenance_contract: input.maintenanceContract,
          technician_id: input.technicianId,
          createdby: input.createdby,
        },
        include: {
          cooler_asset_master: true,
          coolers_customers: true,
          users: true,
          cooler_types: true,
          cooler_sub_types: true,
        },
      });
    },

    updateCooler: async (_: any, { id, input }: any) => {
      return await getPrisma().coolers.update({
        where: { id },
        data: {
          customer_id: input.customerId,
          code: input.code,
          asset_master_id: input.assetMasterId,
          brand: input.brand,
          model: input.model,
          serial_number: input.serialNumber,
          capacity: input.capacity,
          install_date: input.installDate,
          last_service_date: input.lastServiceDate,
          next_service_due: input.nextServiceDue,
          cooler_type_id: input.coolerTypeId,
          cooler_sub_type_id: input.coolerSubTypeId,
          status: input.status,
          temperature: input.temperature,
          energy_rating: input.energyRating,
          warranty_expiry: input.warrantyExpiry,
          maintenance_contract: input.maintenanceContract,
          technician_id: input.technicianId,
          updatedate: new Date(),
          updatedby: input.updatedby,
        },
        include: {
          cooler_asset_master: true,
          coolers_customers: true,
          users: true,
          cooler_types: true,
          cooler_sub_types: true,
        },
      });
    },

    deleteCooler: async (_: any, { id }: { id: number }) => {
      return await getPrisma().coolers.delete({
        where: { id },
        include: {
          cooler_asset_master: true,
          coolers_customers: true,
          users: true,
          cooler_types: true,
          cooler_sub_types: true,
        },
      });
    },

    // CoolerInspection mutations
    createCoolerInspection: async (_: any, { input }: any) => {
      return await getPrisma().cooler_inspections.create({
        data: {
          cooler_id: input.coolerId,
          visit_id: input.visitId,
          inspected_by: input.inspectedBy,
          inspection_date: input.inspectionDate,
          temperature: input.temperature,
          is_working: input.isWorking || 'Y',
          issues: input.issues,
          images: input.images,
          latitude: input.latitude,
          longitude: input.longitude,
          action_required: input.actionRequired || 'N',
          action_taken: input.actionTaken,
          next_inspection_due: input.nextInspectionDue,
          createdby: input.createdby,
        },
        include: {
          coolers: true,
          users: true,
          visits: true,
        },
      });
    },

    updateCoolerInspection: async (_: any, { id, input }: any) => {
      return await getPrisma().cooler_inspections.update({
        where: { id },
        data: {
          cooler_id: input.coolerId,
          visit_id: input.visitId,
          inspected_by: input.inspectedBy,
          inspection_date: input.inspectionDate,
          temperature: input.temperature,
          is_working: input.isWorking,
          issues: input.issues,
          images: input.images,
          latitude: input.latitude,
          longitude: input.longitude,
          action_required: input.actionRequired,
          action_taken: input.actionTaken,
          next_inspection_due: input.nextInspectionDue,
          updatedate: new Date(),
          updatedby: input.updatedby,
        },
        include: {
          coolers: true,
          users: true,
          visits: true,
        },
      });
    },

    deleteCoolerInspection: async (_: any, { id }: { id: number }) => {
      return await getPrisma().cooler_inspections.delete({
        where: { id },
        include: {
          coolers: true,
          users: true,
          visits: true,
        },
      });
    },
  },
};
