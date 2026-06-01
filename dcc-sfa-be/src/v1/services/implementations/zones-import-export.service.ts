import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class ZonesImportExportService extends ImportExportService<any> {
  protected modelName = 'zones' as const;
  protected displayName = 'Zones';
  protected uniqueFields = ['code'];
  protected searchFields = ['name', 'code', 'description'];

  protected masterTableConfigs = [
    {
      masterTable: 'depots' as any,
      masterKey: 'id',
      masterDisplayFields: ['id', 'name', 'code'],
      sheetName: 'Ref - Depots',
      description: 'Use the ID from this sheet in the Depot ID column',
    },
    {
      masterTable: 'users' as any,
      masterKey: 'id',
      masterDisplayFields: ['id', 'name', 'email', 'employee_id'],
      sheetName: 'Ref - Supervisors',
      description: 'Use the ID from this sheet in the Supervisor ID column',
    },
    {
      masterTable: 'zones' as any,
      masterKey: 'id',
      masterDisplayFields: ['id', 'name', 'code'],
      sheetName: 'Ref - Zones',
      description: 'Use the ID from this sheet in the Parent ID column',
    },
  ];

  private lastNumberCache: Map<string, number> = new Map();
  private validationCache: Map<string, string | null> = new Map();

  private async generateZoneCode(name: string, tx?: any): Promise<string> {
    const prefix = name
      .slice(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, 'Z');
    const db = tx || prisma;

    if (!this.lastNumberCache.has(prefix)) {
      try {
        const lastZone = await db.zones.findFirst({
          where: { code: { startsWith: prefix } },
          orderBy: { id: 'desc' },
          select: { code: true },
        });

        let lastNum = 0;
        if (lastZone && lastZone.code) {
          const match = lastZone.code.match(/(\d+)$/);
          if (match) {
            lastNum = parseInt(match[1], 10);
          }
        }
        this.lastNumberCache.set(prefix, lastNum);
      } catch (error) {
        return `${prefix}${Date.now().toString().slice(-3)}`;
      }
    }

    const nextNum = (this.lastNumberCache.get(prefix) || 0) + 1;
    this.lastNumberCache.set(prefix, nextNum);
    return `${prefix}${nextNum.toString().padStart(3, '0')}`;
  }

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
        if (!value) return 'Name is required';
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
      required: false,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 50) return 'Code must be less than 50 characters';
        if (!/^[A-Z0-9_-]+$/i.test(value))
          return 'Code can only contain letters, numbers, hyphens and underscores';
        return true;
      },
      transform: value =>
        value ? value.toString().trim().toUpperCase() : null,
      description:
        'Unique code for the zone (optional, will be auto-generated if not provided, max 50 chars, alphanumeric)',
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
        const upperValue = value ? value.toString().toUpperCase() : 'Y';
        return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
      },
      transform: value => (value ? value.toString().toUpperCase() : 'Y'),
      description: 'Active status - Y for Yes, N for No (defaults to Y)',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    const [depots, users, parentZones] = await Promise.all([
      prisma.depots.findFirst({ select: { id: true } }),
      prisma.users.findFirst({ select: { id: true } }),
      prisma.zones.findFirst({ select: { id: true } }),
    ]);

    return [
      {
        parent_id: parentZones?.id || 1,
        depot_id: depots?.id || 1,
        name: 'Zone North',
        code: 'ZN001',
        description: 'Northern region zone covering areas A, B, C',
        supervisor_id: users?.id || 1,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map((zone: any) => ({
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
    if (!data.code) return null;
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

    const checkCache = async (
      type: string,
      id: any,
      validator: () => Promise<string | null>
    ) => {
      if (!id) return null;
      const cacheKey = `${type}_${id}`;
      if (this.validationCache.has(cacheKey)) {
        return this.validationCache.get(cacheKey)!;
      }
      const result = await validator();
      this.validationCache.set(cacheKey, result);
      return result;
    };

    if (data.parent_id) {
      const error = await checkCache('zone', data.parent_id, async () => {
        const parentZone = await prismaClient.zones.findUnique({
          where: { id: data.parent_id },
        });
        if (!parentZone) return `Parent Zone with ID ${data.parent_id} does not exist`;
        return null;
      });
      if (error) return error;
    }

    if (data.depot_id) {
      const error = await checkCache('depot', data.depot_id, async () => {
        const depot = await prismaClient.depots.findUnique({
          where: { id: data.depot_id },
        });
        if (!depot) return `Depot with ID ${data.depot_id} does not exist`;
        return null;
      });
      if (error) return error;
    }

    if (data.supervisor_id) {
      const error = await checkCache('user', data.supervisor_id, async () => {
        const supervisor = await prismaClient.users.findUnique({
          where: { id: data.supervisor_id },
        });
        if (!supervisor) return `Supervisor with ID ${data.supervisor_id} does not exist`;
        return null;
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
    let code = data.code;
    if (!code) {
      code = await this.generateZoneCode(data.name, tx);
    }

    return {
      ...data,
      code,
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
