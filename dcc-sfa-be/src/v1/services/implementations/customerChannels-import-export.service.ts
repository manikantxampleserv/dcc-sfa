import prisma from '../../../configs/prisma.client';
import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';

export class CustomerChannelsImportExportService extends ImportExportService<any> {
  protected modelName = 'customer_channel' as const;
  protected displayName = 'Customer Channels';
  protected uniqueFields = ['channel_code', 'channel_name'];
  protected searchFields = ['channel_name', 'channel_code'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'channel_name',
      header: 'Channel Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'Channel name is required';
        if (value.length > 255)
          return 'Channel name must be less than 255 characters';
        return true;
      },
      transform: value => (value ? value.trim().toUpperCase() : null),
      description: 'Name of the customer channel (required, max 255 chars)',
    },
    {
      key: 'channel_code',
      header: 'Channel Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.trim() === '') return 'Channel code is required';
        if (value.length > 100)
          return 'Channel code must be less than 100 characters';
        return true;
      },
      transform: value => (value ? value.trim().toUpperCase() : null),
      description:
        'Unique code for the customer channel (required, max 100 chars)',
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
        channel_name: 'GROCERY',
        channel_code: 'CH-GROCERY',
        is_active: 'Y',
      },
      {
        channel_name: 'SUPERMARKET',
        channel_code: 'CH-SUPERMARKET',
        is_active: 'Y',
      },
      {
        channel_name: 'RESTAURANT',
        channel_code: 'CH-RESTAURANT',
        is_active: 'Y',
      },
      {
        channel_name: 'HOTEL',
        channel_code: 'CH-HOTEL',
        is_active: 'Y',
      },
      {
        channel_name: 'PHARMACY',
        channel_code: 'CH-PHARMACY',
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(channel => ({
      id: channel.id || '',
      channel_name: channel.channel_name || '',
      channel_code: channel.channel_code || '',
      is_active: channel.is_active || 'Y',
      created_date: channel.createdate
        ? new Date(channel.createdate).toISOString().split('T')[0]
        : '',
      created_by: channel.createdby || '',
      updated_date: channel.updatedate
        ? new Date(channel.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: channel.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.channel_code) {
      const existingByCode = await prismaClient.customer_channel.findFirst({
        where: { channel_code: data.channel_code },
      });
      if (existingByCode) {
        return `Customer channel with code '${data.channel_code}' already exists`;
      }
    }

    if (data.channel_name) {
      const existingByName = await prismaClient.customer_channel.findFirst({
        where: {
          channel_name: {
            equals: data.channel_name.trim(),
          },
        },
      });
      if (existingByName) {
        return `Customer channel with name '${data.channel_name}' already exists`;
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
      channel_name: data.channel_name,
      channel_code: data.channel_code,
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

    const existingChannel = await prismaClient.customer_channel.findFirst({
      where: {
        OR: [
          data.channel_code ? { channel_code: data.channel_code } : {},
          { channel_name: data.channel_name.trim() },
        ].filter(condition => Object.keys(condition).length > 0),
      },
    });

    if (!existingChannel) {
      return null;
    }

    const updated = await prismaClient.customer_channel.update({
      where: { id: existingChannel.id },
      data: {
        channel_name: data.channel_name,
        channel_code: data.channel_code || existingChannel.channel_code,
        is_active: data.is_active || existingChannel.is_active,
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
      { header: 'Channel ID', key: 'id', width: 12 },
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
    let totalChannels = 0;
    let activeChannels = 0;
    let inactiveChannels = 0;

    exportData.forEach((row: any, index: number) => {
      const channel = data[index] as any;

      row.id = channel.id;

      totalChannels++;
      if (channel.is_active === 'Y') activeChannels++;
      if (channel.is_active === 'N') inactiveChannels++;

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

      if (channel.is_active === 'N') {
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
      metric: 'Total Customer Channels',
      value: totalChannels,
    });
    summarySheet.addRow({ metric: 'Active Channels', value: activeChannels });
    summarySheet.addRow({
      metric: 'Inactive Channels',
      value: inactiveChannels,
    });
    summarySheet.addRow({
      metric: 'Active Rate',
      value:
        totalChannels > 0
          ? `${((activeChannels / totalChannels) * 100).toFixed(2)}%`
          : '0%',
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
