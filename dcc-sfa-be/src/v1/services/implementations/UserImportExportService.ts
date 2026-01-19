import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';
import bcrypt from 'bcrypt';

export class UserImportExportService extends ImportExportService<any> {
  protected modelName = 'users' as const;
  protected displayName = 'Users';
  protected uniqueFields = ['email', 'employee_id'];
  protected searchFields = ['name', 'email', 'employee_id', 'phone_number'];

  protected columns: ColumnDefinition[] = [
    {
      key: 'email',
      header: 'Email',
      width: 30,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Invalid email format';
        return true;
      },
      transform: value => value.toString().toLowerCase().trim(),
      description: 'User email address (required, must be unique and valid)',
    },
    {
      key: 'name',
      header: 'Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name must be less than 100 characters';
        return true;
      },
      description: 'Full name of the user (required, 2-100 characters)',
    },
    {
      key: 'password',
      header: 'Password',
      width: 20,
      required: false,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length < 6) return 'Password must be at least 6 characters';
        return true;
      },
      description:
        'User password (optional, defaults to "Welcome@123", min 6 chars)',
    },
    {
      key: 'role_id',
      header: 'Role ID',
      width: 12,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Role ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Role ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'ID of the user role (required, must exist in roles table)',
    },
    {
      key: 'employee_id',
      header: 'Employee ID',
      width: 18,
      required: false,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 50)
          return 'Employee ID must be less than 50 characters';
        return true;
      },
      description:
        'Employee identification number (optional, must be unique if provided)',
    },
    {
      key: 'phone_number',
      header: 'Phone Number',
      width: 18,
      required: false,
      type: 'string',
      validation: value => {
        if (!value) return true;
        const phoneStr = String(value);
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        if (!phoneRegex.test(phoneStr.replace(/[\s-]/g, ''))) {
          return 'Invalid phone number format (7-15 digits)';
        }
        return true;
      },
      transform: value => (value ? String(value) : null),
      description: 'Contact phone number (optional, 7-15 digits)',
    },
    {
      key: 'parent_id',
      header: 'Company ID',
      width: 15,
      required: false,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Company ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'Company/Parent organization ID (optional)',
    },
    {
      key: 'depot_id',
      header: 'Depot ID',
      width: 12,
      required: false,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Depot ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'Depot/Branch ID (optional, must exist in depots table)',
    },
    {
      key: 'zone_id',
      header: 'Zone ID',
      width: 12,
      required: false,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Zone ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'Zone/Region ID (optional)',
    },
    {
      key: 'reporting_to',
      header: 'Reporting To (User ID)',
      width: 20,
      required: false,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Reporting To must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description:
        'Manager/Supervisor User ID (optional, must exist in users table)',
    },
    {
      key: 'joining_date',
      header: 'Joining Date',
      width: 18,
      type: 'date',
      required: false,
      validation: value => {
        if (!value) return true;
        if (isNaN(Date.parse(value)))
          return 'Invalid date format (use YYYY-MM-DD)';
        return true;
      },
      transform: value => (value ? new Date(value) : null),
      description: 'Date of joining (optional, YYYY-MM-DD format)',
    },
    {
      key: 'address',
      header: 'Address',
      width: 40,
      type: 'string',
      required: false,
      validation: value =>
        !value ||
        value.length <= 500 ||
        'Address must be less than 500 characters',
      description: 'User residential address (optional, max 500 chars)',
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
    const roles = await prisma.roles.findMany({
      take: 3,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
      where: { is_active: 'Y' },
    });

    const depots = await prisma.depots.findMany({
      take: 2,
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
      where: { is_active: 'Y' },
    });

    const companies = await prisma.companies.findMany({
      take: 1,
      select: { id: true },
      orderBy: { id: 'asc' },
      where: { is_active: 'Y' },
    });

    const managers = await prisma.users.findMany({
      take: 1,
      select: { id: true },
      orderBy: { id: 'asc' },
      where: { is_active: 'Y' },
    });

    const roleId1 = roles[0]?.id;
    const roleId2 = roles[1]?.id || roles[0]?.id;
    const roleId3 = roles[2]?.id || roles[0]?.id;
    const depotId1 = depots[0]?.id;
    const depotId2 = depots[1]?.id || depots[0]?.id;
    const companyId = companies[0]?.id;
    const managerId = managers[0]?.id;

    if (!roleId1) {
      console.warn('  No active roles found. Cannot generate sample data.');
      return [];
    }

    return [
      {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: 'Welcome@123',
        role_id: roleId1,
        employee_id: 'EMP001',
        phone_number: '+919876543210',
        parent_id: companyId || '',
        depot_id: depotId1 || '',
        zone_id: '',
        reporting_to: managerId || '',
        joining_date: '2024-01-15',
        address: '123 Main Street, City',
        is_active: 'Y',
      },
      {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        password: 'Welcome@123',
        role_id: roleId2,
        employee_id: 'EMP002',
        phone_number: '+919876543211',
        parent_id: companyId || '',
        depot_id: depotId2 || '',
        zone_id: '',
        reporting_to: managerId || '',
        joining_date: '2024-02-01',
        address: '456 Park Avenue, City',
        is_active: 'Y',
      },
    ];
  }

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(user => ({
      id: user.id || '',
      email: user.email || '',
      name: user.name || '',
      role_id: user.role_id || '',
      role_name: user.user_role?.name || '',
      employee_id: user.employee_id || '',
      phone_number: user.phone_number || '',
      parent_id: user.parent_id || '',
      company_name: user.companies?.name || '',
      depot_id: user.depot_id || '',
      depot_name: user.user_depot?.name || '',
      zone_id: user.zone_id || '',
      reporting_to: user.reporting_to || '',
      reporting_manager_name: user.users?.name || '',
      reporting_manager_email: user.users?.email || '',
      joining_date: user.joining_date
        ? new Date(user.joining_date).toISOString().split('T')[0]
        : '',
      address: user.address || '',
      profile_image: user.profile_image || '',
      last_login: user.last_login
        ? new Date(user.last_login).toISOString()
        : '',
      is_active: user.is_active || 'Y',
      created_date: user.createdate
        ? new Date(user.createdate).toISOString().split('T')[0]
        : '',
      created_by: user.createdby || '',
      updated_date: user.updatedate
        ? new Date(user.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: user.updatedby || '',
    }));
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.users : prisma.users;

    if (data.email) {
      const existingByEmail = await model.findFirst({
        where: {
          email: data.email.toLowerCase().trim(),
          is_active: 'Y',
        },
      });

      if (existingByEmail) {
        return `User with email "${data.email}" already exists`;
      }
    }

    if (data.employee_id) {
      const existingByEmployeeId = await model.findFirst({
        where: {
          employee_id: data.employee_id,
          is_active: 'Y',
        },
      });

      if (existingByEmployeeId) {
        return `User with Employee ID "${data.employee_id}" already exists`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.role_id) {
      try {
        const role = await prismaClient.roles.findUnique({
          where: { id: data.role_id },
        });

        if (!role) {
          const availableRoles = await prismaClient.roles.findMany({
            where: {
              OR: [{ isactive: 'Y' }, { is_active: 'Y' }],
            },
            select: { id: true, name: true },
            take: 10,
            orderBy: { id: 'asc' },
          });

          if (availableRoles.length === 0) {
            return `No active roles found in the system. Please create roles first.`;
          }

          const rolesList = availableRoles
            .map((r: { id: number; name: string }) => `${r.id} (${r.name})`)
            .join(', ');
          return `Role ID ${data.role_id} does not exist. Available role IDs: ${rolesList}`;
        }

        const isActive = (role as any).isactive || (role as any).is_active;
        if (isActive !== 'Y') {
          return `Role with ID ${data.role_id} is inactive`;
        }
      } catch (error) {
        return `Invalid Role ID ${data.role_id}`;
      }
    }

    if (data.depot_id) {
      try {
        const depot = await prismaClient.depots.findUnique({
          where: { id: data.depot_id },
        });
        if (!depot) {
          return `Depot with ID ${data.depot_id} does not exist`;
        }
        const isActive = (depot as any).isactive || (depot as any).is_active;
        if (isActive !== 'Y') {
          return `Depot with ID ${data.depot_id} is inactive`;
        }
      } catch (error) {
        return `Invalid Depot ID ${data.depot_id}`;
      }
    }

    if (data.parent_id) {
      try {
        const company = await prismaClient.companies.findUnique({
          where: { id: data.parent_id },
        });
        if (!company) {
          return `Company with ID ${data.parent_id} does not exist`;
        }
        const isActive =
          (company as any).isactive || (company as any).is_active;
        if (isActive !== 'Y') {
          return `Company with ID ${data.parent_id} is inactive`;
        }
      } catch (error) {
        return `Invalid Company ID ${data.parent_id}`;
      }
    }

    if (data.reporting_to) {
      try {
        const manager = await prismaClient.users.findUnique({
          where: { id: data.reporting_to },
        });
        if (!manager) {
          return `Reporting Manager with ID ${data.reporting_to} does not exist`;
        }
        const isActive =
          (manager as any).is_active || (manager as any).isactive;
        if (isActive !== 'Y') {
          return `Reporting Manager with ID ${data.reporting_to} is inactive`;
        }
      } catch (error) {
        return `Invalid Reporting Manager ID ${data.reporting_to}`;
      }
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number
  ): Promise<any> {
    const password = data.password || 'Welcome@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    return {
      email: data.email.toLowerCase().trim(),
      password_hash: hashedPassword,
      name: data.name,
      role_id: data.role_id,
      parent_id: data.parent_id || null,
      depot_id: data.depot_id || null,
      zone_id: data.zone_id || null,
      phone_number: data.phone_number || null,
      address: data.address || null,
      employee_id: data.employee_id || null,
      joining_date: data.joining_date || null,
      reporting_to: data.reporting_to || null,
      profile_image: null,
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
    const model = tx ? tx.users : prisma.users;

    const existing = await model.findFirst({
      where: {
        email: data.email.toLowerCase().trim(),
      },
    });

    if (!existing) return null;

    const updateData: any = {
      name: data.name || existing.name,
      role_id: data.role_id || existing.role_id,
      parent_id:
        data.parent_id !== undefined ? data.parent_id : existing.parent_id,
      depot_id: data.depot_id !== undefined ? data.depot_id : existing.depot_id,
      zone_id: data.zone_id !== undefined ? data.zone_id : existing.zone_id,
      phone_number:
        data.phone_number !== undefined
          ? data.phone_number
          : existing.phone_number,
      address: data.address !== undefined ? data.address : existing.address,
      employee_id:
        data.employee_id !== undefined
          ? data.employee_id
          : existing.employee_id,
      joining_date:
        data.joining_date !== undefined
          ? data.joining_date
          : existing.joining_date,
      reporting_to:
        data.reporting_to !== undefined
          ? data.reporting_to
          : existing.reporting_to,
      is_active: data.is_active || existing.is_active,
      updatedby: userId,
      updatedate: new Date(),
    };

    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
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
        user_role: {
          select: {
            name: true,
            description: true,
          },
        },
        companies: {
          select: {
            name: true,
            code: true,
          },
        },
        user_depot: {
          select: {
            name: true,
            code: true,
          },
        },
        users: {
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
      { header: 'User ID', key: 'id', width: 10 },
      ...this.columns,
      { header: 'Role Name', key: 'role_name', width: 20 },
      { header: 'Company Name', key: 'company_name', width: 25 },
      { header: 'Depot Name', key: 'depot_name', width: 25 },
      {
        header: 'Reporting Manager Name',
        key: 'reporting_manager_name',
        width: 25,
      },
      {
        header: 'Reporting Manager Email',
        key: 'reporting_manager_email',
        width: 30,
      },
      { header: 'Profile Image', key: 'profile_image', width: 40 },
      { header: 'Last Login', key: 'last_login', width: 20 },
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
    let totalUsers = 0;
    let activeUsers = 0;
    let inactiveUsers = 0;
    const usersByRole: any = {};
    const usersByDepot: any = {};

    exportData.forEach((row: any, index: number) => {
      const user = data[index] as any;

      row.id = user.id;
      row.role_name = user.user_role?.name || '';
      row.company_name = user.companies?.name || '';
      row.depot_name = user.user_depot?.name || '';
      row.reporting_manager_name = user.users?.name || '';
      row.reporting_manager_email = user.users?.email || '';

      totalUsers++;
      if (user.is_active === 'Y') activeUsers++;
      if (user.is_active === 'N') inactiveUsers++;

      const roleName = user.user_role?.name || 'Unknown';
      usersByRole[roleName] = (usersByRole[roleName] || 0) + 1;

      const depotName = user.user_depot?.name || 'Unassigned';
      usersByDepot[depotName] = (usersByDepot[depotName] || 0) + 1;

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

      if (user.is_active === 'N') {
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

    summarySheet.addRow({ metric: 'Total Users', value: totalUsers });
    summarySheet.addRow({ metric: 'Active Users', value: activeUsers });
    summarySheet.addRow({ metric: 'Inactive Users', value: inactiveUsers });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Users by Role', value: '' });
    Object.keys(usersByRole)
      .sort((a, b) => usersByRole[b] - usersByRole[a])
      .forEach(role => {
        summarySheet.addRow({
          metric: `  ${role}`,
          value: usersByRole[role],
        });
      });
    summarySheet.addRow({ metric: '', value: '' });

    summarySheet.addRow({ metric: 'Users by Depot', value: '' });
    Object.keys(usersByDepot)
      .sort((a, b) => usersByDepot[b] - usersByDepot[a])
      .slice(0, 10)
      .forEach(depot => {
        summarySheet.addRow({
          metric: `  ${depot}`,
          value: usersByDepot[depot],
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
