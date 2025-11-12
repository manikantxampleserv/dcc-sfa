import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class SalesTargetGroupsImportExportService extends ImportExportService<any> {
  protected modelName = 'sales_target_groups' as const;
  protected displayName = 'Sales Target Groups';
  protected uniqueFields = ['group_name'];
  protected searchFields = ['group_name', 'description'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'group_name',
      header: 'Group Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Group name must be at least 2 characters';
        if (value.length > 255)
          return 'Group name must be less than 255 characters';
        return true;
      },
      description:
        'Name of the sales target group (required, 2-255 characters)',
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
      description:
        'Description of the sales target group (optional, max 500 chars)',
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
        group_name: 'North Region Sales Team',
        description: 'Sales team covering northern territories',
        is_active: 'Y',
      },
      {
        group_name: 'Premium Account Managers',
        description: 'Dedicated team for premium customer accounts',
        is_active: 'Y',
      },
      {
        group_name: 'New Market Expansion',
        description: 'Team focused on expanding into new markets',
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(): string {
    return `
# Sales Target Groups Import Template

## Required Fields:
- **Group Name**: Name of the sales target group (must be 2-255 characters)

## Optional Fields:
- **Description**: Description of the sales target group (max 500 characters)
- **Is Active**: Whether the group is active (Y/N, defaults to Y)

## Notes:
- Group name must be unique across the system
- All fields except Group Name are optional
- Is active should be either 'Y' or 'N'
- Group names should be descriptive and meaningful
    `;
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(group => ({
      group_name: group.group_name,
      description: group.description || '',
      is_active: group.is_active || 'Y',
      created_date: group.createdate?.toISOString().split('T')[0] || '',
      created_by: group.createdby || '',
      updated_date: group.updatedate?.toISOString().split('T')[0] || '',
      updated_by: group.updatedby || '',
      member_count: group.sales_target_group_members_id?.length || 0,
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.sales_target_groups : prisma.sales_target_groups;

    const existingGroup = await model.findFirst({
      where: { group_name: data.group_name },
    });

    if (existingGroup) {
      return `Sales target group with name "${data.group_name}" already exists`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      ...data,
      group_name: data.group_name.trim(),
      description: data.description?.trim() || null,
      is_active: data.is_active?.toUpperCase() || 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(data: any[]): Promise<string | null> {
    // Sales target groups don't have foreign key dependencies
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
    const model = tx ? tx.sales_target_groups : prisma.sales_target_groups;

    const existing = await model.findFirst({
      where: { group_name: data.group_name },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        group_name: data.group_name.trim(),
        description: data.description?.trim() || null,
        is_active: data.is_active?.toUpperCase() || 'Y',
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        sales_target_group_members_id: true,
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new (await import('exceljs')).Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Member Count', key: 'member_count', width: 15 },
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
      const excelRow = worksheet.addRow({
        ...row,
        member_count: data[index]?.sales_target_group_members_id?.length || 0,
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

    const summaryRow = worksheet.addRow([]);
    summaryRow.getCell(1).value = `Total Sales Target Groups: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
