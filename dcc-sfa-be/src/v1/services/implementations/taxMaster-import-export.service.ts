import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class TaxMasterImportExportService extends ImportExportService<any> {
  protected modelName = 'tax_master' as const;
  protected displayName = 'Tax Masters';
  protected uniqueFields = ['code'];
  protected searchFields = ['name', 'code', 'description'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Tax Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Name must be at least 2 characters';
        if (value.length > 255) return 'Name must be less than 255 characters';
        return true;
      },
      description: 'Name of the tax (required, 2-255 characters)',
    },
    {
      key: 'code',
      header: 'Tax Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Code must be at least 2 characters';
        if (value.length > 100) return 'Code must be less than 100 characters';
        return true;
      },
      description: 'Unique tax code (required, 2-100 characters)',
    },
    {
      key: 'tax_rate',
      header: 'Tax Rate (%)',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = Number(value);
        if (isNaN(num)) return 'Tax rate must be a number';
        if (num < 0 || num > 100) return 'Tax rate must be between 0 and 100';
        return true;
      },
      transform: value => (value ? Number(value) : 0),
      description: 'Tax rate percentage (required, 0-100)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 500 ||
        'Description must be less than 500 characters',
      description: 'Description of the tax (optional, max 500 chars)',
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
        name: 'Standard Tax',
        code: 'TAX-STD',
        tax_rate: 18.0,
        description: 'Standard tax rate applicable to most products',
        is_active: 'Y',
      },
      {
        name: 'Zero Tax',
        code: 'TAX-ZERO',
        tax_rate: 0.0,
        description: 'Zero tax rate for exempted products',
        is_active: 'Y',
      },
      {
        name: 'Reduced Tax',
        code: 'TAX-RED',
        tax_rate: 5.0,
        description: 'Reduced tax rate for essential goods',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(taxMaster => ({
      name: taxMaster.name,
      code: taxMaster.code,
      tax_rate: taxMaster.tax_rate || 0,
      description: taxMaster.description || '',
      is_active: taxMaster.is_active || 'Y',
      created_date: taxMaster.createdate?.toISOString().split('T')[0] || '',
      created_by: taxMaster.createdby || '',
      updated_date: taxMaster.updatedate?.toISOString().split('T')[0] || '',
      updated_by: taxMaster.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.tax_master : prisma.tax_master;

    const existingCode = await model.findFirst({
      where: { code: data.code },
    });

    if (existingCode) {
      return `Tax master with code ${data.code} already exists`;
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
      name: data.name,
      code: data.code,
      tax_rate: Number(data.tax_rate) || 0,
      description: data.description || null,
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
    const model = tx ? tx.tax_master : prisma.tax_master;

    const existing = await model.findFirst({
      where: { code: data.code },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        tax_rate: Number(data.tax_rate) || 0,
        description: data.description || null,
        is_active: data.is_active || 'Y',
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
    summaryRow.getCell(1).value = `Total Tax Masters: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
