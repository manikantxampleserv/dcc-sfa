import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class CoolerInspectionsImportExportService extends ImportExportService<any> {
  protected modelName = 'cooler_inspections' as const;
  protected displayName = 'Cooler Inspections';
  protected uniqueFields = ['id'];
  protected searchFields = [
    'issues',
    'action_taken',
    'cooler_code',
    'inspector_name',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'cooler_id',
      header: 'Cooler ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Cooler ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Cooler ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the cooler to inspect (required)',
    },
    {
      key: 'inspected_by',
      header: 'Inspector ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Inspector ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Inspector ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the inspector (required)',
    },
    {
      key: 'visit_id',
      header: 'Visit ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Visit ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the visit (optional)',
    },
    {
      key: 'inspection_date',
      header: 'Inspection Date',
      width: 20,
      type: 'date',
      defaultValue: new Date().toISOString().split('T')[0],
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : new Date()),
      description: 'Date of inspection (optional, defaults to today)',
    },
    {
      key: 'temperature',
      header: 'Temperature',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const temp = parseFloat(value);
        if (isNaN(temp)) return 'Temperature must be a valid number';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Temperature reading (optional)',
    },
    {
      key: 'is_working',
      header: 'Is Working',
      width: 12,
      type: 'string',
      defaultValue: 'Y',
      validation: value => {
        const upperValue = value ? value.toString().toUpperCase() : 'Y';
        return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
      },
      transform: value => (value ? value.toString().toUpperCase() : 'Y'),
      description: 'Working status - Y for Yes, N for No (defaults to Y)',
    },
    {
      key: 'issues',
      header: 'Issues',
      width: 30,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 2000 ||
        'Issues must be less than 2000 characters',
      description: 'Issues found during inspection (optional, max 2000 chars)',
    },
    {
      key: 'images',
      header: 'Images',
      width: 30,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 2000 ||
        'Images must be less than 2000 characters',
      description: 'Image URLs or descriptions (optional, max 2000 chars)',
    },
    {
      key: 'latitude',
      header: 'Latitude',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const lat = parseFloat(value);
        if (isNaN(lat) || lat < -90 || lat > 90)
          return 'Latitude must be between -90 and 90';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Latitude coordinate (optional, -90 to 90)',
    },
    {
      key: 'longitude',
      header: 'Longitude',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const lng = parseFloat(value);
        if (isNaN(lng) || lng < -180 || lng > 180)
          return 'Longitude must be between -180 and 180';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Longitude coordinate (optional, -180 to 180)',
    },
    {
      key: 'action_required',
      header: 'Action Required',
      width: 15,
      type: 'string',
      defaultValue: 'N',
      validation: value => {
        const upperValue = value ? value.toString().toUpperCase() : 'N';
        return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
      },
      transform: value => (value ? value.toString().toUpperCase() : 'N'),
      description: 'Action required - Y for Yes, N for No (defaults to N)',
    },
    {
      key: 'action_taken',
      header: 'Action Taken',
      width: 30,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 2000 ||
        'Action taken must be less than 2000 characters',
      description: 'Action taken to resolve issues (optional, max 2000 chars)',
    },
    {
      key: 'next_inspection_due',
      header: 'Next Inspection Due',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Next inspection due date (optional, YYYY-MM-DD format)',
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
    const coolers = await prisma.coolers.findMany({
      take: 3,
      select: { id: true, code: true },
      orderBy: { id: 'asc' },
    });
    const users = await prisma.users.findMany({
      take: 2,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const visits = await prisma.visits.findMany({
      take: 2,
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    const coolerIds = coolers.map(c => c.id);
    const userIds = users.map(u => u.id);
    const visitIds = visits.map(v => v.id);

    const coolerId1 = coolerIds[0] || 999;
    const coolerId2 = coolerIds[1] || 999;
    const coolerId3 = coolerIds[2] || 999;
    const userId1 = userIds[0] || 999;
    const userId2 = userIds[1] || 999;
    const visitId1 = visitIds[0] || null;
    const visitId2 = visitIds[1] || null;

    return [
      {
        cooler_id: coolerId1,
        inspected_by: userId1,
        visit_id: visitId1,
        inspection_date: '2024-10-15',
        temperature: 4.2,
        is_working: 'Y',
        issues: 'Minor condensation on door seal',
        images: 'door_seal_condensation.jpg',
        latitude: 28.6139,
        longitude: 77.209,
        action_required: 'N',
        action_taken: 'Cleaned door seal',
        next_inspection_due: '2024-11-15',
        is_active: 'Y',
      },
      {
        cooler_id: coolerId2,
        inspected_by: userId2,
        visit_id: visitId2,
        inspection_date: '2024-10-16',
        temperature: 3.8,
        is_working: 'Y',
        issues: 'Temperature slightly high',
        images: 'temperature_gauge.jpg',
        latitude: 28.614,
        longitude: 77.2091,
        action_required: 'Y',
        action_taken: 'Adjusted thermostat settings',
        next_inspection_due: '2024-11-16',
        is_active: 'Y',
      },
      {
        cooler_id: coolerId3,
        inspected_by: userId1,
        visit_id: null,
        inspection_date: '2024-10-17',
        temperature: 5.1,
        is_working: 'N',
        issues: 'Compressor not working, unusual noise',
        images: 'compressor_issue.jpg',
        latitude: 28.6141,
        longitude: 77.2092,
        action_required: 'Y',
        action_taken: 'Scheduled technician visit',
        next_inspection_due: '2024-10-20',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(inspection => ({
      cooler_id: inspection.cooler_id || '',
      cooler_code: inspection.coolers?.code || '',
      cooler_brand: inspection.coolers?.brand || '',
      cooler_model: inspection.coolers?.model || '',
      customer_name: inspection.coolers?.coolers_customers?.name || '',
      customer_code: inspection.coolers?.coolers_customers?.code || '',
      inspected_by: inspection.inspected_by || '',
      inspector_name: inspection.users?.name || '',
      inspector_email: inspection.users?.email || '',
      visit_id: inspection.visit_id || '',
      visit_date: inspection.visits?.visit_date
        ? new Date(inspection.visits.visit_date).toISOString().split('T')[0]
        : '',
      inspection_date: inspection.inspection_date
        ? new Date(inspection.inspection_date).toISOString().split('T')[0]
        : '',
      temperature: inspection.temperature || '',
      is_working: inspection.is_working || 'Y',
      issues: inspection.issues || '',
      images: inspection.images || '',
      latitude: inspection.latitude || '',
      longitude: inspection.longitude || '',
      action_required: inspection.action_required || 'N',
      action_taken: inspection.action_taken || '',
      next_inspection_due: inspection.next_inspection_due
        ? new Date(inspection.next_inspection_due).toISOString().split('T')[0]
        : '',
      is_active: inspection.is_active || 'Y',
      created_date: inspection.createdate
        ? new Date(inspection.createdate).toISOString().split('T')[0]
        : '',
      created_by: inspection.createdby || '',
      updated_date: inspection.updatedate
        ? new Date(inspection.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: inspection.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    // Cooler inspections don't have unique constraints beyond ID
    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    // Validate cooler exists
    if (data.cooler_id) {
      try {
        const cooler = await prismaClient.coolers.findUnique({
          where: { id: data.cooler_id },
        });
        if (!cooler) {
          return `Cooler with ID ${data.cooler_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Cooler ID ${data.cooler_id}`;
      }
    }

    // Validate inspector exists
    if (data.inspected_by) {
      try {
        const user = await prismaClient.users.findUnique({
          where: { id: data.inspected_by },
        });
        if (!user) {
          return `User with ID ${data.inspected_by} does not exist`;
        }
      } catch (error) {
        return `Invalid Inspector ID ${data.inspected_by}`;
      }
    }

    // Validate visit exists (if provided)
    if (data.visit_id) {
      try {
        const visit = await prismaClient.visits.findUnique({
          where: { id: data.visit_id },
        });
        if (!visit) {
          return `Visit with ID ${data.visit_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Visit ID ${data.visit_id}`;
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      cooler_id: data.cooler_id,
      inspected_by: data.inspected_by,
      visit_id: data.visit_id || null,
      inspection_date: data.inspection_date || new Date(),
      temperature: data.temperature || null,
      is_working: data.is_working || 'Y',
      issues: data.issues || null,
      images: data.images || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      action_required: data.action_required || 'N',
      action_taken: data.action_taken || null,
      next_inspection_due: data.next_inspection_due || null,
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
    // Cooler inspections are typically not updated via import
    // Each inspection is a unique record
    return null;
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { createdate: 'desc' },
      include: {
        coolers: {
          select: {
            code: true,
            brand: true,
            model: true,
            coolers_customers: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        visits: {
          select: {
            visit_date: true,
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
      { header: 'Inspection ID', key: 'id', width: 12 },
      ...this.columns,
      { header: 'Cooler Code', key: 'cooler_code', width: 20 },
      { header: 'Cooler Brand', key: 'cooler_brand', width: 20 },
      { header: 'Cooler Model', key: 'cooler_model', width: 20 },
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Customer Code', key: 'customer_code', width: 20 },
      { header: 'Inspector Name', key: 'inspector_name', width: 25 },
      { header: 'Inspector Email', key: 'inspector_email', width: 30 },
      { header: 'Visit Date', key: 'visit_date', width: 20 },
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
    let totalInspections = 0;
    let activeInspections = 0;
    let inactiveInspections = 0;
    let workingInspections = 0;
    let nonWorkingInspections = 0;
    let actionRequiredInspections = 0;

    exportData.forEach((row: any, index: number) => {
      const inspection = data[index] as any;

      row.id = inspection.id;
      row.cooler_code = inspection.coolers?.code || '';
      row.cooler_brand = inspection.coolers?.brand || '';
      row.cooler_model = inspection.coolers?.model || '';
      row.customer_name = inspection.coolers?.coolers_customers?.name || '';
      row.customer_code = inspection.coolers?.coolers_customers?.code || '';
      row.inspector_name = inspection.users?.name || '';
      row.inspector_email = inspection.users?.email || '';
      row.visit_date = inspection.visits?.visit_date
        ? new Date(inspection.visits.visit_date).toISOString().split('T')[0]
        : '';

      totalInspections++;
      if (inspection.is_active === 'Y') activeInspections++;
      if (inspection.is_active === 'N') inactiveInspections++;
      if (inspection.is_working === 'Y') workingInspections++;
      if (inspection.is_working === 'N') nonWorkingInspections++;
      if (inspection.action_required === 'Y') actionRequiredInspections++;

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

      const workingCell = excelRow.getCell('is_working');
      if (inspection.is_working === 'Y') {
        workingCell.font = { color: { argb: 'FF008000' }, bold: true };
      } else if (inspection.is_working === 'N') {
        workingCell.font = { color: { argb: 'FFFF0000' }, bold: true };
      }

      const actionCell = excelRow.getCell('action_required');
      if (inspection.action_required === 'Y') {
        actionCell.font = { color: { argb: 'FFFF8000' }, bold: true };
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
      metric: 'Total Inspections',
      value: totalInspections,
    });
    summarySheet.addRow({
      metric: 'Active Inspections',
      value: activeInspections,
    });
    summarySheet.addRow({
      metric: 'Inactive Inspections',
      value: inactiveInspections,
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({
      metric: 'Working Coolers',
      value: workingInspections,
    });
    summarySheet.addRow({
      metric: 'Non-Working Coolers',
      value: nonWorkingInspections,
    });
    summarySheet.addRow({
      metric: 'Inspections Requiring Action',
      value: actionRequiredInspections,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
