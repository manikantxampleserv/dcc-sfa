import { ImportExportService } from '../base/import-export.service';
import {
  ColumnDefinition,
  ImportOptions,
  ImportResult,
} from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class AssetSubTypesImportExportService extends ImportExportService<any> {
  protected modelName = 'asset_sub_types' as const;
  protected displayName = 'Asset Sub Types';
  protected uniqueFields = ['name', 'asset_type_id'];
  protected searchFields = ['name', 'description', 'code'];

  // Add code counters to avoid database queries during import
  private codeCounters = new Map<string, number>();

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Asset Sub Type Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name must be less than 100 characters';
        return true;
      },
      description: 'Name of the asset sub type (required, 2-100 characters)',
    },
    {
      key: 'asset_type_id',
      header: 'Asset Type ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Asset Type ID is required';
        const num = Number(value);
        if (isNaN(num) || num <= 0)
          return 'Asset Type ID must be a positive number';
        return true;
      },
      transform: value => (value ? Number(value) : null),
      description: 'Foreign key reference to asset_types.id (required)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 255 ||
        'Description must be less than 255 characters',
      description:
        'Description of the asset sub type (optional, max 255 chars)',
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
    // Sample assumes asset type IDs exist in the database
    return [
      {
        name: 'Single Door',
        asset_type_id: 1,
        description: 'Single door cooler subtype',
        is_active: 'Y',
      },
      {
        name: 'Double Door',
        asset_type_id: 1,
        description: 'Double door cooler subtype',
        is_active: 'Y',
      },
      {
        name: 'Counter Top',
        asset_type_id: 2,
        description: 'Counter top display subtype',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(subType => ({
      name: subType.name,
      asset_type_id: subType.asset_type_id,
      description: subType.description || '',
      is_active: subType.is_active || 'Y',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.asset_sub_types : prisma.asset_sub_types;

    const existing = await model.findFirst({
      where: { name: data.name, asset_type_id: data.asset_type_id },
    });

    if (existing) {
      return `Asset sub type "${data.name}" already exists for asset type ID ${data.asset_type_id}`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    const assetType = await prismaClient.asset_types.findUnique({
      where: { id: data.asset_type_id },
    });
    if (!assetType) {
      return `Asset type with ID ${data.asset_type_id} does not exist`;
    }

    return null;
  }

  private async generateCode(name: string, tx?: any): Promise<string> {
    const words = name.toUpperCase().split(/\s+/);
    const firstWord = words[0];
    let abbreviation = firstWord.substring(0, 4);
    if (firstWord.length <= 4) {
      abbreviation = firstWord;
    }

    const baseCode = `AST-${abbreviation}`;

    // Use counter-based approach to avoid database queries during import
    const currentCount = this.codeCounters.get(baseCode) || 0;
    const nextCount = currentCount + 1;
    this.codeCounters.set(baseCode, nextCount);

    return `${baseCode}-${nextCount.toString().padStart(2, '0')}`;
  }

  /**
   * Initialize counters with existing codes to avoid conflicts
   * This should be called once at the beginning of the import process
   */
  private async initializeCodeCounters(tx?: any): Promise<void> {
    try {
      const model = tx ? tx.asset_sub_types : prisma.asset_sub_types;

      // Get all existing codes and initialize counters
      const existingCodes = await model.findMany({
        select: { code: true },
        where: {
          code: {
            startsWith: 'AST-',
          },
        },
      });

      // Process each code to extract the base and number
      for (const item of existingCodes) {
        const code = item.code;
        const match = code.match(/^AST-([A-Z]+)-(\d+)$/);

        if (match) {
          const baseCode = `AST-${match[1]}`;
          const number = parseInt(match[2]);

          // Update counter to the maximum number found for this base
          const currentMax = this.codeCounters.get(baseCode) || 0;
          if (number > currentMax) {
            this.codeCounters.set(baseCode, number);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing code counters:', error);
      // If initialization fails, we'll start with empty counters
      // This might cause conflicts but won't crash the import
    }
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    const code = await this.generateCode(data.name);
    return {
      ...data,
      code,
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };
  }

  /**
   * Override importData to initialize code counters before transaction starts
   */
  async importData(
    data: any[],
    userId: number,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    // Initialize code counters before starting the transaction to avoid timeouts
    await this.initializeCodeCounters();

    // Call the parent importData method
    return super.importData(data, userId, options);
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.asset_sub_types : prisma.asset_sub_types;

    const existing = await model.findFirst({
      where: { name: data.name, asset_type_id: data.asset_type_id },
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
