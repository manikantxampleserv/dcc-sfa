import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class CoolerInstallationsImportExportService extends ImportExportService<any> {
  protected modelName = 'coolers' as const;
  protected displayName = 'Cooler Installations';
  protected uniqueFields = ['code'];
  protected searchFields = [
    'code',
    'brand',
    'model',
    'serial_number',
    'status',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'customer_id',
      header: 'Customer ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Customer ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Customer ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the customer (required)',
    },
    {
      key: 'code',
      header: 'Cooler Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Cooler code must be at least 2 characters';
        if (value.length > 50)
          return 'Cooler code must be less than 50 characters';
        return true;
      },
      description: 'Unique cooler code (required, 2-50 characters)',
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
      description: 'Cooler brand (optional, max 100 chars)',
    },
    {
      key: 'model',
      header: 'Model',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Model must be less than 100 characters',
      description: 'Cooler model (optional, max 100 chars)',
    },
    {
      key: 'serial_number',
      header: 'Serial Number',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Serial number must be less than 100 characters',
      description: 'Cooler serial number (optional, max 100 chars)',
    },
    {
      key: 'capacity',
      header: 'Capacity',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const capacity = parseInt(value);
        if (isNaN(capacity) || capacity < 0)
          return 'Capacity must be a non-negative number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'Cooler capacity (optional, must be non-negative)',
    },
    {
      key: 'install_date',
      header: 'Install Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Installation date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'last_service_date',
      header: 'Last Service Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Last service date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'next_service_due',
      header: 'Next Service Due',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Next service due date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 20,
      type: 'string',
      defaultValue: 'working',
      validation: value =>
        !value ||
        value.length <= 20 ||
        'Status must be less than 20 characters',
      description:
        'Cooler status (optional, max 20 chars, defaults to "working")',
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
      description: 'Current temperature (optional)',
    },
    {
      key: 'energy_rating',
      header: 'Energy Rating',
      width: 15,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 10 ||
        'Energy rating must be less than 10 characters',
      description: 'Energy rating (optional, max 10 chars)',
    },
    {
      key: 'warranty_expiry',
      header: 'Warranty Expiry',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Warranty expiry date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'maintenance_contract',
      header: 'Maintenance Contract',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'Maintenance contract must be less than 100 characters',
      description: 'Maintenance contract details (optional, max 100 chars)',
    },
    {
      key: 'technician_id',
      header: 'Technician ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Technician ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of assigned technician (optional)',
    },
    {
      key: 'last_scanned_date',
      header: 'Last Scanned Date',
      width: 20,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Last scanned date (optional, YYYY-MM-DD format)',
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
    const customers = await prisma.customers.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const users = await prisma.users.findMany({
      take: 2,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const customerIds = customers.map(c => c.id);
    const userIds = users.map(u => u.id);

    const customerId1 = customerIds[0] || 999;
    const customerId2 = customerIds[1] || 999;
    const customerId3 = customerIds[2] || 999;
    const userId1 = userIds[0] || 999;
    const userId2 = userIds[1] || 999;

    return [
      {
        customer_id: customerId1,
        code: 'COOL-001',
        brand: 'Samsung',
        model: 'RF28K9070SG',
        serial_number: 'SN123456789',
        capacity: 28,
        install_date: '2024-01-15',
        last_service_date: '2024-06-15',
        next_service_due: '2024-12-15',
        status: 'working',
        temperature: 4.5,
        energy_rating: 'A++',
        warranty_expiry: '2026-01-15',
        maintenance_contract: 'Annual Service Contract',
        technician_id: userId1,
        last_scanned_date: '2024-10-15',
        is_active: 'Y',
      },
      {
        customer_id: customerId2,
        code: 'COOL-002',
        brand: 'LG',
        model: 'LFXS28968S',
        serial_number: 'SN987654321',
        capacity: 25,
        install_date: '2024-02-20',
        last_service_date: '2024-07-20',
        next_service_due: '2025-01-20',
        status: 'working',
        temperature: 3.8,
        energy_rating: 'A+',
        warranty_expiry: '2026-02-20',
        maintenance_contract: 'Premium Service Contract',
        technician_id: userId2,
        last_scanned_date: '2024-10-20',
        is_active: 'Y',
      },
      {
        customer_id: customerId3,
        code: 'COOL-003',
        brand: 'Whirlpool',
        model: 'WRF540CWHZ',
        serial_number: 'SN456789123',
        capacity: 30,
        install_date: '2024-03-10',
        last_service_date: '2024-08-10',
        next_service_due: '2025-02-10',
        status: 'maintenance',
        temperature: 5.2,
        energy_rating: 'A',
        warranty_expiry: '2026-03-10',
        maintenance_contract: 'Basic Service Contract',
        technician_id: userId1,
        last_scanned_date: '2024-10-10',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(cooler => ({
      customer_id: cooler.customer_id || '',
      customer_name: cooler.coolers_customers?.name || '',
      customer_code: cooler.coolers_customers?.code || '',
      code: cooler.code || '',
      brand: cooler.brand || '',
      model: cooler.model || '',
      serial_number: cooler.serial_number || '',
      capacity: cooler.capacity || '',
      install_date: cooler.install_date
        ? new Date(cooler.install_date).toISOString().split('T')[0]
        : '',
      last_service_date: cooler.last_service_date
        ? new Date(cooler.last_service_date).toISOString().split('T')[0]
        : '',
      next_service_due: cooler.next_service_due
        ? new Date(cooler.next_service_due).toISOString().split('T')[0]
        : '',
      status: cooler.status || 'working',
      temperature: cooler.temperature || '',
      energy_rating: cooler.energy_rating || '',
      warranty_expiry: cooler.warranty_expiry
        ? new Date(cooler.warranty_expiry).toISOString().split('T')[0]
        : '',
      maintenance_contract: cooler.maintenance_contract || '',
      technician_id: cooler.technician_id || '',
      technician_name: cooler.users?.name || '',
      technician_email: cooler.users?.email || '',
      last_scanned_date: cooler.last_scanned_date
        ? new Date(cooler.last_scanned_date).toISOString().split('T')[0]
        : '',
      is_active: cooler.is_active || 'Y',
      created_date: cooler.createdate
        ? new Date(cooler.createdate).toISOString().split('T')[0]
        : '',
      created_by: cooler.createdby || '',
      updated_date: cooler.updatedate
        ? new Date(cooler.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: cooler.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.coolers : prisma.coolers;

    const existingCode = await model.findFirst({
      where: { code: data.code },
    });

    if (existingCode) {
      return `Cooler with code ${data.code} already exists`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    // Validate customer exists
    if (data.customer_id) {
      try {
        const customer = await prismaClient.customers.findUnique({
          where: { id: data.customer_id },
        });
        if (!customer) {
          return `Customer with ID ${data.customer_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Customer ID ${data.customer_id}`;
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
      customer_id: data.customer_id,
      code: data.code,
      brand: data.brand || null,
      model: data.model || null,
      serial_number: data.serial_number || null,
      capacity: data.capacity || null,
      install_date: data.install_date || null,
      last_service_date: data.last_service_date || null,
      next_service_due: data.next_service_due || null,
      status: data.status || 'working',
      temperature: data.temperature || null,
      energy_rating: data.energy_rating || null,
      warranty_expiry: data.warranty_expiry || null,
      maintenance_contract: data.maintenance_contract || null,
      technician_id: data.technician_id || null,
      last_scanned_date: data.last_scanned_date || null,
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
    const model = tx ? tx.coolers : prisma.coolers;

    const existing = await model.findFirst({
      where: { code: data.code },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        customer_id: data.customer_id,
        code: data.code,
        brand: data.brand !== undefined ? data.brand : existing.brand,
        model: data.model !== undefined ? data.model : existing.model,
        serial_number:
          data.serial_number !== undefined
            ? data.serial_number
            : existing.serial_number,
        capacity:
          data.capacity !== undefined ? data.capacity : existing.capacity,
        install_date:
          data.install_date !== undefined
            ? data.install_date
            : existing.install_date,
        last_service_date:
          data.last_service_date !== undefined
            ? data.last_service_date
            : existing.last_service_date,
        next_service_due:
          data.next_service_due !== undefined
            ? data.next_service_due
            : existing.next_service_due,
        status: data.status !== undefined ? data.status : existing.status,
        temperature:
          data.temperature !== undefined
            ? data.temperature
            : existing.temperature,
        energy_rating:
          data.energy_rating !== undefined
            ? data.energy_rating
            : existing.energy_rating,
        warranty_expiry:
          data.warranty_expiry !== undefined
            ? data.warranty_expiry
            : existing.warranty_expiry,
        maintenance_contract:
          data.maintenance_contract !== undefined
            ? data.maintenance_contract
            : existing.maintenance_contract,
        technician_id:
          data.technician_id !== undefined
            ? data.technician_id
            : existing.technician_id,
        last_scanned_date:
          data.last_scanned_date !== undefined
            ? data.last_scanned_date
            : existing.last_scanned_date,
        is_active:
          data.is_active !== undefined ? data.is_active : existing.is_active,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { createdate: 'desc' },
      include: {
        coolers_customers: {
          select: {
            name: true,
            code: true,
          },
        },
        users: {
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
      { header: 'Cooler ID', key: 'id', width: 12 },
      ...this.columns,
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Customer Code', key: 'customer_code', width: 20 },
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
    let totalCoolers = 0;
    let activeCoolers = 0;
    let inactiveCoolers = 0;
    const statusCount: any = {};
    const brandCount: any = {};

    exportData.forEach((row: any, index: number) => {
      const cooler = data[index] as any;

      row.id = cooler.id;
      row.customer_name = cooler.coolers_customers?.name || '';
      row.customer_code = cooler.coolers_customers?.code || '';
      row.technician_name = cooler.users?.name || '';
      row.technician_email = cooler.users?.email || '';

      totalCoolers++;
      if (cooler.is_active === 'Y') activeCoolers++;
      if (cooler.is_active === 'N') inactiveCoolers++;

      const status = cooler.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;

      const brand = cooler.brand || 'Unknown';
      brandCount[brand] = (brandCount[brand] || 0) + 1;

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

      const statusCell = excelRow.getCell('status');
      if (cooler.status === 'working') {
        statusCell.font = { color: { argb: 'FF008000' }, bold: true };
      } else if (cooler.status === 'maintenance') {
        statusCell.font = { color: { argb: 'FFFF8000' }, bold: true };
      } else if (cooler.status === 'broken') {
        statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
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
      metric: 'Total Cooler Installations',
      value: totalCoolers,
    });
    summarySheet.addRow({
      metric: 'Active Installations',
      value: activeCoolers,
    });
    summarySheet.addRow({
      metric: 'Inactive Installations',
      value: inactiveCoolers,
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Installations by Status', value: '' });
    Object.keys(statusCount)
      .sort((a, b) => statusCount[b] - statusCount[a])
      .forEach(status => {
        summarySheet.addRow({
          metric: `  ${status}`,
          value: statusCount[status],
        });
      });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Installations by Brand', value: '' });
    Object.keys(brandCount)
      .sort((a, b) => brandCount[b] - brandCount[a])
      .slice(0, 10)
      .forEach(brand => {
        summarySheet.addRow({
          metric: `  ${brand}`,
          value: brandCount[brand],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
