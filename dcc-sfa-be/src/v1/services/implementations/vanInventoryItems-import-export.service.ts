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
      key: 'base_quantity',
      header: 'Base Quantity',
      width: 15,
      required: false,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 0)
          return 'Base Quantity must be a positive number';
        return true;
      },
      description: 'Base Quantity (Pieces) of the product (optional)',
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
    const mockItems = [
      {
        code: 'FG001',
        qty: 10,
        base_qty: 2,
        batch: 'B2026-001',
        mfg: '2026-01-01',
        exp: '2027-01-01',
      },
      {
        code: 'FG001',
        qty: 5,
        base_qty: 3,
        batch: 'B2026-002',
        mfg: '2026-02-01',
        exp: '2027-02-01',
      },
      {
        code: 'KD003',
        qty: 20,
        base_qty: 8,
        batch: '',
        mfg: '',
        exp: '',
      }
    ];

    const sapCodes = mockItems.map(item => item.code);
    const products = await prisma.products.findMany({
      where: { sap_code: { in: sapCodes } },
      select: { id: true, sap_code: true },
    });

    const productMap = new Map(products.map(p => [p.sap_code, p.id]));

    const sampleData = [];
    for (const item of mockItems) {
      const productId = productMap.get(item.code);
      if (productId) {
        sampleData.push({
          product_id: productId,
          quantity: item.qty,
          base_quantity: item.base_qty,
          batch_number: item.batch,
          manufacturing_date: item.mfg,
          expiry_date: item.exp,
          serial_numbers: '',
        });
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
