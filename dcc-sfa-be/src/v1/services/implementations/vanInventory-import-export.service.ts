import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';
import prisma from '../../../configs/prisma.client';

export class VanInventoryImportExportService extends ImportExportService<any> {
  protected modelName = 'van_inventory' as const;
  protected displayName = 'Van Inventory';
  protected uniqueFields = ['id'];
  protected searchFields = ['user_id', 'status', 'loading_type'];

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
      key: 'status',
      header: 'Status',
      width: 12,
      type: 'string',
      defaultValue: 'A',
      validation: value => {
        const upperValue = value ? value.toString().toUpperCase() : 'A';
        return (
          ['D', 'A', 'C'].includes(upperValue) ||
          'Must be D (Draft), A (Confirmed), or C (Cancelled)'
        );
      },
      transform: value => (value ? value.toString().toUpperCase() : 'A'),
      description:
        'Status - D = Draft, A = Confirmed, C = Cancelled (defaults to A)',
    },
    {
      key: 'loading_type',
      header: 'Loading Type',
      width: 15,
      type: 'string',
      defaultValue: 'L',
      validation: value => {
        const upperValue = value ? value.toString().toUpperCase() : 'L';
        return (
          ['L', 'U'].includes(upperValue) || 'Must be L (Load) or U (Unload)'
        );
      },
      transform: value => (value ? value.toString().toUpperCase() : 'L'),
      description: 'Loading type - L = Load, U = Unload (defaults to L)',
    },
    {
      key: 'document_date',
      header: 'Document Date',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return true;
      },
      description: 'Document date (optional, YYYY-MM-DD format)',
    },
    {
      key: 'vehicle_id',
      header: 'Vehicle ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0)
          return 'Vehicle ID must be a positive number';
        return true;
      },
      description: 'ID of the vehicle (optional, positive integer)',
    },
    {
      key: 'location_type',
      header: 'Location Type',
      width: 15,
      type: 'string',
      defaultValue: 'van',
      validation: value => {
        if (!value) return true; // Optional field
        const validTypes = ['van', 'warehouse', 'depot', 'store'];
        return (
          validTypes.includes(value.toLowerCase()) || 'Invalid location type'
        );
      },
      transform: value => (value ? value.toString().toLowerCase() : 'van'),
      description: 'Location type (van, warehouse, depot, store)',
    },
    {
      key: 'location_id',
      header: 'Location ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0)
          return 'Location ID must be a positive number';
        return true;
      },
      description: 'ID of the location/depot (optional, positive integer)',
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
    // Van Inventory Items columns (for nested import/export)
    {
      key: 'items',
      header: 'Items (JSON)',
      width: 50,
      type: 'string',
      validation: value => {
        if (!value) return true; // Optional field
        try {
          const items = JSON.parse(value);
          if (!Array.isArray(items)) return 'Items must be a JSON array';
          return true;
        } catch {
          return 'Invalid JSON format for items';
        }
      },
      description:
        'JSON array of items: [{"product_id": 1, "quantity": 10, "batch_id": null, "serial_no_id": null, ...}]',
    },
  ];

  protected async getSampleData(): Promise<any[]> {
    // Fetch actual IDs from database to ensure validity
    const users = await prisma.users.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const products = await prisma.products.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const vehicles = await prisma.vehicles.findMany({
      take: 3,
      select: { id: true, vehicle_number: true },
      orderBy: { id: 'asc' },
    });
    const depots = await prisma.depots.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    const batches = await prisma.batch_lots.findMany({
      take: 3,
      select: { id: true, batch_number: true },
      orderBy: { id: 'asc' },
    });
    const serials = await prisma.serial_numbers.findMany({
      take: 3,
      select: { id: true, serial_number: true },
      orderBy: { id: 'asc' },
    });

    const userIds = users.map(u => u.id);
    const productIds = products.map(p => p.id);
    const vehicleIds = vehicles.map(v => v.id);
    const depotIds = depots.map(d => d.id);
    const batchIds = batches.map(b => b.id);
    const serialIds = serials.map(s => s.id);

    const userId1 = userIds[0] || 1;
    const userId2 = userIds[1] || 1;
    const userId3 = userIds[2] || 1;
    const productId1 = productIds[0] || 1;
    const productId2 = productIds[1] || 1;
    const productId3 = productIds[2] || 1;
    const vehicleId1 = vehicleIds[0] || 1;
    const vehicleId2 = vehicleIds[1] || 1;
    const vehicleId3 = vehicleIds[2] || 1;
    const depotId1 = depotIds[0] || 1;
    const depotId2 = depotIds[1] || 1;
    const depotId3 = depotIds[2] || 1;
    const batchId1 = batchIds[0] || null;
    const serialId1 = serialIds[0] || null;

    return [
      {
        user_id: userId1,
        status: 'A',
        loading_type: 'L',
        document_date: '2024-01-20',
        vehicle_id: vehicleId1,
        location_type: 'van',
        location_id: depotId1,
        is_active: 'Y',
        items: JSON.stringify([
          {
            product_id: productId1,
            quantity: 50,
            batch_id: batchId1,
            serial_no_id: null,
            unit_price: 100.0,
            discount_amount: 0,
            tax_amount: 0,
            total_amount: 5000.0,
          },
        ]),
      },
      {
        user_id: userId2,
        status: 'A',
        loading_type: 'U',
        document_date: '2024-01-21',
        vehicle_id: vehicleId2,
        location_type: 'van',
        is_active: 'Y',
        items: JSON.stringify([
          {
            product_id: productId2,
            quantity: 25,
            batch_id: null,
            serial_no_id: serialId1,
            unit_price: 200.0,
            discount_amount: 0,
            tax_amount: 0,
            total_amount: 5000.0,
          },
        ]),
      },
      {
        user_id: userId3,
        status: 'D',
        loading_type: 'L',
        document_date: '2024-01-22',
        vehicle_id: vehicleId3,
        location_type: 'van',
        is_active: 'Y',
        items: JSON.stringify([
          {
            product_id: productId3,
            quantity: 100,
            batch_id: null,
            serial_no_id: null,
            unit_price: 50.0,
            discount_amount: 0,
            tax_amount: 0,
            total_amount: 5000.0,
          },
        ]),
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(vanInventory => {
      const items = vanInventory.van_inventory_items_inventory || [];
      return {
        user_id: vanInventory.user_id,
        status: vanInventory.status || 'A',
        loading_type: vanInventory.loading_type || 'L',
        document_date:
          vanInventory.document_date?.toISOString().split('T')[0] || '',
        vehicle_id: vanInventory.vehicle_id || '',
        location_type: vanInventory.location_type || 'van',
        is_active: vanInventory.is_active || 'Y',
        items: JSON.stringify(
          items.map((item: any) => ({
            product_id: item.product_id,
            product_name: item.product_name || '',
            unit: item.unit || '',
            quantity: item.quantity || 0,
            unit_price: item.unit_price || 0,
            discount_amount: item.discount_amount || 0,
            tax_amount: item.tax_amount || 0,
            total_amount: item.total_amount || 0,
            notes: item.notes || '',
          }))
        ),
        created_date:
          vanInventory.createdate?.toISOString().split('T')[0] || '',
        created_by: vanInventory.createdby || '',
        updated_date:
          vanInventory.updatedate?.toISOString().split('T')[0] || '',
        updated_by: vanInventory.updatedby || '',
      };
    });
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    // Van inventory records are unique by ID only
    // Duplicate checking is not needed for this structure
    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const userModel = tx ? tx.users : prisma.users;
    const vehicleModel = tx ? tx.vehicles : prisma.vehicles;
    const locationModel = tx ? tx.depots : prisma.depots;
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

    // Validate vehicle exists (if provided)
    if (data.vehicle_id) {
      const vehicle = await vehicleModel.findUnique({
        where: { id: data.vehicle_id },
      });
      if (!vehicle) {
        return `Vehicle with ID ${data.vehicle_id} does not exist`;
      }
    }

    // Validate items if provided
    if (data.items) {
      let items: any[];
      try {
        items =
          typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
      } catch {
        return 'Invalid JSON format for items';
      }

      if (!Array.isArray(items)) {
        return 'Items must be a JSON array';
      }

      for (const item of items) {
        // Validate product exists
        if (item.product_id) {
          const product = await productModel.findUnique({
            where: { id: item.product_id },
          });
          if (!product) {
            return `Product with ID ${item.product_id} does not exist in items`;
          }
        }

        // Validate batch exists (if provided)
        if (item.batch_id) {
          const batch = await batchModel.findUnique({
            where: { id: item.batch_id },
          });
          if (!batch) {
            return `Batch with ID ${item.batch_id} does not exist in items`;
          }
        }

        // Validate serial number exists (if provided)
        if (item.serial_no_id) {
          const serial = await serialModel.findUnique({
            where: { id: item.serial_no_id },
          });
          if (!serial) {
            return `Serial number with ID ${item.serial_no_id} does not exist in items`;
          }
        }
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    // Parse items if provided as JSON string
    let items: any[] = [];
    if (data.items) {
      try {
        items =
          typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
      } catch {
        items = [];
      }
    }

    return {
      user_id: parseInt(data.user_id),
      status: (data.status || 'A').toUpperCase(),
      loading_type: (data.loading_type || 'L').toUpperCase(),
      document_date: data.document_date ? new Date(data.document_date) : null,
      vehicle_id: data.vehicle_id ? parseInt(data.vehicle_id) : null,
      location_type: data.location_type || 'van',
      is_active: (data.is_active || 'Y').toUpperCase(),
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
      items: items, // Store items separately for processing
    };
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    // Van inventory updates should be done by ID
    // This method is kept for consistency but returns null
    // Updates should be handled separately
    return null;
  }

  async importData(
    data: any[],
    userId: number,
    options: any = {}
  ): Promise<any> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const importedData: any[] = [];
    const detailedErrors: any[] = [];

    const results = await prisma.$transaction(
      async tx => {
        for (const [index, row] of data.entries()) {
          const rowNum = index + 2;
          const rowErrors: any = { row: rowNum, errors: [] };

          try {
            const duplicateCheck = await this.checkDuplicate(row, tx);
            if (
              duplicateCheck &&
              !options.skipDuplicates &&
              !options.updateExisting
            ) {
              failed++;
              rowErrors.errors.push({
                type: 'duplicate',
                message: duplicateCheck,
                action: 'rejected',
              });
              detailedErrors.push(rowErrors);
              errors.push(`Row ${rowNum}: ${duplicateCheck}`);
              continue;
            }

            const fkValidation = await this.validateForeignKeys(row, tx);
            if (fkValidation) {
              failed++;
              rowErrors.errors.push({
                type: 'foreign_key',
                message: fkValidation,
                action: 'rejected',
              });
              detailedErrors.push(rowErrors);
              errors.push(`Row ${rowNum}: ${fkValidation}`);
              continue;
            }

            const preparedData = await this.prepareDataForImport(row, userId);
            const items = preparedData.items || [];
            delete preparedData.items; // Remove items from main data

            // Create van_inventory record
            const created = await tx.van_inventory.create({
              data: preparedData,
              include: {
                van_inventory_users: true,
                vehicle: true,
              },
            });

            // Create van_inventory_items if provided
            if (items && items.length > 0) {
              for (const item of items) {
                // Validate product_id is required for items
                if (!item.product_id) {
                  throw new Error('product_id is required for each item');
                }

                await tx.van_inventory_items.create({
                  data: {
                    parent_id: created.id,
                    product_id: parseInt(item.product_id),
                    product_name: item.product_name || null,
                    unit: item.unit || null,
                    quantity: parseInt(item.quantity) || 1,
                    unit_price: parseFloat(item.unit_price) || 0,
                    discount_amount: item.discount_amount
                      ? parseFloat(item.discount_amount)
                      : 0,
                    tax_amount: item.tax_amount
                      ? parseFloat(item.tax_amount)
                      : 0,
                    total_amount: item.total_amount
                      ? parseFloat(item.total_amount)
                      : 0,
                    notes: item.notes || null,
                  },
                });
              }
            }

            // Fetch the complete record with items
            const completeRecord = await tx.van_inventory.findUnique({
              where: { id: created.id },
              include: {
                van_inventory_users: true,
                vehicle: true,
                van_inventory_items_inventory: {
                  include: {
                    van_inventory_items_products: true,
                  },
                },
              },
            });

            importedData.push(completeRecord);
            success++;
          } catch (error: any) {
            failed++;
            rowErrors.errors.push({
              type: 'system',
              message: error.message,
              action: 'failed',
            });
            detailedErrors.push(rowErrors);
            errors.push(`Row ${rowNum}: ${error.message}`);
          }
        }

        return {
          success,
          failed,
          errors,
          data: importedData,
          detailedErrors:
            detailedErrors.length > 0 ? detailedErrors : undefined,
        };
      },
      { timeout: 300000 }
    );

    return results;
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        van_inventory_users: {
          select: { id: true, name: true, email: true },
        },
        vehicle: {
          select: { id: true, vehicle_number: true, type: true },
        },
        van_inventory_items_inventory: {
          include: {
            van_inventory_items_products: {
              select: { id: true, name: true, code: true },
            },
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
      { header: 'User Name', key: 'user_name', width: 20 },
      { header: 'Vehicle Number', key: 'vehicle_number', width: 20 },
      { header: 'Location Name', key: 'location_name', width: 20 },
      { header: 'Items Count', key: 'items_count', width: 15 },
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
        vehicle_number: data[index]?.vehicle?.vehicle_number || '',
        items_count: data[index]?.van_inventory_items_inventory?.length || 0,
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
