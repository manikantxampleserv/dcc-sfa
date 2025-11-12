import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class AssetTypesImportExportService extends ImportExportService<any> {
  protected modelName = 'asset_types' as const;
  protected displayName = 'Asset Types';
  protected uniqueFields = ['name'];
  protected searchFields = ['name', 'description', 'category', 'brand'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Asset Type Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name must be less than 100 characters';
        return true;
      },
      description: 'Name of the asset type (required, 2-100 characters)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 255 ||
        'Description must be less than 255 characters',
      description: 'Description of the asset type (optional, max 255 chars)',
    },
    {
      key: 'category',
      header: 'Category',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 50 ||
        'Category must be less than 50 characters',
      description: 'Category of the asset type (optional, max 50 chars)',
    },
    {
      key: 'brand',
      header: 'Brand',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Brand must be less than 100 characters',
      description: 'Brand of the asset type (optional, max 100 chars)',
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
        name: 'Refrigerator',
        description: 'Commercial refrigeration equipment',
        category: 'Cooling',
        brand: 'Samsung',
        is_active: 'Y',
      },
      {
        name: 'Display Unit',
        description: 'Product display equipment',
        category: 'Display',
        brand: 'LG',
        is_active: 'Y',
      },
      {
        name: 'POS Terminal',
        description: 'Point of sale terminal',
        category: 'Technology',
        brand: 'NCR',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(assetType => ({
      name: assetType.name,
      description: assetType.description || '',
      category: assetType.category || '',
      brand: assetType.brand || '',
      is_active: assetType.is_active || 'Y',
      created_date: assetType.createdate?.toISOString().split('T')[0] || '',
      created_by: assetType.createdby || '',
      updated_date: assetType.updatedate?.toISOString().split('T')[0] || '',
      updated_by: assetType.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.asset_types : prisma.asset_types;

    const existingName = await model.findFirst({
      where: { name: data.name },
    });

    if (existingName) {
      return `Asset type with name ${data.name} already exists`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    // Asset types don't have foreign keys
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
    const model = tx ? tx.asset_types : prisma.asset_types;

    const existing = await model.findFirst({
      where: { name: data.name },
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
    summaryRow.getCell(1).value = `Total Asset Types: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
