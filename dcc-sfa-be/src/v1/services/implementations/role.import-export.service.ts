import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';

export class RoleImportExportService extends ImportExportService<any> {
  protected modelName = 'roles' as const;
  protected displayName = 'Roles';
  protected uniqueFields = ['name', 'role_key'];
  protected searchFields = ['name', 'description', 'role_key'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Name',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Role name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name must be less than 100 characters';
        return true;
      },
      transform: value => value.toString().trim(),
      description: 'Role name (required, unique, 2-100 characters)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 50,
      required: false,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 500)
          return 'Description must be less than 500 characters';
        return true;
      },
      description: 'Role description (optional, max 500 characters)',
    },
    {
      key: 'level',
      header: 'Level',
      width: 12,
      required: false,
      type: 'number',
      defaultValue: 1,
      validation: value => {
        if (!value) return true;
        const level = parseInt(value);
        if (isNaN(level) || level <= 0)
          return 'Level must be a positive number';
        if (level > 10) return 'Level must be between 1 and 10';
        return true;
      },
      transform: value => (value ? parseInt(value) : 1),
      description: 'Role hierarchy level (optional, 1-10, defaults to 1)',
    },
    {
      key: 'role_key',
      header: 'Role Key',
      width: 30,
      required: false,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 100)
          return 'Role key must be less than 100 characters';
        const keyRegex = /^[a-z0-9_]+$/;
        if (!keyRegex.test(value))
          return 'Role key must contain only lowercase letters, numbers, and underscores';
        return true;
      },
      transform: value =>
        value ? value.toString().toLowerCase().trim() : null,
      description:
        'Unique identifier (optional, auto-generated from name if not provided, lowercase with underscores)',
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
        name: 'Sales Manager',
        description: 'Manages sales team and operations',
        level: 2,
        role_key: 'sales_manager',
        is_active: 'Y',
      },
      {
        name: 'Warehouse Supervisor',
        description: 'Supervises warehouse operations',
        level: 3,
        role_key: 'warehouse_supervisor',
        is_active: 'Y',
      },
      {
        name: 'Field Executive',
        description: 'Field sales and customer service',
        level: 4,
        role_key: 'field_executive',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(role => ({
      id: role.id || '',
      name: role.name || '',
      description: role.description || '',
      level: role.level || 1,
      role_key: role.role_key || '',
      is_active: role.is_active || 'Y',
      permissions_count: role.roles_permission?.length || 0,
      users_count: role.user_role?.length || 0,
      created_date: role.createdate
        ? new Date(role.createdate).toISOString().split('T')[0]
        : '',
      created_by: role.createdby || '',
      updated_date: role.updatedate
        ? new Date(role.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: role.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.roles : prisma.roles;

    if (data.name) {
      const existingByName = await model.findFirst({
        where: {
          name: data.name.trim(),
          is_active: 'Y',
        },
      });

      if (existingByName) {
        return `Role with name "${data.name}" already exists`;
      }
    }

    const roleKey = data.role_key || data.name.toLowerCase().replace(/ /g, '_');
    const existingByKey = await model.findFirst({
      where: {
        role_key: roleKey,
        is_active: 'Y',
      },
    });

    if (existingByKey) {
      return `Role with key "${roleKey}" already exists`;
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    const roleKey = data.role_key || data.name.toLowerCase().replace(/ /g, '_');

    return {
      name: data.name.trim(),
      description: data.description || null,
      level: data.level || 1,
      role_key: roleKey,
      is_active: data.is_active || 'Y',
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
    const model = tx ? tx.roles : prisma.roles;

    const existing = await model.findFirst({
      where: {
        name: data.name.trim(),
      },
    });

    if (!existing) return null;

    const updateData: any = {
      description:
        data.description !== undefined
          ? data.description
          : existing.description,
      level: data.level !== undefined ? data.level : existing.level,
      is_active: data.is_active || existing.is_active,
      updatedby: userId,
      updatedate: new Date(),
    };

    if (data.role_key && data.role_key !== existing.role_key) {
      const keyExists = await model.findFirst({
        where: {
          role_key: data.role_key,
          id: { not: existing.id },
        },
      });

      if (!keyExists) {
        updateData.role_key = data.role_key;
      }
    }

    return await model.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  async exportToExcel(options: any = {}): Promise<Buffer> {
    const query: any = {
      where: options.filters,
      orderBy: options.orderBy || { createdate: 'desc' },
      include: {
        roles_permission: {
          where: { is_active: 'Y' },
          include: {
            permissions: {
              select: {
                id: true,
                name: true,
                module: true,
                action: true,
              },
            },
          },
        },
        user_role: {
          where: { is_active: 'Y' },
          select: {
            id: true,
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
      { header: 'Role ID', key: 'id', width: 10 },
      ...this.columns,
      { header: 'Permissions Count', key: 'permissions_count', width: 18 },
      { header: 'Users Count', key: 'users_count', width: 15 },
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
    let totalRoles = 0;
    let activeRoles = 0;
    let inactiveRoles = 0;
    const rolesByLevel: any = {};
    let totalPermissions = 0;
    let totalUsers = 0;

    exportData.forEach((row: any, index: number) => {
      const role = data[index] as any;

      row.id = role.id;
      row.permissions_count = role.roles_permission?.length || 0;
      row.users_count = role.user_role?.length || 0;

      totalRoles++;
      if (role.is_active === 'Y') activeRoles++;
      if (role.is_active === 'N') inactiveRoles++;

      const level = role.level || 1;
      rolesByLevel[level] = (rolesByLevel[level] || 0) + 1;

      totalPermissions += role.roles_permission?.length || 0;
      totalUsers += role.user_role?.length || 0;

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

      if (role.is_active === 'N') {
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

    summarySheet.addRow({ metric: 'Total Roles', value: totalRoles });
    summarySheet.addRow({ metric: 'Active Roles', value: activeRoles });
    summarySheet.addRow({ metric: 'Inactive Roles', value: inactiveRoles });
    summarySheet.addRow({
      metric: 'Total Permissions Assigned',
      value: totalPermissions,
    });
    summarySheet.addRow({ metric: 'Total Users', value: totalUsers });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Roles by Level', value: '' });
    Object.keys(rolesByLevel)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(level => {
        summarySheet.addRow({
          metric: `  Level ${level}`,
          value: rolesByLevel[level],
        });
      });

    if (data.some((role: any) => role.roles_permission?.length > 0)) {
      const permissionsSheet = workbook.addWorksheet('Role Permissions');
      permissionsSheet.columns = [
        { header: 'Role ID', key: 'role_id', width: 10 },
        { header: 'Role Name', key: 'role_name', width: 30 },
        { header: 'Permission ID', key: 'permission_id', width: 15 },
        { header: 'Permission Name', key: 'permission_name', width: 30 },
        { header: 'Module', key: 'module', width: 20 },
        { header: 'Action', key: 'action', width: 15 },
      ];

      const permHeaderRow = permissionsSheet.getRow(1);
      permHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      permHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      data.forEach((role: any) => {
        if (role.roles_permission && role.roles_permission.length > 0) {
          role.roles_permission.forEach((rp: any) => {
            permissionsSheet.addRow({
              role_id: role.id,
              role_name: role.name,
              permission_id: rp.permissions?.id || '',
              permission_name: rp.permissions?.name || '',
              module: rp.permissions?.module || '',
              action: rp.permissions?.action || '',
            });
          });
        }
      });
    }

    if (data.some((role: any) => role.user_role?.length > 0)) {
      const usersSheet = workbook.addWorksheet('Role Users');
      usersSheet.columns = [
        { header: 'Role ID', key: 'role_id', width: 10 },
        { header: 'Role Name', key: 'role_name', width: 30 },
        { header: 'User ID', key: 'user_id', width: 10 },
        { header: 'User Name', key: 'user_name', width: 30 },
        { header: 'User Email', key: 'user_email', width: 35 },
      ];

      const userHeaderRow = usersSheet.getRow(1);
      userHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      userHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      data.forEach((role: any) => {
        if (role.user_role && role.user_role.length > 0) {
          role.user_role.forEach((user: any) => {
            usersSheet.addRow({
              role_id: role.id,
              role_name: role.name,
              user_id: user.id,
              user_name: user.name,
              user_email: user.email,
            });
          });
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
