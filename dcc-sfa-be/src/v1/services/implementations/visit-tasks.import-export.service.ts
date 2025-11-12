import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import { Prisma } from '@prisma/client';
import prisma from '../../../configs/prisma.client';

export class VisitTasksImportExportService extends ImportExportService<any> {
  protected modelName = 'visit_tasks' as const;
  protected displayName = 'Visit Tasks';
  protected uniqueFields = ['visit_id', 'task_type', 'description'];
  protected searchFields = ['task_type', 'description', 'status', 'priority'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'visit_id',
      header: 'Visit ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Visit ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Visit ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the visit this task belongs to (required)',
    },
    {
      key: 'task_type',
      header: 'Task Type',
      width: 20,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 50)
          return 'Task type must be less than 50 characters';
        const validTypes = [
          'follow_up',
          'collection',
          'delivery',
          'inspection',
          'maintenance',
          'survey',
          'complaint',
          'installation',
          'training',
          'other',
        ];
        return (
          validTypes.includes(value.toLowerCase()) ||
          `Task type should be one of: ${validTypes.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : null),
      description:
        'Type of task: follow_up, collection, delivery, inspection, maintenance, survey, complaint, installation, training, other (optional)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 40,
      type: 'string',
      validation: value =>
        !value ||
        value.length <= 1000 ||
        'Description must be less than 1000 characters',
      description:
        'Detailed description of the task (optional, max 1000 chars)',
    },
    {
      key: 'assigned_to',
      header: 'Assigned To (User ID)',
      width: 20,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Assigned to must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'ID of the user assigned to this task (optional)',
    },
    {
      key: 'due_date',
      header: 'Due Date',
      width: 15,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Due date for task completion (optional, YYYY-MM-DD)',
    },
    {
      key: 'completed_date',
      header: 'Completed Date',
      width: 18,
      type: 'date',
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Date when task was completed (optional, YYYY-MM-DD)',
    },
    {
      key: 'status',
      header: 'Status',
      width: 15,
      type: 'string',
      defaultValue: 'pending',
      validation: value => {
        if (!value) return true;
        const validStatuses = [
          'pending',
          'in_progress',
          'completed',
          'cancelled',
          'on_hold',
        ];
        return (
          validStatuses.includes(value.toLowerCase()) ||
          `Status must be one of: ${validStatuses.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'pending'),
      description:
        'Task status: pending, in_progress, completed, cancelled, on_hold (defaults to pending)',
    },
    {
      key: 'priority',
      header: 'Priority',
      width: 12,
      type: 'string',
      defaultValue: 'medium',
      validation: value => {
        if (!value) return true;
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        return (
          validPriorities.includes(value.toLowerCase()) ||
          `Priority must be one of: ${validPriorities.join(', ')}`
        );
      },
      transform: value => (value ? value.toLowerCase() : 'medium'),
      description:
        'Task priority: low, medium, high, urgent (defaults to medium)',
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
    // Fetch actual IDs from database to ensure validity
    const visits = await prisma.visits.findMany({
      take: 3,
      select: { id: true },
      orderBy: { id: 'asc' },
    });
    const users = await prisma.users.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const visitIds = visits.map(v => v.id);
    const userIds = users.map(u => u.id);

    const visitId1 = visitIds[0] || 1;
    const visitId2 = visitIds[1] || 2;
    const visitId3 = visitIds[2] || 3;
    const userId1 = userIds[0] || null;
    const userId2 = userIds[1] || null;
    const userId3 = userIds[2] || null;

    return [
      {
        visit_id: visitId1,
        task_type: 'follow_up',
        description: 'Follow up on customer order inquiry',
        assigned_to: userId1,
        due_date: '2024-02-01',
        completed_date: null,
        status: 'pending',
        priority: 'high',
        is_active: 'Y',
      },
      {
        visit_id: visitId2,
        task_type: 'collection',
        description: 'Collect outstanding payment from customer',
        assigned_to: userId2,
        due_date: '2024-01-25',
        completed_date: '2024-01-24',
        status: 'completed',
        priority: 'medium',
        is_active: 'Y',
      },
      {
        visit_id: visitId3,
        task_type: 'inspection',
        description: 'Inspect installed equipment and provide feedback',
        assigned_to: userId3,
        due_date: '2024-02-05',
        completed_date: null,
        status: 'in_progress',
        priority: 'high',
        is_active: 'Y',
      },
      {
        visit_id: visitId1,
        task_type: 'delivery',
        description: 'Deliver new product samples to customer',
        assigned_to: userId1,
        due_date: '2024-01-28',
        completed_date: null,
        status: 'pending',
        priority: 'low',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(task => ({
      visit_id: task.visit_id || '',
      visit_date: task.visit_tasks_visits?.visit_date
        ? new Date(task.visit_tasks_visits.visit_date)
            .toISOString()
            .split('T')[0]
        : '',
      customer_name: task.visit_tasks_visits?.visit_customers?.name || '',
      task_type: task.task_type || '',
      description: task.description || '',
      assigned_to: task.assigned_to || '',
      assigned_to_name: task.visit_tasks_users?.name || '',
      assigned_to_email: task.visit_tasks_users?.email || '',
      due_date: task.due_date
        ? new Date(task.due_date).toISOString().split('T')[0]
        : '',
      completed_date: task.completed_date
        ? new Date(task.completed_date).toISOString().split('T')[0]
        : '',
      status: task.status || '',
      priority: task.priority || '',
      is_active: task.is_active || 'Y',
      created_date: task.createdate
        ? new Date(task.createdate).toISOString().split('T')[0]
        : '',
      created_by: task.createdby || '',
      updated_date: task.updatedate
        ? new Date(task.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: task.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    // Visit tasks typically don't have unique constraints
    // Allow multiple tasks per visit
    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    // Validate visit exists
    if (data.visit_id) {
      try {
        const visit = await prismaClient.visits.findUnique({
          where: { id: data.visit_id },
        });
        if (!visit) {
          return `Visit with ID ${data.visit_id} does not exist`;
        }
      } catch (error) {
        return `Invalid Visit ID ${data.visit_id}`;
      }
    }

    // Validate assigned user exists (if provided)
    if (data.assigned_to) {
      try {
        const user = await prismaClient.users.findUnique({
          where: { id: data.assigned_to },
        });
        if (!user) {
          return `User with ID ${data.assigned_to} does not exist`;
        }
      } catch (error) {
        return `Invalid User ID ${data.assigned_to}`;
      }
    }

    // Validate date logic
    if (data.due_date && data.completed_date) {
      const dueDate = new Date(data.due_date);
      const completedDate = new Date(data.completed_date);

      if (completedDate < dueDate && data.status !== 'completed') {
        return 'Completed date should not be before due date for non-completed tasks';
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    return {
      visit_id: data.visit_id,
      task_type: data.task_type || null,
      description: data.description || null,
      assigned_to: data.assigned_to || null,
      due_date: data.due_date || null,
      completed_date: data.completed_date || null,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      is_active: data.is_active || 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };
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

    for (const [index, row] of data.entries()) {
      const rowNum = index + 2;

      try {
        // Validate outside transaction
        const duplicateCheck = await this.checkDuplicate(row);

        if (duplicateCheck) {
          if (options.skipDuplicates) {
            failed++;
            errors.push(`Row ${rowNum}: Skipped - ${duplicateCheck}`);
            continue;
          } else if (options.updateExisting) {
            const updated = await this.updateExisting(row, userId);
            if (updated) {
              importedData.push(updated);
              success++;
            }
            continue;
          } else {
            throw new Error(duplicateCheck);
          }
        }

        const fkValidation = await this.validateForeignKeys(row);
        if (fkValidation) {
          throw new Error(fkValidation);
        }

        // Create task
        const preparedData = await this.prepareDataForImport(row, userId);

        const created = await prisma.visit_tasks.create({
          data: preparedData,
        });

        importedData.push(created);
        success++;
      } catch (error: any) {
        failed++;
        const errorMessage = error.message || 'Unknown error';
        errors.push(`Row ${rowNum}: ${errorMessage}`);
        detailedErrors.push({
          row: rowNum,
          errors: [
            {
              type: errorMessage.includes('does not exist')
                ? 'foreign_key'
                : errorMessage.includes('already exists')
                  ? 'duplicate'
                  : 'validation',
              message: errorMessage,
              action: 'rejected',
            },
          ],
        });
      }
    }

    return {
      success,
      failed,
      errors,
      data: importedData,
      detailedErrors: detailedErrors.length > 0 ? detailedErrors : undefined,
    };
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    return null;
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { createdate: 'desc' },
      include: {
        visit_tasks_visits: {
          select: {
            visit_date: true,
            visit_customers: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        visit_tasks_users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await this.getModel().findMany(query);

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      { header: 'Task ID', key: 'id', width: 12 },
      ...this.columns,
      { header: 'Visit Date', key: 'visit_date', width: 15 },
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Assigned To Name', key: 'assigned_to_name', width: 25 },
      { header: 'Assigned To Email', key: 'assigned_to_email', width: 30 },
      { header: 'Created Date', key: 'created_date', width: 20 },
      { header: 'Created By', key: 'created_by', width: 15 },
      { header: 'Updated Date', key: 'updated_date', width: 20 },
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
    let totalTasks = 0;
    let activeTasks = 0;
    let inactiveTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;
    const statusCount: any = {};
    const priorityCount: any = {};
    const taskTypeCount: any = {};

    exportData.forEach((row: any, index: number) => {
      const task = data[index] as any;

      row.id = task.id;
      row.visit_date = task.visit_tasks_visits?.visit_date
        ? new Date(task.visit_tasks_visits.visit_date)
            .toISOString()
            .split('T')[0]
        : '';
      row.customer_name = task.visit_tasks_visits?.visit_customers?.name || '';
      row.assigned_to_name = task.visit_tasks_users?.name || '';
      row.assigned_to_email = task.visit_tasks_users?.email || '';

      totalTasks++;
      if (task.is_active === 'Y') activeTasks++;
      if (task.is_active === 'N') inactiveTasks++;
      if (task.status === 'completed') completedTasks++;
      if (task.status === 'pending') pendingTasks++;

      if (
        task.due_date &&
        new Date(task.due_date) < new Date() &&
        task.status !== 'completed' &&
        task.status !== 'cancelled'
      ) {
        overdueTasks++;
      }

      if (task.status) {
        statusCount[task.status] = (statusCount[task.status] || 0) + 1;
      }

      if (task.priority) {
        priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1;
      }

      if (task.task_type) {
        taskTypeCount[task.task_type] =
          (taskTypeCount[task.task_type] || 0) + 1;
      }

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

      const statusCell = excelRow.getCell('status');
      switch (task.status?.toLowerCase()) {
        case 'completed':
          statusCell.font = { color: { argb: 'FF008000' }, bold: true };
          break;
        case 'cancelled':
          statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
          break;
        case 'pending':
          statusCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
          break;
        case 'in_progress':
          statusCell.font = { color: { argb: 'FF0000FF' }, bold: true };
          break;
      }

      const priorityCell = excelRow.getCell('priority');
      switch (task.priority?.toLowerCase()) {
        case 'urgent':
          priorityCell.font = { color: { argb: 'FFFF0000' }, bold: true };
          break;
        case 'high':
          priorityCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
          break;
      }

      if (
        task.due_date &&
        new Date(task.due_date) < new Date() &&
        task.status !== 'completed' &&
        task.status !== 'cancelled'
      ) {
        excelRow.getCell('due_date').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }

      if (task.is_active === 'N') {
        excelRow.getCell('is_active').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }
    });

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 35 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    summarySheet.addRow({ metric: 'Total Tasks', value: totalTasks });
    summarySheet.addRow({ metric: 'Active Tasks', value: activeTasks });
    summarySheet.addRow({ metric: 'Inactive Tasks', value: inactiveTasks });
    summarySheet.addRow({ metric: 'Completed Tasks', value: completedTasks });
    summarySheet.addRow({ metric: 'Pending Tasks', value: pendingTasks });
    summarySheet.addRow({ metric: 'Overdue Tasks', value: overdueTasks });
    summarySheet.addRow({
      metric: 'Completion Rate',
      value:
        totalTasks > 0
          ? `${((completedTasks / totalTasks) * 100).toFixed(2)}%`
          : '0%',
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Status Breakdown', value: '' });
    Object.keys(statusCount).forEach(status => {
      summarySheet.addRow({
        metric: `  ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        value: statusCount[status],
      });
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Priority Breakdown', value: '' });
    Object.keys(priorityCount).forEach(priority => {
      summarySheet.addRow({
        metric: `  ${priority.charAt(0).toUpperCase() + priority.slice(1)}`,
        value: priorityCount[priority],
      });
    });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Task Type Breakdown', value: '' });
    Object.keys(taskTypeCount)
      .sort((a, b) => taskTypeCount[b] - taskTypeCount[a])
      .forEach(taskType => {
        summarySheet.addRow({
          metric: `  ${taskType.charAt(0).toUpperCase() + taskType.slice(1)}`,
          value: taskTypeCount[taskType],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
