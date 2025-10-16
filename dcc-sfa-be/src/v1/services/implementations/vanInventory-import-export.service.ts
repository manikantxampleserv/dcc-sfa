import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VanInventoryImportExportService extends ImportExportService<any> {
  protected modelName = 'van_inventory' as const;
  protected displayName = 'Van Inventory';
  protected uniqueFields = [
    'user_id',
    'product_id',
    'batch_id',
    'serial_no_id',
  ];
  protected searchFields = [
    'user_id',
    'product_id',
    'batch_id',
    'serial_no_id',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'user_id',
      header: 'User ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0)
          return 'User ID must be a positive number';
        return true;
      },
      description: 'ID of the user/salesperson (required, positive integer)',
    },
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
      description: 'ID of the product (required, positive integer)',
    },
    {
      key: 'batch_id',
      header: 'Batch ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0)
          return 'Batch ID must be a positive number';
        return true;
      },
      description: 'ID of the batch/lot (optional, positive integer)',
    },
    {
      key: 'serial_no_id',
      header: 'Serial No ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0)
          return 'Serial No ID must be a positive number';
        return true;
      },
      description: 'ID of the serial number (optional, positive integer)',
    },
    {
      key: 'quantity',
      header: 'Quantity',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 0)
          return 'Quantity must be 0 or greater';
        return true;
      },
      description: 'Total quantity in van (required, 0 or greater)',
    },
    {
      key: 'reserved_quantity',
      header: 'Reserved Quantity',
      width: 18,
      type: 'number',
      defaultValue: 0,
      validation: value => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 0)
          return 'Reserved quantity must be 0 or greater';
        return true;
      },
      description: 'Reserved quantity (optional, defaults to 0)',
    },
    {
      key: 'available_quantity',
      header: 'Available Quantity',
      width: 18,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 0)
          return 'Available quantity must be 0 or greater';
        return true;
      },
      description: 'Available quantity (optional, calculated automatically)',
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
        user_id: 1,
        product_id: 1,
        batch_id: 1,
        serial_no_id: null,
        quantity: 50,
        reserved_quantity: 5,
        available_quantity: 45,
        is_active: 'Y',
      },
      {
        user_id: 2,
        product_id: 2,
        batch_id: null,
        serial_no_id: 1,
        quantity: 25,
        reserved_quantity: 0,
        available_quantity: 25,
        is_active: 'Y',
      },
      {
        user_id: 1,
        product_id: 3,
        batch_id: 2,
        serial_no_id: null,
        quantity: 100,
        reserved_quantity: 10,
        available_quantity: 90,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(vanInventory => ({
      user_id: vanInventory.user_id,
      product_id: vanInventory.product_id,
      batch_id: vanInventory.batch_id || '',
      serial_no_id: vanInventory.serial_no_id || '',
      quantity: vanInventory.quantity || 0,
      reserved_quantity: vanInventory.reserved_quantity || 0,
      available_quantity: vanInventory.available_quantity || '',
      is_active: vanInventory.is_active || 'Y',
      created_date: vanInventory.createdate?.toISOString().split('T')[0] || '',
      created_by: vanInventory.createdby || '',
      updated_date: vanInventory.updatedate?.toISOString().split('T')[0] || '',
      updated_by: vanInventory.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.van_inventory : prisma.van_inventory;

    const existingRecord = await model.findFirst({
      where: {
        user_id: data.user_id,
        product_id: data.product_id,
        batch_id: data.batch_id || null,
        serial_no_id: data.serial_no_id || null,
      },
    });

    if (existingRecord) {
      return `Van inventory record already exists for user ${data.user_id}, product ${data.product_id}${
        data.batch_id ? `, batch ${data.batch_id}` : ''
      }${data.serial_no_id ? `, serial ${data.serial_no_id}` : ''}`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const userModel = tx ? tx.users : prisma.users;
    const productModel = tx ? tx.products : prisma.products;
    const batchModel = tx ? tx.batch_lots : prisma.batch_lots;
    const serialModel = tx ? tx.serial_numbers : prisma.serial_numbers;

    // Validate user exists
    const user = await userModel.findUnique({
      where: { id: data.user_id },
    });
    if (!user) {
      return `User with ID ${data.user_id} does not exist`;
    }

    // Validate product exists
    const product = await productModel.findUnique({
      where: { id: data.product_id },
    });
    if (!product) {
      return `Product with ID ${data.product_id} does not exist`;
    }

    // Validate batch exists (if provided)
    if (data.batch_id) {
      const batch = await batchModel.findUnique({
        where: { id: data.batch_id },
      });
      if (!batch) {
        return `Batch with ID ${data.batch_id} does not exist`;
      }
    }

    // Validate serial number exists (if provided)
    if (data.serial_no_id) {
      const serial = await serialModel.findUnique({
        where: { id: data.serial_no_id },
      });
      if (!serial) {
        return `Serial number with ID ${data.serial_no_id} does not exist`;
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
      available_quantity:
        data.available_quantity ||
        data.quantity - (data.reserved_quantity || 0),
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
    const model = tx ? tx.van_inventory : prisma.van_inventory;

    const existing = await model.findFirst({
      where: {
        user_id: data.user_id,
        product_id: data.product_id,
        batch_id: data.batch_id || null,
        serial_no_id: data.serial_no_id || null,
      },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        available_quantity:
          data.available_quantity ||
          data.quantity - (data.reserved_quantity || 0),
        updatedby: userId,
        updatedate: new Date(),
      },
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        van_inventory_users: {
          select: { id: true, name: true, email: true },
        },
        van_inventory_products: {
          select: { id: true, name: true, code: true },
        },
        batch_lots: {
          select: { id: true, batch_number: true, quantity: true },
        },
        serial_numbers: {
          select: { id: true, serial_number: true, status: true },
        },
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new (await import('exceljs')).Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: 'User Name', key: 'user_name', width: 20 },
      { header: 'Product Name', key: 'product_name', width: 25 },
      { header: 'Batch Number', key: 'batch_number', width: 20 },
      { header: 'Serial Number', key: 'serial_number', width: 20 },
      { header: 'Created Date', key: 'created_date', width: 15 },
      { header: 'Created By', key: 'created_by', width: 15 },
      { header: 'Updated Date', key: 'updated_date', width: 15 },
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
    exportData.forEach((row: any, index: number) => {
      const excelRow = worksheet.addRow({
        ...row,
        user_name: data[index]?.van_inventory_users?.name || '',
        product_name: data[index]?.van_inventory_products?.name || '',
        batch_number: data[index]?.batch_lots?.batch_number || '',
        serial_number: data[index]?.serial_numbers?.serial_number || '',
      });

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
    summaryRow.getCell(1).value = `Total Van Inventory Records: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
