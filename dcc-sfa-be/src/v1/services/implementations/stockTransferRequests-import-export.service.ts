import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class StockTransferRequestsImportExportService extends ImportExportService<any> {
  protected modelName = 'stock_transfer_requests' as const;
  protected displayName = 'Stock Transfer Requests';
  protected uniqueFields = ['request_number'];
  protected searchFields = [
    'request_number',
    'source_type',
    'destination_type',
    'status',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'request_number',
      header: 'Request Number',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 3)
          return 'Request number must be at least 3 characters';
        if (value.length > 50)
          return 'Request number must be less than 50 characters';
        return true;
      },
      description: 'Unique request number (required, 3-50 characters)',
    },
    {
      key: 'source_type',
      header: 'Source Type',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Source type must be at least 2 characters';
        if (value.length > 50)
          return 'Source type must be less than 50 characters';
        return true;
      },
      description: 'Source type (e.g., Warehouse, Store)',
    },
    {
      key: 'source_id',
      header: 'Source ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Source ID must be a positive number';
        return true;
      },
      description: 'Source location ID (required, must be valid location)',
    },
    {
      key: 'destination_type',
      header: 'Destination Type',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Destination type must be at least 2 characters';
        if (value.length > 50)
          return 'Destination type must be less than 50 characters';
        return true;
      },
      description: 'Destination type (e.g., Warehouse, Store)',
    },
    {
      key: 'destination_id',
      header: 'Destination ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Destination ID must be a positive number';
        return true;
      },
      description: 'Destination location ID (required, must be valid location)',
    },
    {
      key: 'requested_by',
      header: 'Requested By',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Requested by must be a positive number';
        return true;
      },
      description: 'User ID who requested the transfer',
    },
    {
      key: 'requested_at',
      header: 'Requested At',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      description: 'Request date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 15,
      type: 'string',
      defaultValue: 'pending',
      validation: value => {
        const validStatuses = [
          'pending',
          'approved',
          'rejected',
          'in_progress',
          'completed',
        ];
        return validStatuses.includes(value) || 'Invalid status';
      },
      description:
        'Request status (pending, approved, rejected, in_progress, completed)',
    },
    {
      key: 'approved_by',
      header: 'Approved By',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Approved by must be a positive number';
        return true;
      },
      description: 'User ID who approved the transfer (optional)',
    },
    {
      key: 'approved_at',
      header: 'Approved At',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      description: 'Approval date (optional, YYYY-MM-DD format)',
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
    const users = await prisma.users.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const warehouses = await prisma.warehouses.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const userIds = users.map(u => u.id);
    const warehouseIds = warehouses.map(w => w.id);

    const userId1 = userIds[0] || 1;
    const userId2 = userIds[1] || 1;
    const userId3 = userIds[2] || 1;
    const warehouseId1 = warehouseIds[0] || 1;
    const warehouseId2 = warehouseIds[1] || 1;
    const warehouseId3 = warehouseIds[2] || 1;

    return [
      {
        request_number: 'STR-2024-001',
        source_type: 'Warehouse',
        source_id: warehouseId1,
        destination_type: 'Store',
        destination_id: warehouseId2,
        requested_by: userId1,
        requested_at: '2024-01-20',
        status: 'approved',
        approved_by: userId2,
        approved_at: '2024-01-21',
        is_active: 'Y',
      },
      {
        request_number: 'STR-2024-002',
        source_type: 'Store',
        source_id: warehouseId2,
        destination_type: 'Warehouse',
        destination_id: warehouseId3,
        requested_by: userId2,
        requested_at: '2024-01-21',
        status: 'pending',
        approved_by: null,
        approved_at: null,
        is_active: 'Y',
      },
      {
        request_number: 'STR-2024-003',
        source_type: 'Warehouse',
        source_id: warehouseId3,
        destination_type: 'Store',
        destination_id: warehouseId1,
        requested_by: userId3,
        requested_at: '2024-01-22',
        status: 'in_progress',
        approved_by: userId1,
        approved_at: '2024-01-22',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(request => ({
      request_number: request.request_number,
      source_type: request.source_type,
      source_id: request.source_id,
      destination_type: request.destination_type,
      destination_id: request.destination_id,
      requested_by: request.requested_by,
      requested_at: request.requested_at?.toISOString().split('T')[0] || '',
      status: request.status || 'pending',
      approved_by: request.approved_by || '',
      approved_at: request.approved_at?.toISOString().split('T')[0] || '',
      is_active: request.is_active || 'Y',
      created_date: request.createdate?.toISOString().split('T')[0] || '',
      created_by: request.createdby || '',
      updated_date: request.updatedate?.toISOString().split('T')[0] || '',
      updated_by: request.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx
      ? tx.stock_transfer_requests
      : prisma.stock_transfer_requests;

    const existingRequest = await model.findFirst({
      where: { request_number: data.request_number },
    });

    if (existingRequest) {
      return `Stock transfer request with number ${data.request_number} already exists`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const userModel = tx ? tx.users : prisma.users;
    const user = await userModel.findFirst({
      where: { id: data.requested_by },
      select: { id: true, name: true },
    });

    if (!user) {
      return `User with ID ${data.requested_by} does not exist. Please check the user ID or create the user first.`;
    }

    if (data.approved_by) {
      const approver = await userModel.findFirst({
        where: { id: data.approved_by },
        select: { id: true, name: true },
      });

      if (!approver) {
        return `Approver with ID ${data.approved_by} does not exist. Please check the user ID or create the user first.`;
      }
    }

    // Note: Source and destination validation would depend on the actual location tables
    // For now, we'll assume they exist if they're positive numbers

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      ...data,
      requested_at: data.requested_at ? new Date(data.requested_at) : undefined,
      approved_at: data.approved_at ? new Date(data.approved_at) : undefined,
      source_id: parseInt(data.source_id),
      destination_id: parseInt(data.destination_id),
      requested_by: parseInt(data.requested_by),
      approved_by: data.approved_by ? parseInt(data.approved_by) : null,
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
    const model = tx
      ? tx.stock_transfer_requests
      : prisma.stock_transfer_requests;

    const existing = await model.findFirst({
      where: { request_number: data.request_number },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        requested_at: data.requested_at
          ? new Date(data.requested_at)
          : undefined,
        approved_at: data.approved_at ? new Date(data.approved_at) : undefined,
        source_id: parseInt(data.source_id),
        destination_id: parseInt(data.destination_id),
        requested_by: parseInt(data.requested_by),
        approved_by: data.approved_by ? parseInt(data.approved_by) : null,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }

  /**
   * Get available IDs for reference during import.
   */
  async getAvailableIds(): Promise<{
    users: Array<{ id: number; name: string }>;
    warehouses: Array<{ id: number; name: string }>;
  }> {
    const [users, warehouses] = await Promise.all([
      prisma.users.findMany({
        select: { id: true, name: true },
        orderBy: { id: 'asc' },
        take: 10,
      }),
      prisma.warehouses.findMany({
        select: { id: true, name: true },
        orderBy: { id: 'asc' },
        take: 10,
      }),
    ]);

    return { users, warehouses };
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        stock_transfer_requests_requested_by: true,
        stock_transfer_requests_approved_by: true,
        stock_transfer_requests_source: true,
        stock_transfer_requests_destination: true,
        stock_transfer_lines: true,
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new (await import('exceljs')).Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Requested By Name', key: 'requested_by_name', width: 25 },
      { header: 'Approved By Name', key: 'approved_by_name', width: 25 },
      { header: 'Source Name', key: 'source_name', width: 25 },
      { header: 'Destination Name', key: 'destination_name', width: 25 },
      {
        header: 'Transfer Lines Count',
        key: 'transfer_lines_count',
        width: 15,
      },
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
        requested_by_name:
          data[index]?.stock_transfer_requests_requested_by?.name || '',
        approved_by_name:
          data[index]?.stock_transfer_requests_approved_by?.name || '',
        source_name: data[index]?.stock_transfer_requests_source?.name || '',
        destination_name:
          data[index]?.stock_transfer_requests_destination?.name || '',
        transfer_lines_count: data[index]?.stock_transfer_lines?.length || 0,
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
    summaryRow.getCell(1).value =
      `Total Stock Transfer Requests: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
