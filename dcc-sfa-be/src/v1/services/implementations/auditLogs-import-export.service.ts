import prisma from '../../../configs/prisma.client';
import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';

export class AuditLogsImportExportService extends ImportExportService<any> {
  protected modelName = 'audit_logs' as const;
  protected displayName = 'Audit Logs';
  protected uniqueFields = ['id'];
  protected searchFields = ['table_name', 'action', 'changed_by', 'ip_address'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'id',
      header: 'Audit ID',
      width: 12,
      required: false,
      type: 'number',
      description: 'Unique identifier for the audit log entry',
    },
    {
      key: 'table_name',
      header: 'Table Name',
      width: 25,
      required: false,
      type: 'string',
      transform: value => (value ? value.trim() : ''),
      description: 'Name of the table where the action occurred',
    },
    {
      key: 'record_id',
      header: 'Record ID',
      width: 15,
      required: false,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the affected record',
    },
    {
      key: 'action',
      header: 'Action',
      width: 12,
      required: false,
      type: 'string',
      transform: value => (value ? value.trim().toUpperCase() : ''),
      description: 'Action type (CREATE, UPDATE, DELETE)',
    },
    {
      key: 'changed_by',
      header: 'Changed By',
      width: 15,
      required: false,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'User ID who performed the action',
    },
    {
      key: 'changed_at',
      header: 'Changed At',
      width: 20,
      required: false,
      type: 'date',
      transform: value => {
        if (!value) return '';
        const date = new Date(value);
        return (
          date.toISOString().split('T')[0] +
          ' ' +
          date.toTimeString().split(' ')[0].substring(0, 5)
        );
      },
      description: 'Date and time when the action occurred',
    },
    {
      key: 'ip_address',
      header: 'IP Address',
      width: 18,
      required: false,
      type: 'string',
      transform: value => (value ? value.trim() : ''),
      description: 'IP address from which the action was performed',
    },
    {
      key: 'device_info',
      header: 'Device Info',
      width: 30,
      required: false,
      type: 'string',
      transform: value => (value ? value.trim() : ''),
      description: 'Device/browser information',
    },
    {
      key: 'session_id',
      header: 'Session ID',
      width: 25,
      required: false,
      type: 'string',
      transform: value => (value ? value.trim() : ''),
      description: 'Session identifier',
    },
    {
      key: 'is_active',
      header: 'Is Active',
      width: 12,
      required: false,
      type: 'string',
      transform: value => (value ? value.trim().toUpperCase() : 'Y'),
      description: 'Active status - Y for Yes, N for No',
    },
    {
      key: 'createdate',
      header: 'Created Date',
      width: 20,
      required: false,
      type: 'date',
      transform: value => {
        if (!value) return '';
        const date = new Date(value);
        return (
          date.toISOString().split('T')[0] +
          ' ' +
          date.toTimeString().split(' ')[0].substring(0, 5)
        );
      },
      description: 'Date and time when the audit log was created',
    },
    {
      key: 'createdby',
      header: 'Created By',
      width: 15,
      required: false,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'User ID who created the audit log entry',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    return Promise.resolve([
      {
        id: 1,
        table_name: 'product_volumes',
        record_id: 123,
        action: 'CREATE',
        changed_by: 1,
        changed_at: '2024-01-15 10:30',
        ip_address: '192.168.1.100',
        device_info: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        session_id: 'sess_abc123',
        is_active: 'Y',
        createdate: '2024-01-15 10:30',
        createdby: 1,
      },
      {
        id: 2,
        table_name: 'customer_type',
        record_id: 456,
        action: 'UPDATE',
        changed_by: 2,
        changed_at: '2024-01-15 11:45',
        ip_address: '192.168.1.101',
        device_info: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        session_id: 'sess_def456',
        is_active: 'Y',
        createdate: '2024-01-15 11:45',
        createdby: 2,
      },
      {
        id: 3,
        table_name: 'customer_channel',
        record_id: 789,
        action: 'DELETE',
        changed_by: 1,
        changed_at: '2024-01-15 14:20',
        ip_address: '192.168.1.100',
        device_info: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        session_id: 'sess_abc123',
        is_active: 'Y',
        createdate: '2024-01-15 14:20',
        createdby: 1,
      },
    ]);
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map((audit: any) => ({
      id: audit.id || '',
      table_name: audit.table_name || '',
      record_id: audit.record_id || '',
      action: audit.action || '',
      changed_by: audit.changed_by || '',
      changed_at: audit.changed_at
        ? new Date(audit.changed_at)
            .toISOString()
            .replace('T', ' ')
            .substring(0, 16)
        : '',
      ip_address: audit.ip_address || '',
      device_info: audit.device_info || '',
      session_id: audit.session_id || '',
      is_active: audit.is_active || 'Y',
      createdate: audit.createdate
        ? new Date(audit.createdate)
            .toISOString()
            .replace('T', ' ')
            .substring(0, 16)
        : '',
      createdby: audit.createdby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    return 'Audit logs cannot be imported - export only';
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    return 'Audit logs cannot be imported - export only';
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    throw new Error('Audit logs cannot be imported - export only');
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    throw new Error('Audit logs cannot be imported - export only');
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { createdate: 'desc' },
      include: {
        users_audit_logs_changed_byTousers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Changed By Name', key: 'changed_by_name', width: 20 },
      { header: 'Changed By Email', key: 'changed_by_email', width: 30 },
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
    let totalLogs = 0;
    let createActions = 0;
    let updateActions = 0;
    let deleteActions = 0;
    const actionCount: any = {};
    const tableCount: any = {};
    const userCount: any = {};

    exportData.forEach((row: any, index: number) => {
      const audit = data[index] as any;
      const user = audit.users_audit_logs_changed_byTousers;

      row.changed_by_name = user?.name || '';
      row.changed_by_email = user?.email || '';

      totalLogs++;

      const action = audit.action?.toUpperCase() || 'UNKNOWN';
      actionCount[action] = (actionCount[action] || 0) + 1;

      if (action === 'CREATE') createActions++;
      if (action === 'UPDATE') updateActions++;
      if (action === 'DELETE') deleteActions++;

      const tableName = audit.table_name || 'UNKNOWN';
      tableCount[tableName] = (tableCount[tableName] || 0) + 1;

      const userId = audit.changed_by || 0;
      userCount[userId] = (userCount[userId] || 0) + 1;

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

      // Color code actions
      const actionCell = excelRow.getCell('action');
      if (action === 'CREATE') {
        actionCell.font = { color: { argb: 'FF008000' }, bold: true };
      } else if (action === 'UPDATE') {
        actionCell.font = { color: { argb: 'FF0000FF' }, bold: true };
      } else if (action === 'DELETE') {
        actionCell.font = { color: { argb: 'FFFF0000' }, bold: true };
      }

      // Keep changed_data as raw data (no JSON formatting)
      // The data will display exactly as it appears in the frontend
    });

    // Add auto filter
    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Create summary sheet
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

    // Summary statistics
    summarySheet.addRow({
      metric: 'Total Audit Logs',
      value: totalLogs,
    });
    summarySheet.addRow({
      metric: 'Create Actions',
      value: createActions,
    });
    summarySheet.addRow({
      metric: 'Update Actions',
      value: updateActions,
    });
    summarySheet.addRow({
      metric: 'Delete Actions',
      value: deleteActions,
    });
    summarySheet.addRow({ metric: '', value: '' });

    // Action breakdown
    summarySheet.addRow({ metric: 'Action Breakdown', value: '' });
    Object.keys(actionCount)
      .sort()
      .forEach(action => {
        summarySheet.addRow({
          metric: `  ${action}`,
          value: actionCount[action],
        });
      });

    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Table Breakdown', value: '' });
    Object.keys(tableCount)
      .sort()
      .forEach(table => {
        summarySheet.addRow({
          metric: `  ${table}`,
          value: tableCount[table],
        });
      });

    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'User Activity', value: '' });
    Object.keys(userCount)
      .sort((a, b) => userCount[b] - userCount[a])
      .slice(0, 10) // Top 10 users
      .forEach(userId => {
        const user = data.find(
          (audit: any) => audit.changed_by === parseInt(userId)
        );
        const userName =
          user?.users_audit_logs_changed_byTousers?.name || `User ${userId}`;
        summarySheet.addRow({
          metric: `  ${userName}`,
          value: userCount[userId],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
