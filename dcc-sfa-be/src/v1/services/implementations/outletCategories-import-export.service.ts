import prisma from '../../../configs/prisma.client';
import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';

export class OutletCategoriesImportExportService extends ImportExportService<any> {
  protected modelName = 'customer_category' as const;
  protected displayName = 'Outlet Categories';
  protected uniqueFields = ['category_code', 'category_name'];
  protected searchFields = ['category_name', 'category_code'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'category_name',
      header: 'Category Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'Category name is required';
        if (value.length > 255)
          return 'Category name must be less than 255 characters';
        return true;
      },
      transform: value => (value ? value.trim() : null),
      description: 'Name of the outlet category (required, max 255 chars)',
    },
    {
      key: 'category_code',
      header: 'Category Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'Category code is required';
        if (value.length > 100)
          return 'Category code must be less than 100 characters';
        return true;
      },
      transform: value => (value ? value.trim().toUpperCase() : null),
      description:
        'Unique code for the outlet category (required, max 100 chars)',
    },
    {
      key: 'level',
      header: 'Level',
      width: 15,
      required: false,
      type: 'number',
      defaultValue: 1,
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 10)
          return 'Level must be a number between 1 and 10';
        return true;
      },
      transform: value => {
        const num = parseInt(value);
        return isNaN(num) ? 1 : num;
      },
      description: 'Category level (optional, defaults to 1, range 1-10)',
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
        category_name: 'Bronze',
        category_code: 'CC-BRONZE',
        level: 1,
        is_active: 'Y',
      },
      {
        category_name: 'Silver',
        category_code: 'CC-SILVER',
        level: 2,
        is_active: 'Y',
      },
      {
        category_name: 'Gold',
        category_code: 'CC-GOLD',
        level: 3,
        is_active: 'Y',
      },
      {
        category_name: 'Diamond',
        category_code: 'CC-DIAMOND',
        level: 4,
        is_active: 'Y',
      },
      {
        category_name: 'Platinum',
        category_code: 'CC-PLATINUM',
        level: 5,
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(category => ({
      id: category.id || '',
      category_name: category.category_name || '',
      category_code: category.category_code || '',
      level: category.level || 1,
      is_active: category.is_active || 'Y',
      created_date: category.createdate
        ? new Date(category.createdate).toISOString().split('T')[0]
        : '',
      created_by: category.createdby || '',
      updated_date: category.updatedate
        ? new Date(category.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: category.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.category_code) {
      const existingByCode = await prismaClient.customer_category.findFirst({
        where: { category_code: data.category_code },
      });
      if (existingByCode) {
        return `Outlet category with code '${data.category_code}' already exists`;
      }
    }

    if (data.category_name) {
      const existingByName = await prismaClient.customer_category.findFirst({
        where: {
          category_name: {
            equals: data.category_name.trim(),
          },
        },
      });
      if (existingByName) {
        return `Outlet category with name '${data.category_name}' already exists`;
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
      category_name: data.category_name,
      category_code: data.category_code,
      level: data.level || 1,
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

    const existingCategory = await prismaClient.customer_category.findFirst({
      where: {
        OR: [
          data.category_code ? { category_code: data.category_code } : {},
          { category_name: data.category_name.trim() },
        ].filter(condition => Object.keys(condition).length > 0),
      },
    });

    if (!existingCategory) {
      return null;
    }

    const updated = await prismaClient.customer_category.update({
      where: { id: existingCategory.id },
      data: {
        category_name: data.category_name,
        category_code: data.category_code || existingCategory.category_code,
        level: data.level !== undefined ? data.level : existingCategory.level,
        is_active: data.is_active || existingCategory.is_active,
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
      { header: 'Category ID', key: 'id', width: 12 },
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
    let totalCategories = 0;
    let activeCategories = 0;
    let inactiveCategories = 0;
    const levelCount: any = {};

    exportData.forEach((row: any, index: number) => {
      const category = data[index] as any;

      row.id = category.id;

      totalCategories++;
      if (category.is_active === 'Y') activeCategories++;
      if (category.is_active === 'N') inactiveCategories++;

      const level = category.level || 1;
      levelCount[level] = (levelCount[level] || 0) + 1;

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

      if (category.is_active === 'N') {
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
      metric: 'Total Outlet Categories',
      value: totalCategories,
    });
    summarySheet.addRow({
      metric: 'Active Categories',
      value: activeCategories,
    });
    summarySheet.addRow({
      metric: 'Inactive Categories',
      value: inactiveCategories,
    });
    summarySheet.addRow({
      metric: 'Active Rate',
      value:
        totalCategories > 0
          ? `${((activeCategories / totalCategories) * 100).toFixed(2)}%`
          : '0%',
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Level Breakdown', value: '' });
    Object.keys(levelCount)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(level => {
        summarySheet.addRow({
          metric: `  Level ${level}`,
          value: levelCount[level],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
