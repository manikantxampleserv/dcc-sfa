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
        product_id: 1,
        quantity: 70,
        base_quantity: 0,
        batch_number: 'CK3-33609',
        manufacturing_date: '',
        expiry_date: '2027-07-23',
        serial_numbers: '',
      },
      {
        product_id: 2,
        quantity: 25,
        base_quantity: 0,
        batch_number: 'CK3-33616',
        manufacturing_date: '',
        expiry_date: '2027-07-25',
        serial_numbers: '',
      },
      {
        product_id: 6,
        quantity: 17,
        base_quantity: 0,
        batch_number: 'CK3-33606',
        manufacturing_date: '',
        expiry_date: '2027-07-22',
        serial_numbers: '',
      },
      {
        product_id: 3,
        quantity: 11,
        base_quantity: 0,
        batch_number: 'CK3-33612',
        manufacturing_date: '',
        expiry_date: '2027-07-24',
        serial_numbers: '',
      },
      {
        product_id: 7,
        quantity: 5,
        base_quantity: 0,
        batch_number: 'CK3-33603',
        manufacturing_date: '',
        expiry_date: '2027-01-19',
        serial_numbers: '',
      },
      {
        product_id: 9,
        quantity: 3,
        base_quantity: 0,
        batch_number: 'CK3-33619',
        manufacturing_date: '',
        expiry_date: '2027-07-26',
        serial_numbers: '',
      },
      {
        product_id: 10,
        quantity: 3,
        base_quantity: 0,
        batch_number: 'CK3-33553',
        manufacturing_date: '',
        expiry_date: '2027-07-09',
        serial_numbers: '',
      },
      {
        product_id: 11,
        quantity: 3,
        base_quantity: 0,
        batch_number: 'CK3-33618',
        manufacturing_date: '',
        expiry_date: '2027-07-27',
        serial_numbers: '',
      },
      {
        product_id: 12,
        quantity: 2,
        base_quantity: 0,
        batch_number: 'CK3-33444',
        manufacturing_date: '',
        expiry_date: '2027-06-10',
        serial_numbers: '',
      },
      {
        product_id: 5,
        quantity: 6,
        base_quantity: 0,
        batch_number: 'CK3-33579',
        manufacturing_date: '',
        expiry_date: '2027-07-15',
        serial_numbers: '',
      },
      {
        product_id: 41,
        quantity: 2,
        base_quantity: 0,
        batch_number: 'CK3-33338',
        manufacturing_date: '',
        expiry_date: '2027-05-29',
        serial_numbers: '',
      },
      {
        product_id: 15,
        quantity: 2,
        base_quantity: 0,
        batch_number: 'CK3-32758',
        manufacturing_date: '',
        expiry_date: '2026-12-18',
        serial_numbers: '',
      },
      {
        product_id: 42,
        quantity: 149,
        base_quantity: 0,
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        serial_numbers: '',
      },
      {
        product_id: 43,
        quantity: 149,
        base_quantity: 0,
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        serial_numbers: '',
      },
      {
        product_id: 35,
        quantity: 80,
        base_quantity: 0,
        batch_number: 'CK6-011',
        manufacturing_date: '',
        expiry_date: '2027-07-25',
        serial_numbers: '',
      },
      {
        product_id: 36,
        quantity: 70,
        base_quantity: 0,
        batch_number: 'CK4-889',
        manufacturing_date: '',
        expiry_date: '2027-07-26',
        serial_numbers: '',
      },
      {
        product_id: 16,
        quantity: 40,
        base_quantity: 0,
        batch_number: 'CK5-33615',
        manufacturing_date: '',
        expiry_date: '2026-11-14',
        serial_numbers: '',
      },
      {
        product_id: 18,
        quantity: 30,
        base_quantity: 0,
        batch_number: 'CK6-33624',
        manufacturing_date: '',
        expiry_date: '2026-11-16',
        serial_numbers: '',
      },
      {
        product_id: 17,
        quantity: 10,
        base_quantity: 0,
        batch_number: 'CK6-33578',
        manufacturing_date: '',
        expiry_date: '2026-11-03',
        serial_numbers: '',
      },
      {
        product_id: 19,
        quantity: 10,
        base_quantity: 0,
        batch_number: 'CK5-33626',
        manufacturing_date: '',
        expiry_date: '2026-11-16',
        serial_numbers: '',
      },
      {
        product_id: 22,
        quantity: 5,
        base_quantity: 0,
        batch_number: 'CK5-33581',
        manufacturing_date: '',
        expiry_date: '2026-11-05',
        serial_numbers: '',
      },
      {
        product_id: 23,
        quantity: 4,
        base_quantity: 0,
        batch_number: 'CK5-33566',
        manufacturing_date: '',
        expiry_date: '2026-10-31',
        serial_numbers: '',
      },
      {
        product_id: 24,
        quantity: 5,
        base_quantity: 0,
        batch_number: 'CK5-33613',
        manufacturing_date: '',
        expiry_date: '2026-11-13',
        serial_numbers: '',
      },
      {
        product_id: 21,
        quantity: 4,
        base_quantity: 0,
        batch_number: 'CK6-33584',
        manufacturing_date: '',
        expiry_date: '2026-11-05',
        serial_numbers: '',
      },
      {
        product_id: 44,
        quantity: 5,
        base_quantity: 0,
        batch_number: 'CK5-33444',
        manufacturing_date: '',
        expiry_date: '2026-10-05',
        serial_numbers: '',
      },
      {
        product_id: 30,
        quantity: 10,
        base_quantity: 0,
        batch_number: 'CK5-33555',
        manufacturing_date: '',
        expiry_date: '2026-10-01',
        serial_numbers: '',
      },
      {
        product_id: 25,
        quantity: 30,
        base_quantity: 0,
        batch_number: 'CK5-33599',
        manufacturing_date: '',
        expiry_date: '2026-10-14',
        serial_numbers: '',
      },
      {
        product_id: 31,
        quantity: 10,
        base_quantity: 0,
        batch_number: 'CK5-33589',
        manufacturing_date: '',
        expiry_date: '2026-10-09',
        serial_numbers: '',
      },
    ];

    const productIds = mockItems.map(item => item.product_id);
    const validProducts = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const validProductIds = new Set(validProducts.map(p => p.id));

    const sampleData = mockItems.filter(item =>
      validProductIds.has(item.product_id)
    );
    return sampleData.length > 0 ? sampleData : mockItems;
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
