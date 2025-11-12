import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class ZonesImportExportService extends ImportExportService<any> {
  protected modelName = 'zones' as const;
  protected displayName = 'Zones';
  protected uniqueFields = ['code'];
  protected searchFields = ['name', 'code', 'description'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'parent_id',
      header: 'Parent ID',
      width: 15,
      required: true,
      type: 'number',
      transform: value => parseInt(value),
      description: 'ID of the parent zone (required)',
    },
    {
      key: 'depot_id',
      header: 'Depot ID',
      width: 15,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the associated depot (optional)',
    },
    {
      key: 'name',
      header: 'Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (value.length > 255) return 'Name must be less than 255 characters';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return true;
      },
      description: 'Name of the zone (required, 2-255 characters)',
    },
    {
      key: 'code',
      header: 'Code',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (value.length > 50) return 'Code must be less than 50 characters';
        if (!/^[A-Z0-9_-]+$/i.test(value))
          return 'Code can only contain letters, numbers, hyphens and underscores';
        return true;
      },
      transform: value => value.toUpperCase(),
      description:
        'Unique code for the zone (required, max 50 chars, alphanumeric)',
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
      description: 'Description of the zone (optional, max 500 chars)',
    },
    {
      key: 'supervisor_id',
      header: 'Supervisor ID',
      width: 15,
      type: 'number',
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the supervisor user (optional)',
    },
    {
      key: 'is_active',
      header: 'Is Active',
      width: 12,
      type: 'string',
      defaultValue: 'Y',
      validation: value => {
        const upperValue = value.toString().toUpperCase();
        return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
      },
      transform: value => value.toString().toUpperCase(),
      description: 'Active status - Y for Yes, N for No (defaults to Y)',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    return [
      {
        parent_id: 1,
        depot_id: 1,
        name: 'Zone North',
        code: 'ZN001',
        description: 'Northern region zone covering areas A, B, C',
        supervisor_id: 1,
        is_active: 'Y',
      },
      {
        parent_id: 1,
        depot_id: 2,
        name: 'Zone South',
        code: 'ZS001',
        description: 'Southern region zone covering areas X, Y, Z',
        supervisor_id: 2,
        is_active: 'Y',
      },
      {
        parent_id: 2,
        depot_id: 1,
        name: 'Zone East',
        code: 'ZE001',
        description: 'Eastern region zone',
        supervisor_id: 3,
        is_active: 'N',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(zone => ({
      parent_id: zone.parent_id,
      depot_id: zone.depot_id || '',
      name: zone.name,
      code: zone.code,
      description: zone.description || '',
      supervisor_id: zone.supervisor_id || '',
      is_active: zone.is_active,
      created_date: zone.createdate?.toISOString().split('T')[0] || '',
      created_by: zone.createdby,
      updated_date: zone.updatedate?.toISOString().split('T')[0] || '',
      updated_by: zone.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.zones : prisma.zones;
    const existing = await model.findFirst({
      where: { code: data.code },
    });
    return existing ? `Zone with code ${data.code} already exists` : null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.depot_id) {
      const depot = await prismaClient.depots.findUnique({
        where: { id: data.depot_id },
      });
      if (!depot) {
        return `Depot with ID ${data.depot_id} does not exist`;
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

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      ...data,
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
    const model = tx ? tx.zones : prisma.zones;

    const existing = await model.findFirst({
      where: { code: data.code },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }
}
