import prisma from '../../../configs/prisma.client';
import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';

export class CustomerAssetsImportExportService extends ImportExportService<any> {
  protected modelName = 'customer_assets' as const;
  protected displayName = 'Customer Assets';
  protected uniqueFields = ['customer_id', 'serial_number'];
  protected searchFields = [
    'model',
    'serial_number',
    'status',
    'remarks',
    'maintenance_contract',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'customer_id',
      header: 'Customer ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Customer ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Customer ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the customer owning the asset (required)',
    },
    {
      key: 'asset_type_id',
      header: 'Asset Type ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Asset Type ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Asset Type ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the asset type (required)',
    },
    {
      key: 'brand_id',
      header: 'Brand ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Brand ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the brand (optional)',
    },
    {
      key: 'model',
      header: 'Model',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Model must be less than 100 characters',
      description: 'Model name or number (optional, max 100 chars)',
    },
    {
      key: 'serial_number',
      header: 'Serial Number',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Serial number must be less than 100 characters',
      description: 'Serial number of the asset (optional, max 100 chars)',
    },
    {
      key: 'capacity',
      header: 'Capacity',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const capacity = parseInt(value);
        if (isNaN(capacity) || capacity < 0)
          return 'Capacity must be a non-negative number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'Capacity of the asset (optional, non-negative)',
    },
    {
      key: 'install_date',
      header: 'Installation Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Date when asset was installed (optional, YYYY-MM-DD)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 15,
      type: 'string',
      defaultValue: 'working',
      validation: value => {
        if (!value) return true;
        const validStatuses = [
          'working',
          'faulty',
          'under_repair',
          'replaced',
          'retired',
          'pending',
        ];
        return (
          validStatuses.includes(value.toLowerCase()) ||
          `Status must be one of: ${validStatuses.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'working'),
      description:
        'Asset status: working, faulty, under_repair, replaced, retired, pending (defaults to working)',
    },
    {
      key: 'last_scanned_date',
      header: 'Last Scanned Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Date when asset was last scanned (optional, YYYY-MM-DD)',
    },
    {
      key: 'remarks',
      header: 'Remarks',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 500 ||
        'Remarks must be less than 500 characters',
      description: 'Additional remarks or notes (optional, max 500 chars)',
    },
    {
      key: 'technician_id',
      header: 'Technician ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Technician ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the assigned technician (optional)',
    },
    {
      key: 'warranty_expiry',
      header: 'Warranty Expiry Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Warranty expiry date (optional, YYYY-MM-DD)',
    },
    {
      key: 'maintenance_contract',
      header: 'Maintenance Contract',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Maintenance contract must be less than 100 characters',
      description:
        'Maintenance contract number or details (optional, max 100 chars)',
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
    // Fetch actual IDs from database to ensure validity
    const customers = await prisma.customers.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const assetTypes = await prisma.asset_types.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const brands = await prisma.brands.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const users = await prisma.users.findMany({
      take: 2,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const customerIds = customers.map(c => c.id);
    const assetTypeIds = assetTypes.map(at => at.id);
    const brandIds = brands.map(b => b.id);
    const userIds = users.map(u => u.id);

    const customerId1 = customerIds[0] || 1;
    const customerId2 = customerIds[1] || 2;
    const customerId3 = customerIds[2] || 3;
    const assetTypeId1 = assetTypeIds[0] || 1;
    const assetTypeId2 = assetTypeIds[1] || 2;
    const assetTypeId3 = assetTypeIds[2] || 3;
    const brandId1 = brandIds[0] || null;
    const brandId2 = brandIds[1] || null;
    const technicianId1 = userIds[0] || null;
    const technicianId2 = userIds[1] || null;

    return [
      {
        customer_id: customerId1,
        asset_type_id: assetTypeId1,
        brand_id: brandId1,
        model: 'XYZ-2000',
        serial_number: 'SN123456789',
        capacity: 500,
        install_date: '2023-01-15',
        status: 'working',
        last_scanned_date: '2024-01-10',
        remarks: 'Installed and working properly',
        technician_id: technicianId1,
        warranty_expiry: '2025-01-15',
        maintenance_contract: 'MC-2023-001',
        is_active: 'Y',
      },
      {
        customer_id: customerId2,
        asset_type_id: assetTypeId2,
        brand_id: brandId2,
        model: 'ABC-1500',
        serial_number: 'SN987654321',
        capacity: 300,
        install_date: '2023-06-20',
        status: 'working',
        last_scanned_date: '2024-01-12',
        remarks: 'Regular maintenance scheduled',
        technician_id: technicianId2,
        warranty_expiry: '2024-06-20',
        maintenance_contract: 'MC-2023-002',
        is_active: 'Y',
      },
      {
        customer_id: customerId3,
        asset_type_id: assetTypeId3,
        brand_id: brandId1,
        model: 'PRO-3000',
        serial_number: 'SN456789123',
        capacity: 750,
        install_date: '2022-12-01',
        status: 'faulty',
        last_scanned_date: '2024-01-05',
        remarks: 'Requires urgent repair',
        technician_id: technicianId1,
        warranty_expiry: '2023-12-01',
        maintenance_contract: 'MC-2022-015',
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
      customer_id: asset.customer_id || '',
      customer_name: asset.customer_assets_customers?.name || '',
      customer_code: asset.customer_assets_customers?.code || '',
      asset_type_id: asset.asset_type_id || '',
      asset_type_name: asset.customer_asset_types?.name || '',
      brand_id: asset.brand_id || '',
      brand_name: asset.customer_asset_brand?.name || '',
      model: asset.model || '',
      serial_number: asset.serial_number || '',
      capacity: asset.capacity || '',
      install_date: asset.install_date
        ? new Date(asset.install_date).toISOString().split('T')[0]
        : '',
      status: asset.status || '',
      last_scanned_date: asset.last_scanned_date
        ? new Date(asset.last_scanned_date).toISOString().split('T')[0]
        : '',
      remarks: asset.remarks || '',
      technician_id: asset.technician_id || '',
      technician_name: asset.customer_assets_users?.name || '',
      warranty_expiry: asset.warranty_expiry
        ? new Date(asset.warranty_expiry).toISOString().split('T')[0]
        : '',
      maintenance_contract: asset.maintenance_contract || '',
      is_active: asset.is_active || 'Y',
      created_date: asset.createdate
        ? new Date(asset.createdate).toISOString().split('T')[0]
        : '',
      created_by: asset.createdby || '',
      updated_date: asset.updatedate
        ? new Date(asset.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: asset.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.customer_assets : prisma.customer_assets;

    // Check for duplicate serial number for same customer
    if (data.customer_id && data.serial_number) {
      const existingAsset = await model.findFirst({
        where: {
          customer_id: data.customer_id,
          serial_number: data.serial_number,
        },
      });

      if (existingAsset) {
        return `Asset with serial number "${data.serial_number}" already exists for Customer ID ${data.customer_id}`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    // Validate customer exists
    if (data.customer_id) {
      try {
        const customer = await prismaClient.customers.findUnique({
          where: { id: data.customer_id },
        });
        if (!customer) {
          return `Customer with ID ${data.customer_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Customer ID ${data.customer_id}`;
      }
    }

    // Validate asset type exists
    if (data.asset_type_id) {
      try {
        const assetType = await prismaClient.asset_types.findUnique({
          where: { id: data.asset_type_id },
        });
        if (!assetType) {
          return `Asset Type with ID ${data.asset_type_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Asset Type ID ${data.asset_type_id}`;
      }
    }

    // Validate brand exists (if provided)
    if (data.brand_id) {
      try {
        const brand = await prismaClient.brands.findUnique({
          where: { id: data.brand_id },
        });
        if (!brand) {
          return `Brand with ID ${data.brand_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Brand ID ${data.brand_id}`;
      }
    }

    // Validate technician exists (if provided)
    if (data.technician_id) {
      try {
        const technician = await prismaClient.users.findUnique({
          where: { id: data.technician_id },
        });
        if (!technician) {
          return `Technician with ID ${data.technician_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Technician ID ${data.technician_id}`;
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      customer_id: data.customer_id,
      asset_type_id: data.asset_type_id,
      brand_id: data.brand_id || null,
      model: data.model || null,
      serial_number: data.serial_number || null,
      capacity: data.capacity || null,
      install_date: data.install_date || null,
      status: data.status || 'working',
      last_scanned_date: data.last_scanned_date || null,
      remarks: data.remarks || null,
      technician_id: data.technician_id || null,
      warranty_expiry: data.warranty_expiry || null,
      maintenance_contract: data.maintenance_contract || null,
      is_active: data.is_active || 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };
  }

  async importData(
    data: any[],
    userId: number,
    options: any = {}
  ): Promise<any> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const importedData: any[] = [];
    const detailedErrors: any[] = [];

    for (const [index, row] of data.entries()) {
      const rowNum = index + 2;

      try {
        const duplicateCheck = await this.checkDuplicate(row);

        if (duplicateCheck) {
          if (options.skipDuplicates) {
            failed++;
            errors.push(`Row ${rowNum}: Skipped - ${duplicateCheck}`);
            continue;
          } else if (options.updateExisting) {
            const updated = await this.updateExisting(row, userId);
            if (updated) {
              importedData.push(updated);
              success++;
            }
            continue;
          } else {
            throw new Error(duplicateCheck);
          }
        }

        const fkValidation = await this.validateForeignKeys(row);
        if (fkValidation) {
          throw new Error(fkValidation);
        }

        const preparedData = await this.prepareDataForImport(row, userId);

        const created = await prisma.customer_assets.create({
          data: preparedData,
        });

        importedData.push(created);
        success++;
      } catch (error: any) {
        failed++;
        const errorMessage = error.message || 'Unknown error';
        errors.push(`Row ${rowNum}: ${errorMessage}`);
        detailedErrors.push({
          row: rowNum,
          errors: [
            {
              type: errorMessage.includes('does not exist')
                ? 'foreign_key'
                : errorMessage.includes('already exists')
                  ? 'duplicate'
                  : 'validation',
              message: errorMessage,
              action: 'rejected',
            },
          ],
        });
      }
    }

    return {
      success,
      failed,
      errors,
      data: importedData,
      detailedErrors: detailedErrors.length > 0 ? detailedErrors : undefined,
    };
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.customer_assets : prisma.customer_assets;

    const existing = await model.findFirst({
      where: {
        customer_id: data.customer_id,
        serial_number: data.serial_number,
      },
    });

    if (!existing) return null;

    const updateData: any = {
      asset_type_id: data.asset_type_id || existing.asset_type_id,
      brand_id: data.brand_id !== undefined ? data.brand_id : existing.brand_id,
      model: data.model !== undefined ? data.model : existing.model,
      capacity: data.capacity !== undefined ? data.capacity : existing.capacity,
      install_date:
        data.install_date !== undefined
          ? data.install_date
          : existing.install_date,
      status: data.status || existing.status,
      last_scanned_date:
        data.last_scanned_date !== undefined
          ? data.last_scanned_date
          : existing.last_scanned_date,
      remarks: data.remarks !== undefined ? data.remarks : existing.remarks,
      technician_id:
        data.technician_id !== undefined
          ? data.technician_id
          : existing.technician_id,
      warranty_expiry:
        data.warranty_expiry !== undefined
          ? data.warranty_expiry
          : existing.warranty_expiry,
      maintenance_contract:
        data.maintenance_contract !== undefined
          ? data.maintenance_contract
          : existing.maintenance_contract,
      is_active: data.is_active || existing.is_active,
      updatedby: userId,
      updatedate: new Date(),
    };

    return await model.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { createdate: 'desc' },
      include: {
        customer_assets_customers: {
          select: {
            name: true,
            code: true,
            city: true,
          },
        },
        customer_asset_types: {
          select: {
            name: true,
          },
        },
        customer_asset_brand: {
          select: {
            name: true,
          },
        },
        customer_assets_users: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            customers_assets_history: true,
          },
        },
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      { header: 'Asset ID', key: 'id', width: 12 },
      ...this.columns,
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Customer Code', key: 'customer_code', width: 20 },
      { header: 'Asset Type Name', key: 'asset_type_name', width: 25 },
      { header: 'Brand Name', key: 'brand_name', width: 20 },
      { header: 'Technician Name', key: 'technician_name', width: 25 },
      { header: 'History Count', key: 'history_count', width: 15 },
      { header: 'Created Date', key: 'created_date', width: 20 },
      { header: 'Created By', key: 'created_by', width: 15 },
      { header: 'Updated Date', key: 'updated_date', width: 20 },
      { header: 'Updated By', key: 'updated_by', width: 15 },
    ];

    worksheet.columns = exportColumns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    const exportData = await this.transformDataForExport(data);
    let totalAssets = 0;
    let activeAssets = 0;
    let inactiveAssets = 0;
    let workingAssets = 0;
    let faultyAssets = 0;
    const statusCount: any = {};
    const assetTypeCount: any = {};
    const brandCount: any = {};

    exportData.forEach((row: any, index: number) => {
      const asset = data[index] as any;

      row.id = asset.id;
      row.customer_name = asset.customer_assets_customers?.name || '';
      row.customer_code = asset.customer_assets_customers?.code || '';
      row.asset_type_name = asset.customer_asset_types?.name || '';
      row.brand_name = asset.customer_asset_brand?.name || '';
      row.technician_name = asset.customer_assets_users?.name || '';
      row.history_count = asset._count?.customers_assets_history || 0;

      totalAssets++;
      if (asset.is_active === 'Y') activeAssets++;
      if (asset.is_active === 'N') inactiveAssets++;
      if (asset.status === 'working') workingAssets++;
      if (asset.status === 'faulty') faultyAssets++;

      if (asset.status) {
        statusCount[asset.status] = (statusCount[asset.status] || 0) + 1;
      }

      const assetType = asset.customer_asset_types?.name || 'Unknown';
      assetTypeCount[assetType] = (assetTypeCount[assetType] || 0) + 1;

      const brand = asset.customer_asset_brand?.name || 'Unknown';
      brandCount[brand] = (brandCount[brand] || 0) + 1;

      const excelRow = worksheet.addRow(row);
      if (index % 2 === 0) {
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }

      excelRow.eachCell((cell: any) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      const statusCell = excelRow.getCell('status');
      switch (asset.status?.toLowerCase()) {
        case 'working':
          statusCell.font = { color: { argb: 'FF008000' }, bold: true };
          break;
        case 'faulty':
          statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
          break;
        case 'under_repair':
          statusCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
          break;
        case 'retired':
          statusCell.font = { color: { argb: 'FF808080' }, bold: true };
          break;
      }

      if (asset.is_active === 'N') {
        excelRow.getCell('is_active').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }

      if (
        asset.warranty_expiry &&
        new Date(asset.warranty_expiry) < new Date()
      ) {
        excelRow.getCell('warranty_expiry').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }
    });

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 35 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    summarySheet.addRow({ metric: 'Total Assets', value: totalAssets });
    summarySheet.addRow({ metric: 'Active Assets', value: activeAssets });
    summarySheet.addRow({ metric: 'Inactive Assets', value: inactiveAssets });
    summarySheet.addRow({ metric: 'Working Assets', value: workingAssets });
    summarySheet.addRow({ metric: 'Faulty Assets', value: faultyAssets });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Status Breakdown', value: '' });
    Object.keys(statusCount).forEach(status => {
      summarySheet.addRow({
        metric: `  ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        value: statusCount[status],
      });
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Assets by Type', value: '' });
    Object.keys(assetTypeCount)
      .sort((a, b) => assetTypeCount[b] - assetTypeCount[a])
      .forEach(assetType => {
        summarySheet.addRow({
          metric: `  ${assetType}`,
          value: assetTypeCount[assetType],
        });
      });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Assets by Brand', value: '' });
    Object.keys(brandCount)
      .sort((a, b) => brandCount[b] - brandCount[a])
      .forEach(brand => {
        summarySheet.addRow({
          metric: `  ${brand}`,
          value: brandCount[brand],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
