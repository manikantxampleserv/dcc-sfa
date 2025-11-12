import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class CompetitorActivityImportExportService extends ImportExportService<any> {
  protected modelName = 'competitor_activity' as const;
  protected displayName = 'Competitor Activities';
  protected uniqueFields = ['customer_id', 'brand_name', 'product_name'];
  protected searchFields = [
    'brand_name',
    'product_name',
    'promotion_details',
    'remarks',
  ];

  protected columns: ColumnDefinition[] = [
    {
      key: 'customer_id',
      header: 'Customer ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0)
          return 'Customer ID must be a positive number';
        return true;
      },
      description: 'ID of the customer (required)',
    },
    {
      key: 'visit_id',
      header: 'Visit ID',
      width: 15,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = parseInt(value);
        if (isNaN(num) || num <= 0) return 'Visit ID must be a positive number';
        return true;
      },
      description: 'ID of the visit (optional)',
    },
    {
      key: 'brand_name',
      header: 'Brand Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'Brand name must be at least 2 characters';
        if (value.length > 255)
          return 'Brand name must be less than 255 characters';
        return true;
      },
      description: 'Name of the competitor brand (required, 2-255 characters)',
    },
    {
      key: 'product_name',
      header: 'Product Name',
      width: 30,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 255 ||
        'Product name must be less than 255 characters',
      description: 'Name of the product (optional, max 255 chars)',
    },
    {
      key: 'observed_price',
      header: 'Observed Price',
      width: 18,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = parseFloat(value);
        if (isNaN(num) || num < 0)
          return 'Observed price must be a positive number';
        return true;
      },
      description: 'Price observed for the product (optional, positive number)',
    },
    {
      key: 'promotion_details',
      header: 'Promotion Details',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Promotion details must be less than 1000 characters',
      description: 'Details about promotions (optional, max 1000 chars)',
    },
    {
      key: 'visibility_score',
      header: 'Visibility Score',
      width: 18,
      type: 'number',
      validation: value => {
        if (!value) return true; // Optional field
        const num = parseInt(value);
        if (isNaN(num) || num < 0 || num > 100)
          return 'Visibility score must be between 0 and 100';
        return true;
      },
      description: 'Visibility score from 0-100 (optional)',
    },
    {
      key: 'image_url',
      header: 'Image URL',
      width: 35,
      type: 'string',
      validation: value => {
        if (!value) return true; // Optional field
        if (value.length > 500)
          return 'Image URL must be less than 500 characters';
        try {
          new URL(value);
          return true;
        } catch {
          return 'Image URL must be a valid URL';
        }
      },
      description: 'URL of the product image (optional, valid URL)',
    },
    {
      key: 'remarks',
      header: 'Remarks',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Remarks must be less than 1000 characters',
      description: 'Additional remarks (optional, max 1000 chars)',
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
    // Get actual customer and visit IDs from database
    const customers = await prisma.customers.findMany({
      where: { is_active: 'Y' },
      take: 3,
      select: { id: true, name: true },
    });

    const visits = await prisma.visits.findMany({
      where: { status: 'completed' },
      take: 3,
      select: { id: true, purpose: true },
    });

    return [
      {
        customer_id: customers[0]?.id || 1,
        visit_id: visits[0]?.id || null,
        brand_name: 'Coca-Cola',
        product_name: 'Coca-Cola Classic 500ml',
        observed_price: 2.5,
        promotion_details: 'Buy 2 Get 1 Free',
        visibility_score: 85,
        image_url: 'https://example.com/coke-image.jpg',
        remarks: 'High visibility, good promotion',
        is_active: 'Y',
      },
      {
        customer_id: customers[1]?.id || 2,
        visit_id: visits[1]?.id || null,
        brand_name: 'Pepsi',
        product_name: 'Pepsi Cola 500ml',
        observed_price: 2.3,
        promotion_details: '20% off this week',
        visibility_score: 70,
        image_url: '',
        remarks: 'Competitive pricing',
        is_active: 'Y',
      },
      {
        customer_id: customers[2]?.id || 3,
        visit_id: visits[2]?.id || null,
        brand_name: 'Nestle',
        product_name: 'KitKat 4-finger',
        observed_price: 1.8,
        promotion_details: 'Bulk discount available',
        visibility_score: 60,
        image_url: '',
        remarks: 'Standard positioning',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(activity => ({
      customer_id: activity.customer_id,
      visit_id: activity.visit_id || '',
      brand_name: activity.brand_name,
      product_name: activity.product_name || '',
      observed_price: activity.observed_price || '',
      promotion_details: activity.promotion_details || '',
      visibility_score: activity.visibility_score || '',
      image_url: activity.image_url || '',
      remarks: activity.remarks || '',
      is_active: activity.is_active || 'Y',
      created_date: activity.createdate?.toISOString().split('T')[0] || '',
      created_by: activity.createdby || '',
      updated_date: activity.updatedate?.toISOString().split('T')[0] || '',
      updated_by: activity.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.competitor_activity : prisma.competitor_activity;

    const existing = await model.findFirst({
      where: {
        customer_id: data.customer_id,
        brand_name: data.brand_name,
        product_name: data.product_name,
      },
    });

    if (existing) {
      return `Competitor activity already exists for customer ${data.customer_id}, brand ${data.brand_name}, and product ${data.product_name}`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const model = tx ? tx : prisma;

    // Check if customer exists
    const customer = await model.customers.findUnique({
      where: { id: data.customer_id },
    });

    if (!customer) {
      return `Customer with ID ${data.customer_id} does not exist`;
    }

    // Check if visit exists (if provided)
    if (data.visit_id) {
      const visit = await model.visits.findUnique({
        where: { id: data.visit_id },
      });

      if (!visit) {
        return `Visit with ID ${data.visit_id} does not exist`;
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
    const model = tx ? tx.competitor_activity : prisma.competitor_activity;

    const existing = await model.findFirst({
      where: {
        customer_id: data.customer_id,
        brand_name: data.brand_name,
        product_name: data.product_name,
      },
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

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { id: 'desc' },
      include: {
        competitor_activity_customers: {
          select: { id: true, name: true, code: true },
        },
        visits: {
          select: { id: true, visit_date: true, purpose: true },
        },
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const workbook = new (await import('exceljs')).Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
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
      const excelRow = worksheet.addRow(row);

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
    summaryRow.getCell(1).value = `Total Competitor Activities: ${data.length}`;
    summaryRow.getCell(1).font = { bold: true };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
