import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';
import prisma from '../../../configs/prisma.client';

export class VanInventoryItemsImportExportService extends ImportExportService<any> {
  protected modelName = 'van_inventory_items' as const;
  protected displayName = 'Van Inventory Items';
  protected uniqueFields = ['id'];
  protected searchFields = ['product_id'];

  protected masterTableConfigs = [
    {
      masterTable: 'products' as any,
      masterKey: 'id',
      masterDisplayFields: ['id', 'name', 'code', 'tracking_type'],
      sheetName: 'Ref - Products',
      description: 'Use the ID from this sheet in the Product ID column',
    },
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'product_id',
      header: 'Product ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0)
          return 'Product ID must be a positive number';
        return true;
      },
      description: 'ID of the product (required)',
    },
    {
      key: 'quantity',
      header: 'Quantity',
      width: 12,
      required: true,
      type: 'number',
      validation: value => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0)
          return 'Quantity must be a positive number';
        return true;
      },
      description: 'Quantity of the product (required)',
    },
    {
      key: 'batch_number',
      header: 'Batch Number',
      width: 20,
      type: 'string',
      description: 'Batch number (fill only for batch-tracked products)',
    },
    {
      key: 'manufacturing_date',
      header: 'MFG Date',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true;
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      transform: value => {
        if (!value) return null;
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
      description:
        'Manufacturing Date (YYYY-MM-DD format) (fill only for batch-tracked products)',
    },
    {
      key: 'expiry_date',
      header: 'EXP Date',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true;
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      transform: value => {
        if (!value) return null;
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
      description:
        'Expiry Date (YYYY-MM-DD format) (fill only for batch-tracked products)',
    },
    {
      key: 'serial_numbers',
      header: 'Serial Numbers',
      width: 30,
      type: 'string',
      description:
        'Comma-separated serial numbers (fill only for serial-tracked products)',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    const products = await prisma.products.findMany({
      take: 5,
      select: { id: true, name: true, tracking_type: true },
    });

    if (products.length === 0) return [];

    const sampleData = [];

    for (let pIndex = 0; pIndex < products.length; pIndex++) {
      const product = products[pIndex];
      const trackingType = product.tracking_type?.toUpperCase();

      for (let bIndex = 1; bIndex <= 10; bIndex++) {
        if (trackingType === 'BATCH') {
          sampleData.push({
            product_id: product.id,
            quantity: 10,
            batch_number: `B${String(pIndex + 1).padStart(2, '0')}-${String(bIndex).padStart(3, '0')}`,
            manufacturing_date: '2025-01-01',
            expiry_date: '2028-12-31',
            serial_numbers: '',
          });
        } else if (trackingType === 'SERIAL') {
          sampleData.push({
            product_id: product.id,
            quantity: 2,
            batch_number: '',
            manufacturing_date: '',
            expiry_date: '',
            serial_numbers: `SN-${pIndex + 1}-${bIndex}A, SN-${pIndex + 1}-${bIndex}B`,
          });
        } else {
          sampleData.push({
            product_id: product.id,
            quantity: 15,
            batch_number: '',
            manufacturing_date: '',
            expiry_date: '',
            serial_numbers: '',
          });
        }
      }
    }

    return sampleData;
  }

  protected getColumnDescription(): string {
    return 'Template for van inventory items';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data;
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const product = await (tx || prisma).products.findUnique({
      where: { id: data.product_id },
    });
    if (!product) return `Product ID ${data.product_id} not found`;
    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    return data;
  }

  protected async updateExisting(
    data: any,
    existingId: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    return data;
  }

  protected async processImportRecord(
    data: any,
    userId: number,
    options: any,
    tx?: any
  ): Promise<any> {
    return data;
  }
}
