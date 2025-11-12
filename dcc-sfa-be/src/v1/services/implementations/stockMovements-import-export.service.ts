import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class StockMovementsImportExportService extends ImportExportService<any> {
  protected modelName = 'stock_movements' as const;
  protected displayName = 'Stock Movements';
  protected uniqueFields = ['id'];
  protected searchFields = ['movement_type', 'reference_type', 'remarks'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'product_id',
      header: 'Product ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Product ID must be a positive number';
        return true;
      },
      description: 'Product ID (required, must be valid product)',
    },
    {
      key: 'batch_id',
      header: 'Batch ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = parseInt(value);
        if (isNaN(num) || num <= 0) return 'Batch ID must be a positive number';
        return true;
      },
      description: 'Batch ID (optional, leave empty if no batch tracking)',
    },
    {
      key: 'serial_id',
      header: 'Serial ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Serial ID must be a positive number';
        return true;
      },
      description: 'Serial ID (optional, leave empty if no serial tracking)',
    },
    {
      key: 'movement_type',
      header: 'Movement Type',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Movement type must be at least 2 characters';
        if (value.length > 50)
          return 'Movement type must be less than 50 characters';
        return true;
      },
      description: 'Movement type (e.g., IN, OUT, TRANSFER)',
    },
    {
      key: 'reference_type',
      header: 'Reference Type',
      width: 20,
      type: 'string',
      validation: value => {
        if (!value) return true; // Optional field
        if (value.length > 50)
          return 'Reference type must be less than 50 characters';
        return true;
      },
      description: 'Reference type (e.g., ORDER, TRANSFER, ADJUSTMENT)',
    },
    {
      key: 'reference_id',
      header: 'Reference ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Reference ID must be a positive number';
        return true;
      },
      description: 'Reference ID (optional, must be valid reference)',
    },
    {
      key: 'from_location_id',
      header: 'From Location ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'From location ID must be a positive number';
        return true;
      },
      description: 'From location ID (optional, must be valid location)',
    },
    {
      key: 'to_location_id',
      header: 'To Location ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'To location ID must be a positive number';
        return true;
      },
      description: 'To location ID (optional, must be valid location)',
    },
    {
      key: 'quantity',
      header: 'Quantity',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0) return 'Quantity must be a positive number';
        return true;
      },
      description: 'Movement quantity (required, must be positive)',
    },
    {
      key: 'movement_date',
      header: 'Movement Date',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      description: 'Movement date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'remarks',
      header: 'Remarks',
      width: 30,
      type: 'string',
      validation: value => {
        if (!value) return true; // Optional field
        if (value.length > 1000)
          return 'Remarks must be less than 1000 characters';
        return true;
      },
      description: 'Movement remarks (optional, max 1000 characters)',
    },
    {
      key: 'van_inventory_id',
      header: 'Van Inventory ID',
      width: 18,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Van inventory ID must be a positive number';
        return true;
      },
      description: 'Van inventory ID (optional, must be valid van inventory)',
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
    const products = await prisma.products.findMany({
      take: 3,
      select: { id: true, name: true, code: true },
      orderBy: { id: 'asc' },
    });
    const warehouses = await prisma.warehouses.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const productIds = products.map(p => p.id);
    const warehouseIds = warehouses.map(w => w.id);

    const productId1 = productIds[0] || 1;
    const productId2 = productIds[1] || 1;
    const productId3 = productIds[2] || 1;
    const warehouseId1 = warehouseIds[0] || 1;
    const warehouseId2 = warehouseIds[1] || 1;
    const warehouseId3 = warehouseIds[2] || 1;

    return [
      {
        product_id: productId1,
        batch_id: null,
        serial_id: null,
        movement_type: 'IN',
        reference_type: 'PURCHASE',
        reference_id: 1,
        from_location_id: null,
        to_location_id: warehouseId1,
        quantity: 100,
        movement_date: '2024-01-20',
        remarks: 'Initial stock receipt',
        van_inventory_id: null,
        is_active: 'Y',
      },
      {
        product_id: productId2,
        batch_id: null,
        serial_id: null,
        movement_type: 'OUT',
        reference_type: 'SALE',
        reference_id: 2,
        from_location_id: warehouseId1,
        to_location_id: null,
        quantity: 50,
        movement_date: '2024-01-21',
        remarks: 'Stock sold to customer',
        van_inventory_id: 1,
        is_active: 'Y',
      },
      {
        product_id: productId3,
        batch_id: null,
        serial_id: null,
        movement_type: 'TRANSFER',
        reference_type: 'TRANSFER',
        reference_id: 3,
        from_location_id: warehouseId1,
        to_location_id: warehouseId2,
        quantity: 25,
        movement_date: '2024-01-22',
        remarks: 'Inter-warehouse transfer',
        van_inventory_id: null,
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(movement => ({
      product_id: movement.product_id,
      batch_id: movement.batch_id || '',
      serial_id: movement.serial_id || '',
      movement_type: movement.movement_type,
      reference_type: movement.reference_type || '',
      reference_id: movement.reference_id || '',
      from_location_id: movement.from_location_id || '',
      to_location_id: movement.to_location_id || '',
      quantity: movement.quantity,
      movement_date: movement.movement_date?.toISOString().split('T')[0] || '',
      remarks: movement.remarks || '',
      van_inventory_id: movement.van_inventory_id || '',
      is_active: movement.is_active || 'Y',
      created_date: movement.createdate?.toISOString().split('T')[0] || '',
      created_by: movement.createdby || '',
      updated_date: movement.updatedate?.toISOString().split('T')[0] || '',
      updated_by: movement.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    // Stock movements don't have unique constraints beyond ID
    // We'll check for potential duplicates based on business logic
    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const productModel = tx ? tx.products : prisma.products;
    const product = await productModel.findFirst({
      where: { id: data.product_id },
      select: { id: true, name: true },
    });

    if (!product) {
      return `Product with ID ${data.product_id} does not exist. Please check the product ID or create the product first.`;
    }

    // Validate batch_id if provided
    if (data.batch_id) {
      const batchModel = tx ? tx.batch_lots : prisma.batch_lots;
      const batch = await batchModel.findFirst({
        where: { id: data.batch_id },
        select: { id: true, batch_number: true },
      });

      if (!batch) {
        return `Batch with ID ${data.batch_id} does not exist. Please check the batch ID or create the batch first.`;
      }
    }

    // Validate serial_id if provided
    if (data.serial_id) {
      const serialModel = tx ? tx.serial_numbers : prisma.serial_numbers;
      const serial = await serialModel.findFirst({
        where: { id: data.serial_id },
        select: { id: true, serial_number: true },
      });

      if (!serial) {
        return `Serial with ID ${data.serial_id} does not exist. Please check the serial ID or create the serial first.`;
      }
    }

    if (data.from_location_id) {
      const fromLocation = await prisma.warehouses.findFirst({
        where: { id: data.from_location_id },
        select: { id: true, name: true },
      });

      if (!fromLocation) {
        return `From location with ID ${data.from_location_id} does not exist. Please check the location ID or create the location first.`;
      }
    }

    if (data.to_location_id) {
      const toLocation = await prisma.warehouses.findFirst({
        where: { id: data.to_location_id },
        select: { id: true, name: true },
      });

      if (!toLocation) {
        return `To location with ID ${data.to_location_id} does not exist. Please check the location ID or create the location first.`;
      }
    }

    // Validate van_inventory_id if provided
    if (data.van_inventory_id) {
      const vanInventory = await prisma.van_inventory.findFirst({
        where: { id: data.van_inventory_id },
        select: { id: true, user_id: true, status: true, loading_type: true },
      });

      if (!vanInventory) {
        return `Van inventory with ID ${data.van_inventory_id} does not exist. Please check the van inventory ID or create the van inventory first.`;
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
      movement_date: data.movement_date
        ? new Date(data.movement_date)
        : undefined,
      product_id: parseInt(data.product_id),
      batch_id:
        data.batch_id && data.batch_id !== '' ? parseInt(data.batch_id) : null,
      serial_id:
        data.serial_id && data.serial_id !== ''
          ? parseInt(data.serial_id)
          : null,
      reference_id:
        data.reference_id && data.reference_id !== ''
          ? parseInt(data.reference_id)
          : null,
      from_location_id:
        data.from_location_id && data.from_location_id !== ''
          ? parseInt(data.from_location_id)
          : null,
      to_location_id:
        data.to_location_id && data.to_location_id !== ''
          ? parseInt(data.to_location_id)
          : null,
      quantity: parseInt(data.quantity),
      van_inventory_id:
        data.van_inventory_id && data.van_inventory_id !== ''
          ? parseInt(data.van_inventory_id)
          : null,
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
    // Stock movements are typically not updated after creation
    // This method is kept for consistency but returns null
    return null;
  }

  /**
   * Get available IDs for reference during import.
   */
  async getAvailableIds(): Promise<{
    products: Array<{ id: number; name: string; code: string }>;
    warehouses: Array<{ id: number; name: string }>;
    batches: Array<{ id: number; batch_number: string; product_id: number }>;
    serials: Array<{ id: number; serial_number: string; product_id: number }>;
  }> {
    const [products, warehouses, batches, serials] = await Promise.all([
      prisma.products.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { id: 'asc' },
        take: 10,
      }),
      prisma.warehouses.findMany({
        select: { id: true, name: true },
        orderBy: { id: 'asc' },
        take: 10,
      }),
      prisma.batch_lots.findMany({
        select: { id: true, batch_number: true, product_id: true },
        orderBy: { id: 'asc' },
        take: 10,
      }),
      prisma.serial_numbers.findMany({
        select: { id: true, serial_number: true, product_id: true },
        orderBy: { id: 'asc' },
        take: 10,
      }),
    ]);

    return { products, warehouses, batches, serials };
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        stock_movements_products: true,
        stock_movements_from_location: true,
        stock_movements_to_location: true,
        van_inventory: {
          include: {
            van_inventory_items: {
              include: {
                products: true,
              },
            },
            van_inventory_users: true,
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
      { header: 'Product Name', key: 'product_name', width: 25 },
      { header: 'Product Code', key: 'product_code', width: 15 },
      { header: 'From Location Name', key: 'from_location_name', width: 25 },
      { header: 'To Location Name', key: 'to_location_name', width: 25 },
      { header: 'Van Inventory User', key: 'van_inventory_user', width: 20 },
      {
        header: 'Van Inventory Status',
        key: 'van_inventory_status',
        width: 20,
      },
      {
        header: 'Van Inventory Items Count',
        key: 'van_inventory_items_count',
        width: 25,
      },
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
        product_name: data[index]?.stock_movements_products?.name || '',
        product_code: data[index]?.stock_movements_products?.code || '',
        from_location_name:
          data[index]?.stock_movements_from_location?.name || '',
        to_location_name: data[index]?.stock_movements_to_location?.name || '',
        van_inventory_user:
          data[index]?.van_inventory?.van_inventory_users?.name || '',
        van_inventory_status: data[index]?.van_inventory?.status || '',
        van_inventory_items_count:
          data[index]?.van_inventory?.van_inventory_items?.length || 0,
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
    summaryRow.getCell(1).value = `Total Stock Movements: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
