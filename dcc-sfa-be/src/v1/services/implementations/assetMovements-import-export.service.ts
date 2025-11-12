import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class AssetMovementsImportExportService extends ImportExportService<any> {
  protected modelName = 'asset_movements' as const;
  protected displayName = 'Asset Movements';
  protected uniqueFields = ['asset_id', 'movement_date', 'performed_by'];
  protected searchFields = [
    'from_location',
    'to_location',
    'movement_type',
    'notes',
  ];

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
      description: 'ID of the asset being moved (required)',
    },
    {
      key: 'from_location',
      header: 'From Location',
      width: 30,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 255 ||
        'From location must be less than 255 characters',
      description: 'Source location (optional, max 255 chars)',
    },
    {
      key: 'to_location',
      header: 'To Location',
      width: 30,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 255 ||
        'To location must be less than 255 characters',
      description: 'Destination location (optional, max 255 chars)',
    },
    {
      key: 'movement_type',
      header: 'Movement Type',
      width: 20,
      type: 'string',
      defaultValue: 'transfer',
      validation: value => {
        if (!value) return true;
        const validTypes = [
          'transfer',
          'maintenance',
          'repair',
          'disposal',
          'return',
          'other',
        ];
        return (
          validTypes.includes(value.toLowerCase()) ||
          `Movement type must be one of: ${validTypes.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'transfer'),
      description:
        'Movement type: transfer, maintenance, repair, disposal, return, other (defaults to transfer)',
    },
    {
      key: 'movement_date',
      header: 'Movement Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return 'Movement date is required';
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => new Date(value),
      description: 'Date of movement (required, YYYY-MM-DD format)',
    },
    {
      key: 'performed_by',
      header: 'Performed By ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Performed by ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Performed by ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the user who performed the movement (required)',
    },
    {
      key: 'notes',
      header: 'Notes',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Notes must be less than 1000 characters',
      description:
        'Additional notes about the movement (optional, max 1000 chars)',
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
        from_location: 'Main Warehouse - Section A',
        to_location: 'Store #001 - Downtown',
        movement_type: 'transfer',
        movement_date: '2024-01-15',
        performed_by: userId1,
        notes: 'Regular transfer to retail location',
        is_active: 'Y',
      },
      {
        asset_id: assetId2,
        from_location: 'Store #002 - Mall',
        to_location: 'Maintenance Workshop',
        movement_type: 'maintenance',
        movement_date: '2024-01-16',
        performed_by: userId2,
        notes: 'Scheduled maintenance check',
        is_active: 'Y',
      },
      {
        asset_id: assetId3,
        from_location: 'Maintenance Workshop',
        to_location: 'Store #001 - Downtown',
        movement_type: 'return',
        movement_date: '2024-01-17',
        performed_by: userId1,
        notes: 'Returned after maintenance completion',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(movement => ({
      asset_id: movement.asset_id || '',
      asset_name: movement.asset_movements_master?.name || '',
      asset_serial: movement.asset_movements_master?.serial_number || '',
      from_location: movement.from_location || '',
      to_location: movement.to_location || '',
      movement_type: movement.movement_type || '',
      movement_date: movement.movement_date
        ? new Date(movement.movement_date).toISOString().split('T')[0]
        : '',
      performed_by: movement.performed_by || '',
      performed_by_name: movement.asset_movements_performed_by?.name || '',
      performed_by_email: movement.asset_movements_performed_by?.email || '',
      notes: movement.notes || '',
      is_active: movement.is_active || 'Y',
      created_date: movement.createdate
        ? new Date(movement.createdate).toISOString().split('T')[0]
        : '',
      created_by: movement.createdby || '',
      updated_date: movement.updatedate
        ? new Date(movement.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: movement.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.asset_movements : prisma.asset_movements;

    // Check for duplicate movement (same asset, date, and performer)
    if (data.asset_id && data.movement_date && data.performed_by) {
      const movementDate = new Date(data.movement_date);
      const startOfDay = new Date(movementDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(movementDate.setHours(23, 59, 59, 999));

      const existingMovement = await model.findFirst({
        where: {
          asset_id: data.asset_id,
          performed_by: data.performed_by,
          movement_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (existingMovement) {
        return `Movement already exists for Asset ID ${data.asset_id} by User ID ${data.performed_by} on ${data.movement_date}`;
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

    // Validate user exists
    if (data.performed_by) {
      try {
        const user = await prismaClient.users.findUnique({
          where: { id: data.performed_by },
        });
        if (!user) {
          return `User with ID ${data.performed_by} does not exist`;
        }
      } catch (error) {
        return `Invalid User ID ${data.performed_by}`;
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
      from_location: data.from_location || null,
      to_location: data.to_location || null,
      movement_type: data.movement_type || 'transfer',
      movement_date: data.movement_date,
      performed_by: data.performed_by,
      notes: data.notes || null,
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
    const model = tx ? tx.asset_movements : prisma.asset_movements;

    const movementDate = new Date(data.movement_date);
    const startOfDay = new Date(movementDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(movementDate.setHours(23, 59, 59, 999));

    const existing = await model.findFirst({
      where: {
        asset_id: data.asset_id,
        performed_by: data.performed_by,
        movement_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!existing) return null;

    const updateData = {
      asset_id: data.asset_id,
      from_location:
        data.from_location !== undefined
          ? data.from_location
          : existing.from_location,
      to_location:
        data.to_location !== undefined
          ? data.to_location
          : existing.to_location,
      movement_type: data.movement_type || existing.movement_type,
      movement_date: data.movement_date || existing.movement_date,
      performed_by: data.performed_by,
      notes: data.notes !== undefined ? data.notes : existing.notes,
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
      orderBy: options.orderBy || { movement_date: 'desc' },
      include: {
        asset_movements_master: {
          select: {
            name: true,
            serial_number: true,
          },
        },
        asset_movements_performed_by: {
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
      { header: 'Movement ID', key: 'id', width: 12 },
      ...this.columns,
      { header: 'Asset Name', key: 'asset_name', width: 25 },
      { header: 'Asset Serial', key: 'asset_serial', width: 20 },
      { header: 'Performed By Name', key: 'performed_by_name', width: 25 },
      { header: 'Performed By Email', key: 'performed_by_email', width: 30 },
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
    let totalMovements = 0;
    let activeMovements = 0;
    let inactiveMovements = 0;
    const movementTypeCount: any = {};
    const assetMovementCount: any = {};

    exportData.forEach((row: any, index: number) => {
      const movement = data[index] as any;

      row.id = movement.id;
      row.asset_name = movement.asset_movements_master?.name || '';
      row.asset_serial = movement.asset_movements_master?.serial_number || '';
      row.performed_by_name = movement.asset_movements_performed_by?.name || '';
      row.performed_by_email =
        movement.asset_movements_performed_by?.email || '';

      totalMovements++;
      if (movement.is_active === 'Y') activeMovements++;
      if (movement.is_active === 'N') inactiveMovements++;

      if (movement.movement_type) {
        movementTypeCount[movement.movement_type] =
          (movementTypeCount[movement.movement_type] || 0) + 1;
      }

      const assetName = movement.asset_movements_master?.name || 'Unknown';
      assetMovementCount[assetName] = (assetMovementCount[assetName] || 0) + 1;

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

      const typeCell = excelRow.getCell('movement_type');
      switch (movement.movement_type?.toLowerCase()) {
        case 'transfer':
          typeCell.font = { color: { argb: 'FF0000FF' }, bold: true };
          break;
        case 'maintenance':
          typeCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
          break;
        case 'repair':
          typeCell.font = { color: { argb: 'FFFF0000' }, bold: true };
          break;
        case 'disposal':
          typeCell.font = { color: { argb: 'FF808080' }, bold: true };
          break;
        case 'return':
          typeCell.font = { color: { argb: 'FF008000' }, bold: true };
          break;
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

    summarySheet.addRow({ metric: 'Total Movements', value: totalMovements });
    summarySheet.addRow({ metric: 'Active Movements', value: activeMovements });
    summarySheet.addRow({
      metric: 'Inactive Movements',
      value: inactiveMovements,
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Movement Type Breakdown', value: '' });
    Object.keys(movementTypeCount).forEach(type => {
      summarySheet.addRow({
        metric: `  ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        value: movementTypeCount[type],
      });
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Movements by Asset', value: '' });
    Object.keys(assetMovementCount)
      .sort((a, b) => assetMovementCount[b] - assetMovementCount[a])
      .slice(0, 10)
      .forEach(asset => {
        summarySheet.addRow({
          metric: `  ${asset}`,
          value: assetMovementCount[asset],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
