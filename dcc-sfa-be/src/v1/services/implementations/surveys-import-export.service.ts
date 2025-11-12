import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class SurveysImportExportService extends ImportExportService<any> {
  protected modelName = 'surveys' as const;
  protected displayName = 'Surveys';
  protected uniqueFields = ['title'];
  protected searchFields = ['title', 'description', 'category'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'title',
      header: 'Title',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (value.length > 255) return 'Title must be less than 255 characters';
        if (value.length < 2) return 'Title must be at least 2 characters';
        return true;
      },
      description: 'Survey title (required, 2-255 characters)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
      type: 'string',
      description: 'Survey description (optional)',
    },
    {
      key: 'category',
      header: 'Category',
      width: 20,
      required: true,
      type: 'string',
      validation: value => {
        const validCategories = [
          'cooler_inspection',
          'customer_feedback',
          'outlet_audit',
          'competitor_analysis',
          'brand_visibility',
          'general',
        ];
        if (!validCategories.includes(value)) {
          return `Category must be one of: ${validCategories.join(', ')}`;
        }
        return true;
      },
      description:
        'Survey category (required): cooler_inspection, customer_feedback, outlet_audit, competitor_analysis, brand_visibility, general',
    },
    {
      key: 'target_roles',
      header: 'Target Roles',
      width: 30,
      type: 'string',
      description: 'Target roles for the survey (optional)',
    },
    {
      key: 'expires_at',
      header: 'Expires At',
      width: 20,
      type: 'date',
      transform: value => (value ? new Date(value) : null),
      description: 'Expiry date (optional, format: YYYY-MM-DD)',
    },
    {
      key: 'is_active',
      header: 'Status',
      width: 10,
      required: true,
      type: 'string',
      validation: value => {
        if (value !== 'Y' && value !== 'N') {
          return 'Status must be Y or N';
        }
        return true;
      },
      transform: value => value || 'Y',
      description: 'Status (Y/N, default: Y)',
    },
  ];

  async getSampleData(): Promise<any[]> {
    return [
      {
        title: 'Monthly Cooler Inspection',
        description:
          'Comprehensive inspection of cooler units and refrigeration systems',
        category: 'cooler_inspection',
        target_roles: 'Sales Representative, Field Supervisor',
        expires_at: null,
        is_active: 'Y',
      },
      {
        title: 'Customer Satisfaction Survey',
        description:
          'Quarterly customer feedback collection for service improvement',
        category: 'customer_feedback',
        target_roles: 'Sales Representative',
        expires_at: '2024-12-31',
        is_active: 'Y',
      },
      {
        title: 'Outlet Compliance Audit',
        description:
          'Comprehensive audit of outlet compliance with brand standards',
        category: 'outlet_audit',
        target_roles: 'Field Supervisor, Area Manager',
        expires_at: null,
        is_active: 'Y',
      },
    ];
  }

  async transformDataForExport(data: any): Promise<any> {
    return {
      ...data,
      is_published: data.is_published ? 'Yes' : 'No',
      published_at: data.published_at
        ? new Date(data.published_at).toLocaleDateString()
        : '',
      expires_at: data.expires_at
        ? new Date(data.expires_at).toLocaleDateString()
        : '',
      response_count: data.response_count || 0,
    };
  }

  async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.surveys : prisma.surveys;
    const existing = await model.findFirst({
      where: {
        title: data.title,
      },
    });
    return existing ? `Survey with title "${data.title}" already exists` : null;
  }

  getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  async validateForeignKeys(data: any, tx?: any): Promise<string | null> {
    return null;
  }

  async prepareDataForImport(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    return this.transformDataForImport(data, userId);
  }

  async updateExisting(data: any, userId: number, tx?: any): Promise<any> {
    const model = tx ? tx.surveys : prisma.surveys;

    const existing = await model.findFirst({
      where: { title: data.title },
    });

    if (!existing) return null;

    return await model.update({
      where: { id: existing.id },
      data: {
        ...data,
        updatedate: new Date(),
        updatedby: userId,
      },
    });
  }

  async transformDataForImport(data: any, userId: number): Promise<any> {
    return {
      title: data.title,
      description: data.description || null,
      category: data.category,
      target_roles: data.target_roles || null,
      is_published: false,
      published_at: null,
      expires_at: data.expires_at || null,
      response_count: 0,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }
}
