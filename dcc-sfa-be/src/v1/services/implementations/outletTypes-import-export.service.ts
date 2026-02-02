import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class OutletTypesImportExportService extends ImportExportService<any> {
  protected modelName = 'customer_type' as const;
  protected displayName = 'Outlet Types';
  protected uniqueFields = ['type_code', 'type_name'];
  protected searchFields = ['type_name', 'type_code'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'type_name',
      header: 'Outlet Type Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '')
          return 'Outlet type name is required';
        if (value.length > 255)
          return 'Outlet type name must be less than 255 characters';
        return true;
      },
      transform: value => (value ? value.trim().toUpperCase() : null),
      description: 'Name of the outlet type (required, max 255 chars)',
    },
    {
      key: 'type_code',
      header: 'Outlet Type Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '')
          return 'Outlet type code is required';
        if (value.length > 100)
          return 'Outlet type code must be less than 100 characters';
        return true;
      },
      transform: value => (value ? value.trim().toUpperCase() : null),
      description: 'Unique code for the outlet type (required, max 100 chars)',
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
        type_name: 'GROCERY',
        type_code: 'CT-GROCERY',
        is_active: 'Y',
      },
      {
        type_name: 'SUPERMARKET',
        type_code: 'CT-SUPERMARKET',
        is_active: 'Y',
      },
      {
        type_name: 'RESTAURANT',
        type_code: 'CT-RESTAURANT',
        is_active: 'Y',
      },
      {
        type_name: 'PHARMACY',
        type_code: 'CT-PHARMACY',
        is_active: 'Y',
      },
      {
        type_name: 'HOTEL',
        type_code: 'CT-HOTEL',
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(outletType => ({
      id: outletType.id || '',
      type_name: outletType.type_name || '',
      type_code: outletType.type_code || '',
      is_active: outletType.is_active || 'Y',
      created_date: outletType.createdate
        ? new Date(outletType.createdate).toISOString().split('T')[0]
        : '',
      created_by: outletType.createdby || '',
      updated_date: outletType.updatedate
        ? new Date(outletType.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: outletType.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.type_code) {
      const existingByCode = await prismaClient.customer_type.findFirst({
        where: { type_code: data.type_code },
      });
      if (existingByCode) {
        return `Outlet type with code '${data.type_code}' already exists`;
      }
    }

    if (data.type_name) {
      const existingByName = await prismaClient.customer_type.findFirst({
        where: {
          type_name: {
            equals: data.type_name.trim(),
          },
        },
      });
      if (existingByName) {
        return `Outlet type with name '${data.type_name}' already exists`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      type_name: data.type_name,
      type_code: data.type_code,
      is_active: data.is_active || 'Y',
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
    const prismaClient = tx || prisma;

    const existingOutletType = await prismaClient.customer_type.findFirst({
      where: {
        OR: [
          data.type_code ? { type_code: data.type_code } : {},
          { type_name: data.type_name.trim() },
        ].filter(condition => Object.keys(condition).length > 0),
      },
    });

    if (!existingOutletType) {
      return null;
    }

    const updated = await prismaClient.customer_type.update({
      where: { id: existingOutletType.id },
      data: {
        type_name: data.type_name,
        type_code: data.type_code || existingOutletType.type_code,
        is_active: data.is_active || existingOutletType.is_active,
        updatedate: new Date(),
        updatedby: userId,
      },
    });

    return updated;
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { createdate: 'desc' },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      { header: 'Outlet Type ID', key: 'id', width: 12 },
      ...this.columns,
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
    let totalOutletTypes = 0;
    let activeOutletTypes = 0;
    let inactiveOutletTypes = 0;

    exportData.forEach((row: any, index: number) => {
      const outletType = data[index] as any;

      row.id = outletType.id;

      totalOutletTypes++;
      if (outletType.is_active === 'Y') activeOutletTypes++;
      if (outletType.is_active === 'N') inactiveOutletTypes++;

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

      if (outletType.is_active === 'N') {
        excelRow.getCell('is_active').font = {
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

    summarySheet.addRow({
      metric: 'Total Outlet Types',
      value: totalOutletTypes,
    });
    summarySheet.addRow({
      metric: 'Active Outlet Types',
      value: activeOutletTypes,
    });
    summarySheet.addRow({
      metric: 'Inactive Outlet Types',
      value: inactiveOutletTypes,
    });
    summarySheet.addRow({
      metric: 'Active Rate',
      value:
        totalOutletTypes > 0
          ? `${((activeOutletTypes / totalOutletTypes) * 100).toFixed(2)}%`
          : '0%',
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
