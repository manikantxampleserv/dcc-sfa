import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class DepotsImportExportService extends ImportExportService<any> {
  protected modelName = 'depots' as const;
  protected displayName = 'Depots';
  protected uniqueFields = ['code'];
  protected searchFields = ['name', 'code', 'address', 'city', 'email'];

  protected masterTableConfigs = [
    {
      masterTable: 'companies' as any,
      masterKey: 'id',
      masterDisplayFields: ['id', 'name', 'code'],
      sheetName: 'Ref - Companies',
      description: 'Use the ID from this sheet in the Company ID column',
    },
    {
      masterTable: 'users' as any,
      masterKey: 'id',
      masterDisplayFields: ['id', 'name', 'email', 'employee_id'],
      sheetName: 'Ref - Users',
      description: 'Use the ID from this sheet for Manager ID, Supervisor ID, Coordinator ID columns',
    },
  ];

  private validationCache: Map<string, string | null> = new Map();

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
        if (!value || value.length < 2) return 'Name too short';
        if (value.length > 255) return 'Name too long';
        return true;
      },
      description: 'Name of the depot (required)',
    },
    {
      key: 'code',
      header: 'Depot Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Code is required';
        if (!/^[A-Z0-9_-]+$/i.test(value)) return 'Invalid code format';
        return true;
      },
      transform: value => value.toUpperCase().trim(),
      description: 'Unique depot code (required)',
    },
    {
      key: 'address',
      header: 'Address',
      width: 40,
      type: 'string',
      description: 'Address (optional)',
    },
    {
      key: 'city',
      header: 'City',
      width: 25,
      type: 'string',
      description: 'City (optional)',
    },
    {
      key: 'state',
      header: 'State',
      width: 20,
      type: 'string',
      description: 'State (optional)',
    },
    {
      key: 'zipcode',
      header: 'Zip Code',
      width: 15,
      type: 'string',
      description: 'Zip code (optional)',
    },
    {
      key: 'phone_number',
      header: 'Phone Number',
      width: 20,
      type: 'string',
      description: 'Phone number (optional)',
    },
    {
      key: 'email',
      header: 'Email',
      width: 30,
      type: 'email',
      transform: value => (value ? value.toLowerCase().trim() : null),
      description: 'Email (optional)',
    },
    {
      key: 'manager_id',
      header: 'Manager ID',
      width: 15,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'Manager User ID (optional)',
    },
    {
      key: 'supervisor_id',
      header: 'Supervisor ID',
      width: 15,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'Supervisor User ID (optional)',
    },
    {
      key: 'coordinator_id',
      header: 'Coordinator ID',
      width: 15,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'Coordinator User ID (optional)',
    },
    {
      key: 'latitude',
      header: 'Latitude',
      width: 15,
      type: 'number',
      transform: value => (value ? parseFloat(value) : null),
      description: 'Latitude (optional)',
    },
    {
      key: 'longitude',
      header: 'Longitude',
      width: 15,
      type: 'number',
      transform: value => (value ? parseFloat(value) : null),
      description: 'Longitude (optional)',
    },
    {
      key: 'is_active',
      header: 'Is Active',
      width: 12,
      type: 'string',
      defaultValue: 'Y',
      transform: value => (value ? value.toString().toUpperCase() : 'Y'),
      description: 'Active status (Y/N)',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    const company = await prisma.companies.findFirst({ select: { id: true } });
    return [
      {
        name: 'Main Depot',
        code: 'DEP001',
        parent_id: company?.id || 1,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(depot => ({
      name: depot.name,
      code: depot.code,
      parent_id: depot.parent_id,
      manager_id: depot.manager_id,
      supervisor_id: depot.supervisor_id,
      coordinator_id: depot.coordinator_id,
      address: depot.address,
      city: depot.city,
      state: depot.state,
      phone_number: depot.phone_number,
      email: depot.email,
      is_active: depot.is_active,
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.depots : prisma.depots;
    const existing = await model.findFirst({ where: { code: data.code } });
    return existing ? `Depot code "${data.code}" already exists` : null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    const checkCache = async (type: string, id: any, validator: () => Promise<string | null>) => {
      if (!id) return null;
      const cacheKey = `${type}_${id}`;
      if (this.validationCache.has(cacheKey)) return this.validationCache.get(cacheKey)!;
      const result = await validator();
      this.validationCache.set(cacheKey, result);
      return result;
    };

    const errorCompany = await checkCache('company', data.parent_id, async () => {
      const company = await prismaClient.companies.findUnique({ where: { id: data.parent_id } });
      return company ? null : `Company ID ${data.parent_id} not found`;
    });
    if (errorCompany) return errorCompany;

    if (data.manager_id) {
      const error = await checkCache('user', data.manager_id, async () => {
        const user = await prismaClient.users.findUnique({ where: { id: data.manager_id } });
        return user ? null : `Manager ID ${data.manager_id} not found`;
      });
      if (error) return error;
    }

    if (data.supervisor_id) {
      const error = await checkCache('user', data.supervisor_id, async () => {
        const user = await prismaClient.users.findUnique({ where: { id: data.supervisor_id } });
        return user ? null : `Supervisor ID ${data.supervisor_id} not found`;
      });
      if (error) return error;
    }

    if (data.coordinator_id) {
      const error = await checkCache('user', data.coordinator_id, async () => {
        const user = await prismaClient.users.findUnique({ where: { id: data.coordinator_id } });
        return user ? null : `Coordinator ID ${data.coordinator_id} not found`;
      });
      if (error) return error;
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number,
    tx?: any
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
    const existing = await model.findFirst({ where: { code: data.code } });
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
}
