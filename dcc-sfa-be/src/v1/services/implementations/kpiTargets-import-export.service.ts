import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class KpiTargetsImportExportService extends ImportExportService<any> {
  protected modelName = 'employee_kpi_targets' as const;
  protected displayName = 'KPI Targets';
  protected uniqueFields = ['employee_id', 'kpi_name', 'period_start'];
  protected searchFields = ['kpi_name', 'measure_unit', 'target_value'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'employee_id',
      header: 'Employee ID',
      width: 15,
      required: true,
      type: 'number',
      transform: value => parseInt(value),
      description: 'ID of the employee (required)',
    },
    {
      key: 'kpi_name',
      header: 'KPI Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value || value.length < 2)
          return 'KPI name is required (min 2 characters)';
        if (value.length > 100)
          return 'KPI name must be less than 100 characters';
        return true;
      },
      transform: value => value.trim(),
      description: 'Name of the KPI (required, max 100 chars)',
    },
    {
      key: 'target_value',
      header: 'Target Value',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Target value is required';
        const num = parseFloat(value);
        if (isNaN(num)) return 'Target value must be a valid number';
        if (num < 0) return 'Target value must be non-negative';
        return true;
      },
      transform: value => parseFloat(value),
      description: 'Target value for the KPI (required, non-negative)',
    },
    {
      key: 'measure_unit',
      header: 'Measure Unit',
      width: 15,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 50 ||
        'Measure unit must be less than 50 characters',
      transform: value => (value ? value.trim() : null),
      description: 'Unit of measurement (optional, max 50 chars)',
    },
    {
      key: 'period_start',
      header: 'Period Start',
      width: 15,
      required: true,
      type: 'date',
      validation: value => {
        if (!value) return 'Period start date is required';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Period start must be a valid date';
        return true;
      },
      transform: value => new Date(value),
      description:
        'Start date of the KPI period (required, format: YYYY-MM-DD)',
    },
    {
      key: 'period_end',
      header: 'Period End',
      width: 15,
      required: true,
      type: 'date',
      validation: value => {
        if (!value) return 'Period end date is required';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Period end must be a valid date';
        return true;
      },
      transform: value => new Date(value),
      description: 'End date of the KPI period (required, format: YYYY-MM-DD)',
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
        employee_id: 1,
        kpi_name: 'Sales Target',
        target_value: 100000.0,
        measure_unit: 'USD',
        period_start: '2024-01-01',
        period_end: '2024-03-31',
        is_active: 'Y',
      },
      {
        employee_id: 2,
        kpi_name: 'Customer Visits',
        target_value: 50.0,
        measure_unit: 'visits',
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        is_active: 'Y',
      },
      {
        employee_id: 1,
        kpi_name: 'Revenue Growth',
        target_value: 15.0,
        measure_unit: '%',
        period_start: '2024-04-01',
        period_end: '2024-06-30',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(kpiTarget => ({
      employee_id: kpiTarget.employee_id,
      employee_name:
        kpiTarget.users_employee_kpi_targets_employee_idTousers?.name || '',
      employee_email:
        kpiTarget.users_employee_kpi_targets_employee_idTousers?.email || '',
      kpi_name: kpiTarget.kpi_name,
      target_value: kpiTarget.target_value.toString(),
      measure_unit: kpiTarget.measure_unit || '',
      period_start: kpiTarget.period_start.toISOString().split('T')[0],
      period_end: kpiTarget.period_end.toISOString().split('T')[0],
      is_active: kpiTarget.is_active || 'Y',
      created_date: kpiTarget.createdate?.toISOString().split('T')[0] || '',
      created_by: kpiTarget.createdby || '',
      updated_date: kpiTarget.updatedate?.toISOString().split('T')[0] || '',
      updated_by: kpiTarget.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.employee_kpi_targets : prisma.employee_kpi_targets;

    // Check for overlapping periods for the same employee and KPI
    const existingTarget = await model.findFirst({
      where: {
        employee_id: data.employee_id,
        kpi_name: data.kpi_name,
        is_active: 'Y',
        OR: [
          {
            period_start: {
              lte: data.period_end,
            },
            period_end: {
              gte: data.period_start,
            },
          },
        ],
      },
    });

    if (existingTarget) {
      return `KPI target for employee ${data.employee_id} and KPI "${data.kpi_name}" already exists for overlapping period`;
    }

    return null;
  }

  protected async transformDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      employee_id: data.employee_id,
      kpi_name: data.kpi_name,
      target_value: data.target_value,
      measure_unit: data.measure_unit || null,
      period_start: data.period_start,
      period_end: data.period_end,
      is_active: data.is_active || 'Y',
      createdate: new Date(),
      createdby: userId,
      log_inst: 1,
    };
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    // Check if employee exists
    const employee = await prismaClient.users.findUnique({
      where: { id: data.employee_id },
    });
    if (!employee) {
      return `Employee with ID ${data.employee_id} does not exist`;
    }

    // Validate period dates
    if (data.period_end <= data.period_start) {
      return 'Period end date must be after period start date';
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return this.transformDataForImport(data, userId);
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.employee_kpi_targets : prisma.employee_kpi_targets;

    // Find existing record based on unique fields
    const existing = await model.findFirst({
      where: {
        employee_id: data.employee_id,
        kpi_name: data.kpi_name,
        period_start: data.period_start,
      },
    });

    if (!existing) return null;

    const updateData = {
      ...data,
      updatedby: userId,
      updatedate: new Date(),
    };

    return await model.update({
      where: { id: existing.id },
      data: updateData,
    });
  }
}
