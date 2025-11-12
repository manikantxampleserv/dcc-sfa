import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import * as ExcelJS from 'exceljs';
import prisma from '../../../configs/prisma.client';

export class UnitOfMeasurementImportExportService extends ImportExportService<any> {
  protected modelName = 'unit_of_measurement' as const;
  protected displayName = 'Unit of Measurement';
  protected uniqueFields = ['name'];
  protected searchFields = ['name', 'description', 'category', 'symbol'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Unit Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Unit name is required';
        if (value.length < 2) return 'Unit name must be at least 2 characters';
        if (value.length > 100)
          return 'Unit name must not exceed 100 characters';
        return true;
      },
      transform: value => value.toString().trim(),
      description:
        'Name of the unit of measurement (required, 2-100 characters)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 30,
      type: 'string',
      validation: value => {
        if (value && value.length > 500) {
          return 'Description must not exceed 500 characters';
        }
        return true;
      },
      transform: value => (value ? value.toString().trim() : null),
      description: 'Description of the unit (optional, max 500 characters)',
    },
    {
      key: 'category',
      header: 'Category',
      width: 20,
      type: 'string',
      validation: value => {
        if (value && value.length > 50) {
          return 'Category must not exceed 50 characters';
        }
        return true;
      },
      transform: value => (value ? value.toString().trim() : null),
      description: 'Category of the unit (optional, max 50 characters)',
    },
    {
      key: 'symbol',
      header: 'Symbol',
      width: 15,
      type: 'string',
      validation: value => {
        if (value && value.length > 10) {
          return 'Symbol must not exceed 10 characters';
        }
        return true;
      },
      transform: value => (value ? value.toString().trim() : null),
      description: 'Symbol for the unit (optional, max 10 characters)',
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
        name: 'Kilogram',
        description: 'Unit of mass in the metric system',
        category: 'Weight',
        symbol: 'kg',
        is_active: 'Y',
      },
      {
        name: 'Liter',
        description: 'Unit of volume in the metric system',
        category: 'Volume',
        symbol: 'L',
        is_active: 'Y',
      },
      {
        name: 'Meter',
        description: 'Unit of length in the metric system',
        category: 'Length',
        symbol: 'm',
        is_active: 'Y',
      },
      {
        name: 'Piece',
        description: 'Unit for counting individual items',
        category: 'Count',
        symbol: 'pcs',
        is_active: 'Y',
      },
      {
        name: 'Box',
        description: 'Unit for packaged items',
        category: 'Package',
        symbol: 'box',
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(): string {
    return `
# Unit of Measurement Import Template

## Required Fields:
- **Unit Name**: Name of the unit of measurement (2-100 characters)

## Optional Fields:
- **Description**: Description of the unit (max 500 characters)
- **Category**: Category of the unit (max 50 characters)
- **Symbol**: Symbol for the unit (max 10 characters)
- **Is Active**: Whether the unit is active (Y/N, defaults to Y)

## Notes:
- Unit names must be unique across the system.
- Active units are available for use in products and inventory.
- Inactive units are hidden but preserved for historical data.
- Categories help organize units (e.g., Weight, Volume, Length, Count).
- Symbols are used for display purposes (e.g., kg, L, m, pcs).
    `;
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(unit => ({
      name: unit.name,
      description: unit.description || '',
      category: unit.category || '',
      symbol: unit.symbol || '',
      is_active: unit.is_active || 'Y',
      createdate: unit.createdate?.toISOString().split('T')[0] || '',
      createdby: unit.createdby || '',
      updatedate: unit.updatedate?.toISOString().split('T')[0] || '',
      updatedby: unit.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.unit_of_measurement : prisma.unit_of_measurement;

    const existingUnit = await model.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existingUnit) {
      return `Unit of measurement "${data.name}" already exists`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      symbol: data.symbol || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(data: any[]): Promise<string | null> {
    // Unit of measurement doesn't have foreign key dependencies
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
    const model = tx ? tx.unit_of_measurement : prisma.unit_of_measurement;

    // Find existing record based on unique fields
    const existing = await model.findFirst({
      where: {
        name: data.name,
      },
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

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Created Date', key: 'createdate', width: 20 },
      { header: 'Created By', key: 'createdby', width: 15 },
      { header: 'Updated Date', key: 'updatedate', width: 20 },
      { header: 'Updated By', key: 'updatedby', width: 15 },
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

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
