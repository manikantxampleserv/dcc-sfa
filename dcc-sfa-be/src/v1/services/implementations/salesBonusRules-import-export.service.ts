import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import * as ExcelJS from 'exceljs';
import prisma from '../../../configs/prisma.client';

export class SalesBonusRulesImportExportService extends ImportExportService<any> {
  protected modelName = 'sales_bonus_rules' as const;
  protected displayName = 'Sales Bonus Rules';
  protected uniqueFields = [
    'sales_target_id',
    'achievement_min_percent',
    'achievement_max_percent',
  ];
  protected searchFields = ['bonus_amount', 'bonus_percent'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'sales_target_id',
      header: 'Sales Target ID',
      width: 20,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Sales target ID is required';
        const num = parseInt(value);
        if (isNaN(num) || num < 1)
          return 'Sales target ID must be a positive integer';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the sales target (required)',
    },
    {
      key: 'achievement_min_percent',
      header: 'Min Achievement %',
      width: 18,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Minimum achievement percentage is required';
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 100)
          return 'Minimum achievement percentage must be between 0 and 100';
        return true;
      },
      transform: value => parseFloat(value),
      description: 'Minimum achievement percentage (required, 0-100)',
    },
    {
      key: 'achievement_max_percent',
      header: 'Max Achievement %',
      width: 18,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Maximum achievement percentage is required';
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 100)
          return 'Maximum achievement percentage must be between 0 and 100';
        return true;
      },
      transform: value => parseFloat(value),
      description: 'Maximum achievement percentage (required, 0-100)',
    },
    {
      key: 'bonus_amount',
      header: 'Bonus Amount',
      width: 15,
      type: 'number',
      validation: value => {
        if (value) {
          const num = parseFloat(value);
          if (isNaN(num)) return 'Bonus amount must be a valid number';
          if (num < 0) return 'Bonus amount must be non-negative';
        }
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Bonus amount (optional, non-negative)',
    },
    {
      key: 'bonus_percent',
      header: 'Bonus Percentage',
      width: 18,
      type: 'number',
      validation: value => {
        if (value) {
          const num = parseFloat(value);
          if (isNaN(num)) return 'Bonus percentage must be a valid number';
          if (num < 0 || num > 100)
            return 'Bonus percentage must be between 0 and 100';
        }
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Bonus percentage (optional, 0-100)',
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
        sales_target_id: 1,
        achievement_min_percent: 80.0,
        achievement_max_percent: 99.9,
        bonus_amount: 500.0,
        bonus_percent: null,
        is_active: 'Y',
      },
      {
        sales_target_id: 1,
        achievement_min_percent: 100.0,
        achievement_max_percent: 120.0,
        bonus_amount: 1000.0,
        bonus_percent: 5.0,
        is_active: 'Y',
      },
      {
        sales_target_id: 2,
        achievement_min_percent: 90.0,
        achievement_max_percent: 110.0,
        bonus_amount: null,
        bonus_percent: 3.0,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(): string {
    return `
# Sales Bonus Rules Import Template

## Required Fields:
- **Sales Target ID**: ID of the sales target (must exist)
- **Min Achievement %**: Minimum achievement percentage (0-100)
- **Max Achievement %**: Maximum achievement percentage (0-100)

## Optional Fields:
- **Bonus Amount**: Bonus amount (non-negative decimal)
- **Bonus Percentage**: Bonus percentage (0-100)
- **Is Active**: Whether the rule is active (Y/N, defaults to Y)

## Notes:
- Either bonus amount or bonus percentage must be provided
- Maximum achievement percentage must be greater than minimum
- Sales target must exist in the system
- No overlapping achievement ranges allowed for the same sales target
    `;
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(rule => ({
      sales_target_id: rule.sales_target_id,
      sales_target_info: rule.sales_targets
        ? `${rule.sales_targets.sales_targets_groups?.group_name || 'Unknown'} - ${rule.sales_targets.sales_targets_product_categories?.category_name || 'Unknown'}`
        : '',
      achievement_min_percent: rule.achievement_min_percent,
      achievement_max_percent: rule.achievement_max_percent,
      bonus_amount: rule.bonus_amount?.toString() || '',
      bonus_percent: rule.bonus_percent?.toString() || '',
      is_active: rule.is_active || 'Y',
      createdate: rule.createdate?.toISOString().split('T')[0] || '',
      createdby: rule.createdby || '',
      updatedate: rule.updatedate?.toISOString().split('T')[0] || '',
      updatedby: rule.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.sales_bonus_rules : prisma.sales_bonus_rules;

    // Check for overlapping achievement ranges for the same sales target
    const existingRule = await model.findFirst({
      where: {
        sales_target_id: data.sales_target_id,
        is_active: 'Y',
        OR: [
          {
            achievement_min_percent: {
              lte: data.achievement_max_percent,
            },
            achievement_max_percent: {
              gte: data.achievement_min_percent,
            },
          },
        ],
      },
    });

    if (existingRule) {
      return `Sales bonus rule for target ${data.sales_target_id} already exists for overlapping achievement range`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      sales_target_id: data.sales_target_id,
      achievement_min_percent: data.achievement_min_percent,
      achievement_max_percent: data.achievement_max_percent,
      bonus_amount: data.bonus_amount || null,
      bonus_percent: data.bonus_percent || null,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(data: any): Promise<string | null> {
    // Check if sales targets exist
    const targetIds = [...new Set([data.sales_target_id])];
    const existingTargets = await prisma.sales_targets.findMany({
      where: { id: { in: targetIds } },
      select: { id: true },
    });
    const existingTargetIds = existingTargets.map(target => target.id);
    const missingTargetIds = targetIds.filter(
      id => !existingTargetIds.includes(id)
    );

    if (missingTargetIds.length > 0) {
      return `Sales targets with IDs ${missingTargetIds.join(', ')} do not exist`;
    }

    // Validate achievement percentages
    if (data.achievement_min_percent >= data.achievement_max_percent) {
      return 'Minimum achievement percentage must be less than maximum achievement percentage';
    }

    // Validate that either bonus amount or bonus percentage is provided
    if (!data.bonus_amount && !data.bonus_percent) {
      return 'Either bonus amount or bonus percentage must be provided';
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
    const model = tx ? tx.sales_bonus_rules : prisma.sales_bonus_rules;

    // Find existing record based on unique fields
    const existing = await model.findFirst({
      where: {
        sales_target_id: data.sales_target_id,
        achievement_min_percent: data.achievement_min_percent,
        achievement_max_percent: data.achievement_max_percent,
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
      include: {
        sales_targets: {
          include: {
            sales_targets_groups: true,
            sales_targets_product_categories: true,
          },
        },
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Sales Target Info', key: 'sales_target_info', width: 40 },
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
      const excelRow = worksheet.addRow({
        ...row,
        sales_target_info: data[index]?.sales_targets
          ? `${data[index].sales_targets.sales_targets_groups?.group_name || 'Unknown'} - ${data[index].sales_targets.sales_targets_product_categories?.category_name || 'Unknown'}`
          : '',
      });

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
