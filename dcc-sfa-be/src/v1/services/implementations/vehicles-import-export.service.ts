import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class VehiclesImportExportService extends ImportExportService<any> {
  protected modelName = 'vehicles' as const;
  protected displayName = 'Vehicles';
  protected uniqueFields = ['vehicle_number'];
  protected searchFields = ['vehicle_number', 'type', 'make', 'model'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'vehicle_number',
      header: 'Vehicle Number',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 1)
          return 'Vehicle number must be at least 1 character';
        if (value.length > 20)
          return 'Vehicle number must be less than 20 characters';
        return true;
      },
      description: 'Unique vehicle number (required, 1-20 characters)',
    },
    {
      key: 'type',
      header: 'Vehicle Type',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 1) return 'Type is required';
        if (value.length > 20) return 'Type must be less than 20 characters';
        return true;
      },
      description:
        'Type of vehicle (required, max 20 chars, e.g., Truck, Van, Car)',
    },
    {
      key: 'make',
      header: 'Make',
      width: 20,
      type: 'string',
      validation: value =>
        !value || value.length <= 50 || 'Make must be less than 50 characters',
      description: 'Vehicle make/manufacturer (optional, max 50 chars)',
    },
    {
      key: 'model',
      header: 'Model',
      width: 20,
      type: 'string',
      validation: value =>
        !value || value.length <= 50 || 'Model must be less than 50 characters',
      description: 'Vehicle model (optional, max 50 chars)',
    },
    {
      key: 'year',
      header: 'Year',
      width: 12,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const year = parseInt(value);
        return (
          (year >= 1900 && year <= 2100) || 'Year must be between 1900 and 2100'
        );
      },
      description: 'Manufacturing year (optional, 1900-2100)',
    },
    {
      key: 'capacity',
      header: 'Capacity',
      width: 15,
      type: 'number',
      validation: value =>
        !value || !isNaN(parseFloat(value)) || 'Capacity must be a number',
      description: 'Vehicle capacity in tons or cubic meters (optional)',
    },
    {
      key: 'fuel_type',
      header: 'Fuel Type',
      width: 15,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 20 ||
        'Fuel type must be less than 20 characters',
      description:
        'Type of fuel (optional, max 20 chars, e.g., Diesel, Petrol, Electric)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 15,
      type: 'string',
      defaultValue: 'available',
      validation: value =>
        !value ||
        value.length <= 20 ||
        'Status must be less than 20 characters',
      description:
        'Vehicle status (optional, max 20 chars, e.g., available, in-use, maintenance)',
    },
    {
      key: 'mileage',
      header: 'Mileage',
      width: 15,
      type: 'number',
      validation: value =>
        !value || !isNaN(parseFloat(value)) || 'Mileage must be a number',
      description: 'Current mileage in kilometers (optional)',
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
        vehicle_number: 'TRK-001',
        type: 'Truck',
        make: 'Toyota',
        model: 'Hilux',
        year: 2022,
        capacity: 2.5,
        fuel_type: 'Diesel',
        status: 'available',
        mileage: 15000,
        is_active: 'Y',
      },
      {
        vehicle_number: 'VAN-002',
        type: 'Van',
        make: 'Ford',
        model: 'Transit',
        year: 2021,
        capacity: 3.0,
        fuel_type: 'Diesel',
        status: 'in-use',
        mileage: 25000,
        is_active: 'Y',
      },
      {
        vehicle_number: 'CAR-003',
        type: 'Car',
        make: 'Honda',
        model: 'Civic',
        year: 2023,
        capacity: 0.5,
        fuel_type: 'Petrol',
        status: 'available',
        mileage: 8000,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(vehicle => ({
      vehicle_number: vehicle.vehicle_number,
      type: vehicle.type,
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      capacity: vehicle.capacity || '',
      fuel_type: vehicle.fuel_type || '',
      status: vehicle.status || '',
      mileage: vehicle.mileage || '',
      is_active: vehicle.is_active || 'Y',
      created_date: vehicle.createdate?.toISOString().split('T')[0] || '',
      created_by: vehicle.createdby || '',
      updated_date: vehicle.updatedate?.toISOString().split('T')[0] || '',
      updated_by: vehicle.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.vehicles : prisma.vehicles;

    const existingVehicle = await model.findFirst({
      where: { vehicle_number: data.vehicle_number },
    });

    if (existingVehicle) {
      return `Vehicle with number ${data.vehicle_number} already exists`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    // Vehicles don't have required foreign keys for basic import
    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      ...data,
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.vehicles : prisma.vehicles;

    const existing = await model.findFirst({
      where: { vehicle_number: data.vehicle_number },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new (await import('exceljs')).Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Created Date', key: 'created_date', width: 15 },
      { header: 'Created By', key: 'created_by', width: 15 },
      { header: 'Updated Date', key: 'updated_date', width: 15 },
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
    exportData.forEach((row: any, index: number) => {
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
    });

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    const summaryRow = worksheet.addRow([]);
    summaryRow.getCell(1).value = `Total Vehicles: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
