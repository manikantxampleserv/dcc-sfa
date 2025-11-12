import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class DepotsImportExportService extends ImportExportService<any> {
  protected modelName = 'depots' as const;
  protected displayName = 'Depots';
  protected uniqueFields = ['code'];
  protected searchFields = ['name', 'code', 'address', 'city', 'email'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'parent_id',
      header: 'Company ID',
      width: 15,
      required: true,
      type: 'number',
      transform: value => parseInt(value),
      description: 'ID of the parent company (required)',
    },
    {
      key: 'name',
      header: 'Depot Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Name must be at least 2 characters';
        if (value.length > 255) return 'Name must be less than 255 characters';
        return true;
      },
      description: 'Name of the depot (required, 2-255 characters)',
    },
    {
      key: 'code',
      header: 'Depot Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Code is required';
        if (value.length > 50) return 'Code must be less than 50 characters';
        if (!/^[A-Z0-9_-]+$/i.test(value))
          return 'Code can only contain letters, numbers, hyphens and underscores';
        return true;
      },
      transform: value => value.toUpperCase().trim(),
      description: 'Unique depot code (required, max 50 chars, alphanumeric)',
    },
    {
      key: 'address',
      header: 'Address',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 500 ||
        'Address must be less than 500 characters',
      description: 'Street address of the depot (optional, max 500 chars)',
    },
    {
      key: 'city',
      header: 'City',
      width: 25,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'City must be less than 100 characters',
      description: 'City where depot is located (optional, max 100 chars)',
    },
    {
      key: 'state',
      header: 'State',
      width: 20,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 100 ||
        'State must be less than 100 characters',
      description:
        'State/Province where depot is located (optional, max 100 chars)',
    },
    {
      key: 'zipcode',
      header: 'Zip Code',
      width: 15,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 20)
          return 'Zip code must be less than 20 characters';
        if (!/^[A-Z0-9\s-]+$/i.test(value)) return 'Invalid zip code format';
        return true;
      },
      description: 'Postal/Zip code (optional, max 20 chars)',
    },
    {
      key: 'phone_number',
      header: 'Phone Number',
      width: 20,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 20)
          return 'Phone number must be less than 20 characters';
        const phoneRegex =
          /^[\d\s\-\+KATEX_INLINE_OPENKATEX_INLINE_CLOSEext.]+$/i;
        return phoneRegex.test(value) || 'Invalid phone number format';
      },
      description: 'Contact phone number (optional, max 20 chars)',
    },
    {
      key: 'email',
      header: 'Email',
      width: 30,
      type: 'email',
      validation: value => {
        if (!value) return true;
        if (value.length > 255) return 'Email must be less than 255 characters';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Invalid email format';
      },
      transform: value => (value ? value.toLowerCase().trim() : null),
      description: 'Contact email address (optional, valid email format)',
    },
    {
      key: 'manager_id',
      header: 'Manager ID',
      width: 15,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the depot manager user (optional)',
    },
    {
      key: 'supervisor_id',
      header: 'Supervisor ID',
      width: 15,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the depot supervisor user (optional)',
    },
    {
      key: 'coordinator_id',
      header: 'Coordinator ID',
      width: 15,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the depot coordinator user (optional)',
    },
    {
      key: 'latitude',
      header: 'Latitude',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const lat = parseFloat(value);
        if (isNaN(lat)) return 'Latitude must be a number';
        if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Geographic latitude (-90 to 90)',
    },
    {
      key: 'longitude',
      header: 'Longitude',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const lng = parseFloat(value);
        if (isNaN(lng)) return 'Longitude must be a number';
        if (lng < -180 || lng > 180)
          return 'Longitude must be between -180 and 180';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Geographic longitude (-180 to 180)',
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
        parent_id: 1,
        name: 'Main Depot - North Region',
        code: 'DEP-NORTH-001',
        address: '123 Industrial Park, Building A',
        city: 'New York',
        state: 'NY',
        zipcode: '10001',
        phone_number: '+1-212-555-0100',
        email: 'north.depot@company.com',
        manager_id: 1,
        supervisor_id: 2,
        coordinator_id: 3,
        latitude: 40.7128,
        longitude: -74.006,
        is_active: 'Y',
      },
      {
        parent_id: 1,
        name: 'Secondary Depot - South Region',
        code: 'DEP-SOUTH-001',
        address: '456 Logistics Avenue, Suite 200',
        city: 'Atlanta',
        state: 'GA',
        zipcode: '30301',
        phone_number: '+1-404-555-0200',
        email: 'south.depot@company.com',
        manager_id: 4,
        supervisor_id: 5,
        coordinator_id: 6,
        latitude: 33.749,
        longitude: -84.388,
        is_active: 'Y',
      },
      {
        parent_id: 1,
        name: 'Warehouse Depot - West Region',
        code: 'DEP-WEST-001',
        address: '789 Distribution Center Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipcode: '90001',
        phone_number: '+1-213-555-0300',
        email: 'west.depot@company.com',
        manager_id: 7,
        supervisor_id: 8,
        coordinator_id: '',
        latitude: 34.0522,
        longitude: -118.2437,
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(depot => ({
      parent_id: depot.parent_id,
      name: depot.name,
      code: depot.code,
      address: depot.address || '',
      city: depot.city || '',
      state: depot.state || '',
      zipcode: depot.zipcode || '',
      phone_number: depot.phone_number || '',
      email: depot.email || '',
      manager_id: depot.manager_id || '',
      supervisor_id: depot.supervisor_id || '',
      coordinator_id: depot.coordinator_id || '',
      latitude: depot.latitude ? depot.latitude.toString() : '',
      longitude: depot.longitude ? depot.longitude.toString() : '',
      is_active: depot.is_active || 'Y',
      created_date: depot.createdate?.toISOString().split('T')[0] || '',
      created_by: depot.createdby || '',
      updated_date: depot.updatedate?.toISOString().split('T')[0] || '',
      updated_by: depot.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.depots : prisma.depots;

    const existingCode = await model.findFirst({
      where: { code: data.code },
    });

    if (existingCode) {
      return `Depot with code ${data.code} already exists`;
    }

    const existingName = await model.findFirst({
      where: {
        name: data.name,
        parent_id: data.parent_id,
      },
    });

    if (existingName) {
      return `Depot with name ${data.name} already exists in this company`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    const company = await prismaClient.companies.findUnique({
      where: { id: data.parent_id },
    });
    if (!company) {
      return `Company with ID ${data.parent_id} does not exist`;
    }

    if (data.manager_id) {
      const manager = await prismaClient.users.findUnique({
        where: { id: data.manager_id },
      });
      if (!manager) {
        return `Manager with ID ${data.manager_id} does not exist`;
      }
    }

    if (data.supervisor_id) {
      const supervisor = await prismaClient.users.findUnique({
        where: { id: data.supervisor_id },
      });
      if (!supervisor) {
        return `Supervisor with ID ${data.supervisor_id} does not exist`;
      }
    }

    if (data.coordinator_id) {
      const coordinator = await prismaClient.users.findUnique({
        where: { id: data.coordinator_id },
      });
      if (!coordinator) {
        return `Coordinator with ID ${data.coordinator_id} does not exist`;
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    const preparedData: any = {
      ...data,
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };

    if (data.latitude !== null && data.latitude !== undefined) {
      preparedData.latitude = new Prisma.Decimal(data.latitude);
    }

    if (data.longitude !== null && data.longitude !== undefined) {
      preparedData.longitude = new Prisma.Decimal(data.longitude);
    }

    return preparedData;
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.depots : prisma.depots;

    const existing = await model.findFirst({
      where: { code: data.code },
    });

    if (!existing) return null;

    const updateData: any = {
      ...data,
      updatedby: userId,
      updatedate: new Date(),
    };

    if (data.latitude !== null && data.latitude !== undefined) {
      updateData.latitude = new Prisma.Decimal(data.latitude);
    }

    if (data.longitude !== null && data.longitude !== undefined) {
      updateData.longitude = new Prisma.Decimal(data.longitude);
    }

    return await model.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  async getDepotsWithRelations(filters?: any): Promise<any[]> {
    return await prisma.depots.findMany({
      where: filters,
      include: {
        depot_companies: {
          select: {
            id: true,
            name: true,
          },
        },
        zone_depots: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        routes_depots: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            // inventory_stock: true,
            promotion_depots: true,
            serial_numbers: true,
            user_depot: true,
          },
        },
      },
      orderBy: { createdate: 'desc' },
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        depot_companies: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            zone_depots: true,
            routes_depots: true,
            inventory_stock: true,
            user_depot: true,
          },
        },
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new (await import('exceljs')).Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'Company Name', key: 'company_name', width: 30 },
      { header: 'Total Zones', key: 'total_zones', width: 15 },
      { header: 'Total Routes', key: 'total_routes', width: 15 },
      { header: 'Total Stock Items', key: 'total_stock', width: 18 },
      { header: 'Total Users', key: 'total_users', width: 15 },
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
      const depot = data[index] as any;
      row.company_name = depot.depot_companies?.name || '';
      row.total_zones = depot._count?.zone_depots || 0;
      row.total_routes = depot._count?.routes_depots || 0;
      row.total_stock = depot._count?.inventory_stock || 0;
      row.total_users = depot._count?.user_depot || 0;

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
    });

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    const summaryRow = worksheet.addRow([]);
    summaryRow.getCell(1).value = `Total Depots: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
