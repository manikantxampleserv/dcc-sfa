import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class AssetMasterImportExportService extends ImportExportService<any> {
  protected modelName = 'asset_master' as const;
  protected displayName = 'Asset Master';
  protected uniqueFields = ['serial_number'];
  protected searchFields = [
    'serial_number',
    'current_location',
    'current_status',
    'assigned_to',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'asset_type_id',
      header: 'Asset Type ID',
      width: 15,
      required: true,
      type: 'number',
      transform: value => parseInt(value),
      description: 'ID of the asset type (required)',
    },
    {
      key: 'serial_number',
      header: 'Serial Number',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 1) return 'Serial number is required';
        if (value.length > 100)
          return 'Serial number must be less than 100 characters';
        if (!/^[A-Za-z0-9\-_]+$/.test(value))
          return 'Serial number can only contain letters, numbers, hyphens, and underscores';
        return true;
      },
      transform: value => value.toUpperCase().trim(),
      description:
        'Unique serial number (required, max 100 chars, alphanumeric)',
    },
    {
      key: 'purchase_date',
      header: 'Purchase Date',
      width: 15,
      type: 'date',
      transform: value => (value ? new Date(value) : null),
      description: 'Date of purchase (optional, format: YYYY-MM-DD)',
    },
    {
      key: 'warranty_expiry',
      header: 'Warranty Expiry',
      width: 15,
      type: 'date',
      transform: value => (value ? new Date(value) : null),
      description: 'Warranty expiry date (optional, format: YYYY-MM-DD)',
    },
    {
      key: 'current_location',
      header: 'Current Location',
      width: 30,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 255 ||
        'Current location must be less than 255 characters',
      description: 'Current location of the asset (optional, max 255 chars)',
    },
    {
      key: 'current_status',
      header: 'Current Status',
      width: 20,
      type: 'string',
      validation: value => {
        if (!value) return true;
        const validStatuses = [
          'Available',
          'In Use',
          'Under Maintenance',
          'Retired',
          'Lost',
          'Damaged',
        ];
        return (
          validStatuses.includes(value) ||
          `Status must be one of: ${validStatuses.join(', ')}`
        );
      },
      description:
        'Current status: Available, In Use, Under Maintenance, Retired, Lost, Damaged',
    },
    {
      key: 'assigned_to',
      header: 'Assigned To',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Assigned to must be less than 100 characters',
      description: 'Person or department assigned to (optional, max 100 chars)',
    },
    {
      key: 'is_active',
      header: 'Is Active',
      width: 12,
      type: 'string',
      defaultValue: 'Y',
      validation: value => {
        const upperValue = value ? value.toString().toUpperCase() : 'Y';
        return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
      },
      transform: value => (value ? value.toString().toUpperCase() : 'Y'),
      description: 'Active status - Y for Yes, N for No (defaults to Y)',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    return [
      {
        asset_type_id: 1,
        serial_number: 'COOLER-001-2024',
        purchase_date: '2024-01-15',
        warranty_expiry: '2026-01-15',
        current_location: 'Main Warehouse - Section A',
        current_status: 'Available',
        assigned_to: 'Warehouse Team',
        is_active: 'Y',
      },
      {
        asset_type_id: 2,
        serial_number: 'FRIDGE-002-2024',
        purchase_date: '2024-02-20',
        warranty_expiry: '2027-02-20',
        current_location: 'Store #001 - Downtown',
        current_status: 'In Use',
        assigned_to: 'Store Manager',
        is_active: 'Y',
      },
      {
        asset_type_id: 1,
        serial_number: 'COOLER-003-2023',
        purchase_date: '2023-12-10',
        warranty_expiry: '2025-12-10',
        current_location: 'Maintenance Workshop',
        current_status: 'Under Maintenance',
        assigned_to: 'Maintenance Team',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(asset => ({
      asset_type_id: asset.asset_type_id,
      asset_type_name: asset.asset_master_asset_types?.name || '',
      serial_number: asset.serial_number,
      purchase_date: asset.purchase_date
        ? asset.purchase_date.toISOString().split('T')[0]
        : '',
      warranty_expiry: asset.warranty_expiry
        ? asset.warranty_expiry.toISOString().split('T')[0]
        : '',
      current_location: asset.current_location || '',
      current_status: asset.current_status || '',
      assigned_to: asset.assigned_to || '',
      is_active: asset.is_active || 'Y',
      created_date: asset.createdate?.toISOString().split('T')[0] || '',
      created_by: asset.createdby || '',
      updated_date: asset.updatedate?.toISOString().split('T')[0] || '',
      updated_by: asset.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.asset_master : prisma.asset_master;

    const existingSerial = await model.findFirst({
      where: { serial_number: data.serial_number },
    });

    if (existingSerial) {
      return `Asset with serial number ${data.serial_number} already exists`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      asset_type_id: data.asset_type_id,
      serial_number: data.serial_number,
      purchase_date: data.purchase_date || null,
      warranty_expiry: data.warranty_expiry || null,
      current_location: data.current_location || null,
      current_status: data.current_status || 'Available',
      assigned_to: data.assigned_to || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    const assetType = await prismaClient.asset_types.findUnique({
      where: { id: data.asset_type_id },
    });
    if (!assetType) {
      return `Asset type with ID ${data.asset_type_id} does not exist`;
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return this.transformDataForImport(data, userId);
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.asset_master : prisma.asset_master;

    const existing = await model.findFirst({
      where: { serial_number: data.serial_number },
    });

    if (!existing) return null;

    const updateData = {
      ...data,
      updatedby: userId,
      updatedate: new Date(),
    };

    return await model.update({
      where: { id: existing.id },
      data: updateData,
    });
  }
}
