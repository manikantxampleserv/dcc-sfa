import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class AssetMaintenanceImportExportService extends ImportExportService<any> {
  protected modelName = 'asset_maintenance' as const;
  protected displayName = 'Asset Maintenance';
  protected uniqueFields = ['asset_id', 'maintenance_date', 'technician_id'];
  protected searchFields = ['issue_reported', 'action_taken', 'remarks'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'asset_id',
      header: 'Asset ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Asset ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Asset ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the asset being maintained (required)',
    },
    {
      key: 'maintenance_date',
      header: 'Maintenance Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return 'Maintenance date is required';
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => new Date(value),
      description: 'Date of maintenance (required, YYYY-MM-DD format)',
    },
    {
      key: 'issue_reported',
      header: 'Issue Reported',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Issue reported must be less than 1000 characters',
      description:
        'Description of the issue reported (optional, max 1000 chars)',
    },
    {
      key: 'action_taken',
      header: 'Action Taken',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Action taken must be less than 1000 characters',
      description:
        'Description of action taken to resolve issue (optional, max 1000 chars)',
    },
    {
      key: 'technician_id',
      header: 'Technician ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Technician ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Technician ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the technician who performed maintenance (required)',
    },
    {
      key: 'cost',
      header: 'Cost',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const cost = parseFloat(value);
        if (isNaN(cost) || cost < 0)
          return 'Cost must be a non-negative number';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Maintenance cost (optional, must be non-negative)',
    },
    {
      key: 'remarks',
      header: 'Remarks',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Remarks must be less than 1000 characters',
      description:
        'Additional remarks about the maintenance (optional, max 1000 chars)',
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
    // Fetch actual IDs from database to ensure validity
    const assets = await prisma.asset_master.findMany({
      take: 3,
      select: { id: true, serial_number: true },
      orderBy: { id: 'asc' },
    });
    const users = await prisma.users.findMany({
      take: 2,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const assetIds = assets.map(a => a.id);
    const userIds = users.map(u => u.id);

    const assetId1 = assetIds[0] || 999;
    const assetId2 = assetIds[1] || 999;
    const assetId3 = assetIds[2] || 999;
    const userId1 = userIds[0] || 999;
    const userId2 = userIds[1] || 999;

    return [
      {
        asset_id: assetId1,
        maintenance_date: '2024-01-15',
        issue_reported: 'Equipment not functioning properly',
        action_taken: 'Replaced faulty component and tested functionality',
        technician_id: userId1,
        cost: 150.0,
        remarks: 'Regular maintenance completed successfully',
        is_active: 'Y',
      },
      {
        asset_id: assetId2,
        maintenance_date: '2024-01-16',
        issue_reported: 'Unusual noise during operation',
        action_taken: 'Lubricated moving parts and adjusted alignment',
        technician_id: userId2,
        cost: 75.5,
        remarks: 'Preventive maintenance to avoid major issues',
        is_active: 'Y',
      },
      {
        asset_id: assetId3,
        maintenance_date: '2024-01-17',
        issue_reported: 'Performance degradation',
        action_taken: 'Cleaned filters and calibrated settings',
        technician_id: userId1,
        cost: 200.0,
        remarks: 'Scheduled maintenance completed on time',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(maintenance => ({
      asset_id: maintenance.asset_id || '',
      asset_name: maintenance.asset_maintenance_master?.name || '',
      asset_serial: maintenance.asset_maintenance_master?.serial_number || '',
      maintenance_date: maintenance.maintenance_date
        ? new Date(maintenance.maintenance_date).toISOString().split('T')[0]
        : '',
      issue_reported: maintenance.issue_reported || '',
      action_taken: maintenance.action_taken || '',
      technician_id: maintenance.technician_id || '',
      technician_name: maintenance.asset_maintenance_technician?.name || '',
      technician_email: maintenance.asset_maintenance_technician?.email || '',
      cost: maintenance.cost || '',
      remarks: maintenance.remarks || '',
      is_active: maintenance.is_active || 'Y',
      created_date: maintenance.createdate
        ? new Date(maintenance.createdate).toISOString().split('T')[0]
        : '',
      created_by: maintenance.createdby || '',
      updated_date: maintenance.updatedate
        ? new Date(maintenance.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: maintenance.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.asset_maintenance : prisma.asset_maintenance;

    // Check for duplicate maintenance (same asset, date, and technician)
    if (data.asset_id && data.maintenance_date && data.technician_id) {
      const maintenanceDate = new Date(data.maintenance_date);
      const startOfDay = new Date(maintenanceDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(maintenanceDate.setHours(23, 59, 59, 999));

      const existingMaintenance = await model.findFirst({
        where: {
          asset_id: data.asset_id,
          technician_id: data.technician_id,
          maintenance_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (existingMaintenance) {
        return `Maintenance already exists for Asset ID ${data.asset_id} by Technician ID ${data.technician_id} on ${data.maintenance_date}`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    // Validate asset exists
    if (data.asset_id) {
      try {
        const asset = await prismaClient.asset_master.findUnique({
          where: { id: data.asset_id },
        });
        if (!asset) {
          return `Asset with ID ${data.asset_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Asset ID ${data.asset_id}`;
      }
    }

    // Validate technician exists
    if (data.technician_id) {
      try {
        const user = await prismaClient.users.findUnique({
          where: { id: data.technician_id },
        });
        if (!user) {
          return `User with ID ${data.technician_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Technician ID ${data.technician_id}`;
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      asset_id: data.asset_id,
      maintenance_date: data.maintenance_date,
      issue_reported: data.issue_reported || null,
      action_taken: data.action_taken || null,
      technician_id: data.technician_id,
      cost: data.cost || null,
      remarks: data.remarks || null,
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
    const model = tx ? tx.asset_maintenance : prisma.asset_maintenance;

    const maintenanceDate = new Date(data.maintenance_date);
    const startOfDay = new Date(maintenanceDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(maintenanceDate.setHours(23, 59, 59, 999));

    const existing = await model.findFirst({
      where: {
        asset_id: data.asset_id,
        technician_id: data.technician_id,
        maintenance_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!existing) return null;

    const updateData = {
      asset_id: data.asset_id,
      maintenance_date: data.maintenance_date || existing.maintenance_date,
      issue_reported:
        data.issue_reported !== undefined
          ? data.issue_reported
          : existing.issue_reported,
      action_taken:
        data.action_taken !== undefined
          ? data.action_taken
          : existing.action_taken,
      technician_id: data.technician_id,
      cost: data.cost !== undefined ? data.cost : existing.cost,
      remarks: data.remarks !== undefined ? data.remarks : existing.remarks,
      is_active: data.is_active || existing.is_active,
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
      orderBy: options.orderBy || { maintenance_date: 'desc' },
      include: {
        asset_maintenance_master: {
          select: {
            name: true,
            serial_number: true,
          },
        },
        asset_maintenance_technician: {
          select: {
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
      { header: 'Maintenance ID', key: 'id', width: 12 },
      ...this.columns,
      { header: 'Asset Name', key: 'asset_name', width: 25 },
      { header: 'Asset Serial', key: 'asset_serial', width: 20 },
      { header: 'Technician Name', key: 'technician_name', width: 25 },
      { header: 'Technician Email', key: 'technician_email', width: 30 },
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
    let totalMaintenances = 0;
    let activeMaintenances = 0;
    let inactiveMaintenances = 0;
    const costByAsset: any = {};
    const technicianCount: any = {};

    exportData.forEach((row: any, index: number) => {
      const maintenance = data[index] as any;

      row.id = maintenance.id;
      row.asset_name = maintenance.asset_maintenance_master?.name || '';
      row.asset_serial =
        maintenance.asset_maintenance_master?.serial_number || '';
      row.technician_name =
        maintenance.asset_maintenance_technician?.name || '';
      row.technician_email =
        maintenance.asset_maintenance_technician?.email || '';

      totalMaintenances++;
      if (maintenance.is_active === 'Y') activeMaintenances++;
      if (maintenance.is_active === 'N') inactiveMaintenances++;

      const assetName = maintenance.asset_maintenance_master?.name || 'Unknown';
      const cost = maintenance.cost || 0;
      costByAsset[assetName] = (costByAsset[assetName] || 0) + cost;

      const technicianName =
        maintenance.asset_maintenance_technician?.name || 'Unknown';
      technicianCount[technicianName] =
        (technicianCount[technicianName] || 0) + 1;

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

      const costCell = excelRow.getCell('cost');
      if (maintenance.cost && maintenance.cost > 0) {
        costCell.font = { color: { argb: 'FF008000' }, bold: true };
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
      metric: 'Total Maintenance Records',
      value: totalMaintenances,
    });
    summarySheet.addRow({
      metric: 'Active Records',
      value: activeMaintenances,
    });
    summarySheet.addRow({
      metric: 'Inactive Records',
      value: inactiveMaintenances,
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Maintenance Cost by Asset', value: '' });
    Object.keys(costByAsset)
      .sort((a, b) => costByAsset[b] - costByAsset[a])
      .slice(0, 10)
      .forEach(asset => {
        summarySheet.addRow({
          metric: `  ${asset}`,
          value: `$${costByAsset[asset].toFixed(2)}`,
        });
      });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({
      metric: 'Maintenance Count by Technician',
      value: '',
    });
    Object.keys(technicianCount)
      .sort((a, b) => technicianCount[b] - technicianCount[a])
      .slice(0, 10)
      .forEach(technician => {
        summarySheet.addRow({
          metric: `  ${technician}`,
          value: technicianCount[technician],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
