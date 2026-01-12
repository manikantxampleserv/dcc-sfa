// import { ImportExportService } from '../base/import-export.service';
// import { ColumnDefinition } from '../../../types/import-export.types';
// import prisma from '../../../configs/prisma.client';

// export class RouteImportExportService extends ImportExportService<any> {
//   protected modelName = 'routes' as const;
//   protected displayName = 'Routes';
//   protected uniqueFields = ['code'];
//   protected searchFields = ['name', 'code', 'description'];

//   protected columns: ColumnDefinition[] = [
//     {
//       key: 'name',
//       header: 'Route Name',
//       width: 25,
//       required: true,
//       type: 'string',
//       validation: value => {
//         if (!value) return 'Route name is required';
//         if (value.length < 2) return 'Name must be at least 2 characters';
//         if (value.length > 255) return 'Name must be less than 255 characters';
//         return true;
//       },
//       description: 'Route name (required, 2-255 characters)',
//     },
//     {
//       key: 'code',
//       header: 'Route Code',
//       width: 15,
//       required: false,
//       type: 'string',
//       validation: value => {
//         if (!value) return true;
//         if (value.length > 50) return 'Code must be less than 50 characters';
//         return true;
//       },
//       description:
//         'Route code (optional, auto-generated if empty, max 50 chars)',
//     },
//     {
//       key: 'parent_id',
//       header: 'Zone ID (Parent ID)',
//       width: 15,
//       required: true,
//       type: 'number',
//       validation: value => {
//         if (!value) return 'Zone ID is required';
//         const id = parseInt(value);
//         if (isNaN(id) || id <= 0) return 'Zone ID must be a positive number';
//         return true;
//       },
//       transform: value => parseInt(value),
//       description: 'Zone/Parent organization ID (required, must exist)',
//     },
//     {
//       key: 'depot_id',
//       header: 'Depot ID',
//       width: 12,
//       required: true,
//       type: 'number',
//       validation: value => {
//         if (!value) return 'Depot ID is required';
//         const id = parseInt(value);
//         if (isNaN(id) || id <= 0) return 'Depot ID must be a positive number';
//         return true;
//       },
//       transform: value => parseInt(value),
//       description: 'Depot ID (required, must exist in depots table)',
//     },
//     {
//       key: 'route_type_id',
//       header: 'Route Type ID',
//       width: 15,
//       required: true,
//       type: 'number',
//       validation: value => {
//         if (!value) return 'Route Type ID is required';
//         const id = parseInt(value);
//         if (isNaN(id) || id <= 0)
//           return 'Route Type ID must be a positive number';
//         return true;
//       },
//       transform: value => parseInt(value),
//       description: 'Route type ID (required, must exist in route_type table)',
//     },
//     {
//       key: 'salesperson_id',
//       header: 'Salesperson ID',
//       width: 15,
//       required: false,
//       type: 'number',
//       validation: value => {
//         if (!value) return true;
//         const id = parseInt(value);
//         if (isNaN(id) || id <= 0)
//           return 'Salesperson ID must be a positive number';
//         return true;
//       },
//       transform: value => (value ? parseInt(value) : null),
//       description: 'Salesperson/User ID (optional, must exist in users table)',
//     },
//     {
//       key: 'description',
//       header: 'Description',
//       width: 30,
//       required: false,
//       type: 'string',
//       validation: value =>
//         !value || value.length <= 500 || 'Max 500 characters',
//       description: 'Route description (optional, max 500 chars)',
//     },
//     {
//       key: 'start_location',
//       header: 'Start Location',
//       width: 25,
//       required: false,
//       type: 'string',
//       validation: value =>
//         !value || value.length <= 255 || 'Max 255 characters',
//       description: 'Route start location (optional)',
//     },
//     {
//       key: 'end_location',
//       header: 'End Location',
//       width: 25,
//       required: false,
//       type: 'string',
//       validation: value =>
//         !value || value.length <= 255 || 'Max 255 characters',
//       description: 'Route end location (optional)',
//     },
//     {
//       key: 'estimated_distance',
//       header: 'Est. Distance (km)',
//       width: 15,
//       required: false,
//       type: 'number',
//       validation: value => {
//         if (!value) return true;
//         const num = parseFloat(value);
//         if (isNaN(num) || num < 0) return 'Must be a positive number';
//         return true;
//       },
//       transform: value => (value ? parseFloat(value) : null),
//       description: 'Estimated distance in km (optional, decimal)',
//     },
//     {
//       key: 'estimated_time',
//       header: 'Est. Time (mins)',
//       width: 15,
//       required: false,
//       type: 'number',
//       validation: value => {
//         if (!value) return true;
//         const num = parseInt(value);
//         if (isNaN(num) || num < 0) return 'Must be a positive number';
//         return true;
//       },
//       transform: value => (value ? parseInt(value) : null),
//       description: 'Estimated time in minutes (optional)',
//     },
//     {
//       key: 'outlet_group',
//       header: 'Outlet Group',
//       width: 20,
//       required: false,
//       type: 'string',
//       description: 'Outlet group classification (optional)',
//     },
//     {
//       key: 'route_type',
//       header: 'Route Type Name',
//       width: 20,
//       required: false,
//       type: 'string',
//       description: 'Route type name (optional, for reference)',
//     },
//     {
//       key: 'is_active',
//       header: 'Is Active',
//       width: 12,
//       type: 'string',
//       defaultValue: 'Y',
//       validation: value => {
//         const upperValue = value ? value.toString().toUpperCase() : 'Y';
//         return ['Y', 'N'].includes(upperValue) || 'Must be Y or N';
//       },
//       transform: value => (value ? value.toString().toUpperCase() : 'Y'),
//       description: 'Active status - Y for Yes, N for No (defaults to Y)',
//     },
//   ];

//   protected getColumnDescription(key: string): string {
//     const column = this.columns.find(col => col.key === key);
//     return column?.description || '';
//   }
//   protected async getSampleData(): Promise<any[]> {
//     const zones = await prisma.zones.findMany({
//       take: 2,
//       select: { id: true, name: true },
//       where: { is_active: 'Y' },
//     });

//     const depots = await prisma.depots.findMany({
//       take: 2,
//       select: { id: true, name: true },
//       where: { is_active: 'Y' },
//     });

//     const routeTypes = await prisma.route_type.findMany({
//       take: 2,
//       select: { id: true, name: true },
//       where: { is_active: 'Y' },
//     });

//     const salespersons = await prisma.users.findMany({
//       take: 1,
//       select: { id: true, name: true },
//       where: { is_active: 'Y' },
//     });

//     const zoneId1 = zones[0]?.id;
//     const depotId1 = depots[0]?.id;
//     const routeTypeId1 = routeTypes[0]?.id;
//     const salespersonId = salespersons[0]?.id;

//     if (!zoneId1 || !depotId1 || !routeTypeId1) {
//       console.warn(' Missing required data for route sample. Cannot generate.');
//       return [];
//     }

//     return [
//       {
//         name: 'Morning City Route',
//         code: '',
//         parent_id: zoneId1,
//         depot_id: depotId1,
//         route_type_id: routeTypeId1,
//         salesperson_id: salespersonId || '',
//         description: 'Daily morning delivery route covering city center',
//         start_location: 'Depot A, Main Street',
//         end_location: 'City Center Plaza',
//         estimated_distance: '25.5',
//         estimated_time: 120,
//         outlet_group: 'Retail',
//         route_type: 'Daily',
//         is_active: 'Y',
//       },
//       {
//         name: 'Evening Suburban Route',
//         code: '',
//         parent_id: zoneId1,
//         depot_id: depots[1]?.id || depotId1,
//         route_type_id: routeTypes[1]?.id || routeTypeId1,
//         salesperson_id: '',
//         description: 'Evening route for suburban retail outlets',
//         start_location: 'Depot B',
//         end_location: 'Suburban Mall',
//         estimated_distance: '35.2',
//         estimated_time: 150,
//         outlet_group: 'Wholesale',
//         route_type: 'Evening',
//         is_active: 'Y',
//       },
//     ];
//   }

//   protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
//     const model = tx ? tx.routes : prisma.routes;

//     if (data.code) {
//       const existingByCode = await model.findFirst({
//         where: {
//           code: data.code,
//           is_active: 'Y',
//         },
//       });

//       if (existingByCode) {
//         return `Route with code "${data.code}" already exists`;
//       }
//     }

//     return null;
//   }

//   protected async validateForeignKeys(
//     data: any,
//     tx?: any
//   ): Promise<string | null> {
//     const prismaClient = tx || prisma;

//     if (data.parent_id) {
//       const zone = await prismaClient.zones.findUnique({
//         where: { id: data.parent_id },
//       });
//       if (!zone) return `Zone with ID ${data.parent_id} does not exist`;
//       const isActive = zone.is_active || (zone as any).isactive;
//       if (isActive !== 'Y') return `Zone with ID ${data.parent_id} is inactive`;
//     }

//     if (data.depot_id) {
//       const depot = await prismaClient.depots.findUnique({
//         where: { id: data.depot_id },
//       });
//       if (!depot) return `Depot with ID ${data.depot_id} does not exist`;
//       const isActive = depot.is_active || (depot as any).isactive;
//       if (isActive !== 'Y') return `Depot with ID ${data.depot_id} is inactive`;
//     }

//     if (data.route_type_id) {
//       const routeType = await prismaClient.route_type.findUnique({
//         where: { id: data.route_type_id },
//       });
//       if (!routeType)
//         return `Route Type with ID ${data.route_type_id} does not exist`;
//       const isActive = routeType.is_active || (routeType as any).isactive;
//       if (isActive !== 'Y')
//         return `Route Type with ID ${data.route_type_id} is inactive`;
//     }

//     if (data.salesperson_id) {
//       const salesperson = await prismaClient.users.findUnique({
//         where: { id: data.salesperson_id },
//       });
//       if (!salesperson)
//         return `Salesperson with ID ${data.salesperson_id} does not exist`;
//       const isActive = salesperson.is_active || (salesperson as any).isactive;
//       if (isActive !== 'Y')
//         return `Salesperson with ID ${data.salesperson_id} is inactive`;
//     }

//     return null;
//   }

//   protected async prepareDataForImport(
//     data: any,
//     userId: number
//   ): Promise<any> {
//     return {
//       name: data.name,
//       code: data.code,
//       description: data.description || null,
//       route_type: data.route_type || null,
//       outlet_group: data.outlet_group || null,
//       start_location: data.start_location || null,
//       end_location: data.end_location || null,
//       estimated_distance: data.estimated_distance || null,
//       estimated_time: data.estimated_time || null,

//       parent_id: data.parent_id,
//       depot_id: data.depot_id,
//       route_type_id: data.route_type_id,
//       salesperson_id: data.salesperson_id || null,

//       routes_zones: { connect: { id: data.parent_id } },
//       routes_depots: { connect: { id: data.depot_id } },
//       routes_route_type: { connect: { id: data.route_type_id } },

//       ...(data.salesperson_id && {
//         routes_salesperson: { connect: { id: data.salesperson_id } },
//       }),

//       is_active: data.is_active || 'Y',
//       createdby: userId,
//       createdate: new Date(),
//       log_inst: 1,
//     };
//   }

//   protected async transformDataForExport(data: any[]): Promise<any[]> {
//     return data.map(route => ({
//       id: route.id || '',
//       code: route.code || '',
//       name: route.name || '',
//       parent_id: route.parent_id || '',
//       zone_name: route.routes_zones?.name || '',
//       depot_id: route.depot_id || '',
//       depot_name: route.routes_depots?.name || '',
//       route_type_id: route.route_type_id || '',
//       route_type_name: route.routes_route_type?.name || '',
//       salesperson_id: route.salesperson_id || '',
//       salesperson_name: route.routes_salesperson?.name || '',
//       description: route.description || '',
//       start_location: route.start_location || '',
//       end_location: route.end_location || '',
//       estimated_distance: route.estimated_distance || '',
//       estimated_time: route.estimated_time || '',
//       outlet_group: route.outlet_group || '',
//       is_active: route.is_active || 'Y',
//       created_date: route.createdate
//         ? new Date(route.createdate).toISOString().split('T')[0]
//         : '',
//       created_by: route.createdby || '',
//       updated_date: route.updatedate
//         ? new Date(route.updatedate).toISOString().split('T')[0]
//         : '',
//       updated_by: route.updatedby || '',
//     }));
//   }

//   protected async updateExisting(
//     data: any,
//     userId: number,
//     tx?: any
//   ): Promise<any> {
//     const model = tx ? tx.routes : prisma.routes;

//     const existing = await model.findFirst({
//       where: { code: data.code },
//     });

//     if (!existing) return null;

//     const updateData: any = {
//       name: data.name || existing.name,
//       description:
//         data.description !== undefined
//           ? data.description
//           : existing.description,
//       route_type:
//         data.route_type !== undefined ? data.route_type : existing.route_type,
//       outlet_group:
//         data.outlet_group !== undefined
//           ? data.outlet_group
//           : existing.outlet_group,
//       start_location:
//         data.start_location !== undefined
//           ? data.start_location
//           : existing.start_location,
//       end_location:
//         data.end_location !== undefined
//           ? data.end_location
//           : existing.end_location,
//       estimated_distance:
//         data.estimated_distance !== undefined
//           ? data.estimated_distance
//           : existing.estimated_distance,
//       estimated_time:
//         data.estimated_time !== undefined
//           ? data.estimated_time
//           : existing.estimated_time,
//       parent_id:
//         data.parent_id !== undefined ? data.parent_id : existing.parent_id,
//       depot_id: data.depot_id !== undefined ? data.depot_id : existing.depot_id,
//       route_type_id:
//         data.route_type_id !== undefined
//           ? data.route_type_id
//           : existing.route_type_id,
//       salesperson_id:
//         data.salesperson_id !== undefined
//           ? data.salesperson_id
//           : existing.salesperson_id,
//       is_active: data.is_active || existing.is_active,
//       updatedby: userId,
//       updatedate: new Date(),
//     };

//     return await model.update({
//       where: { id: existing.id },
//       data: updateData,
//     });
//   }

//   async exportToExcel(options: any = {}): Promise<Buffer> {
//     const query: any = {
//       where: options.filters,
//       orderBy: options.orderBy || { createdate: 'desc' },
//       include: {
//         routes_zones: { select: { name: true } },
//         routes_depots: { select: { name: true } },
//         routes_route_type: { select: { name: true } },
//         routes_salesperson: { select: { name: true, email: true } },
//       },
//     };

//     if (options.limit) query.take = options.limit;

//     const data = await prisma.routes.findMany(query);

//     const ExcelJS = await import('exceljs');
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet(this.displayName);

//     const exportColumns = [
//       { header: 'Route ID', key: 'id', width: 10 },
//       ...this.columns,
//       { header: 'Zone Name', key: 'zone_name', width: 20 },
//       { header: 'Depot Name', key: 'depot_name', width: 20 },
//       { header: 'Route Type Name', key: 'route_type_name', width: 20 },
//       { header: 'Salesperson Name', key: 'salesperson_name', width: 20 },
//       { header: 'Created Date', key: 'created_date', width: 15 },
//       { header: 'Created By', key: 'created_by', width: 12 },
//       { header: 'Updated Date', key: 'updated_date', width: 15 },
//       { header: 'Updated By', key: 'updated_by', width: 12 },
//     ];

//     worksheet.columns = exportColumns.map(col => ({
//       header: col.header,
//       key: col.key,
//       width: col.width || 20,
//     }));

//     const headerRow = worksheet.getRow(1);
//     headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     headerRow.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FF4472C4' },
//     };
//     headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
//     headerRow.height = 25;

//     const exportData = await this.transformDataForExport(data);
//     let totalRoutes = 0;
//     let activeRoutes = 0;

//     exportData.forEach((row: any, index: number) => {
//       const route = data[index];
//       totalRoutes++;
//       if (route.is_active === 'Y') activeRoutes++;

//       const excelRow = worksheet.addRow(row);

//       if (index % 2 === 0) {
//         excelRow.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'FFF2F2F2' },
//         };
//       }

//       excelRow.eachCell((cell: any) => {
//         cell.border = {
//           top: { style: 'thin' },
//           left: { style: 'thin' },
//           bottom: { style: 'thin' },
//           right: { style: 'thin' },
//         };
//       });

//       if (route.is_active === 'N') {
//         excelRow.getCell('is_active').font = {
//           color: { argb: 'FFFF0000' },
//           bold: true,
//         };
//       }
//     });

//     worksheet.views = [{ state: 'frozen', ySplit: 1 }];

//     const summarySheet = workbook.addWorksheet('Summary');
//     summarySheet.columns = [
//       { header: 'Metric', key: 'metric', width: 25 },
//       { header: 'Value', key: 'value', width: 15 },
//     ];

//     const summaryHeader = summarySheet.getRow(1);
//     summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     summaryHeader.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FF4472C4' },
//     };

//     summarySheet.addRow({ metric: 'Total Routes', value: totalRoutes });
//     summarySheet.addRow({ metric: 'Active Routes', value: activeRoutes });
//     summarySheet.addRow({
//       metric: 'Inactive Routes',
//       value: totalRoutes - activeRoutes,
//     });

//     const buffer = await workbook.xlsx.writeBuffer();
//     return Buffer.from(buffer);
//   }
// }

import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
import prisma from '../../../configs/prisma.client';
import { routes } from '@prisma/client';

export class RouteImportExportService extends ImportExportService<routes> {
  protected modelName = 'routes' as const;
  protected displayName = 'Routes';
  protected uniqueFields = ['code'];
  protected searchFields = ['name', 'code', 'description'];

  private async generateRoutesCode(
    name: string,
    useGlobalPrisma: boolean = false
  ): Promise<string> {
    const prefix = name.slice(0, 3).toUpperCase();

    try {
      const routes = await prisma.routes.findMany({
        where: {
          code: {
            startsWith: prefix,
          },
        },
        select: { code: true },
        orderBy: { id: 'desc' },
        take: 1,
      });

      let newNumber = 1;
      if (routes.length > 0 && routes[0].code) {
        const match = routes[0].code.match(/(\d+)$/);
        if (match) {
          newNumber = parseInt(match[1], 10) + 1;
        }
      }

      const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
      return code;
    } catch (error) {
      const timestamp = Date.now().toString().slice(-3);
      return `${prefix}${timestamp}`;
    }
  }

  protected columns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Route Name',
      width: 25,
      required: true,
      type: 'string',
      validation: value => {
        if (!value) return 'Route name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 255) return 'Name must be less than 255 characters';
        return true;
      },
      description: 'Route name (required, 2-255 characters)',
    },
    {
      key: 'code',
      header: 'Route Code',
      width: 15,
      required: false,
      type: 'string',
      validation: value => {
        if (!value) return true;
        if (value.length > 50) return 'Code must be less than 50 characters';
        return true;
      },
      description:
        'Route code (optional, auto-generated if empty, max 50 chars)',
    },
    {
      key: 'parent_id',
      header: 'Zone ID (Parent ID)',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Zone ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Zone ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'Zone/Parent organization ID (required, must exist)',
    },
    {
      key: 'depot_id',
      header: 'Depot ID',
      width: 12,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Depot ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0) return 'Depot ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'Depot ID (required, must exist in depots table)',
    },
    {
      key: 'route_type_id',
      header: 'Route Type ID',
      width: 15,
      required: true,
      type: 'number',
      validation: value => {
        if (!value) return 'Route Type ID is required';
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Route Type ID must be a positive number';
        return true;
      },
      transform: value => parseInt(value),
      description: 'Route type ID (required, must exist in route_type table)',
    },
    {
      key: 'salesperson_id',
      header: 'Salesperson ID',
      width: 15,
      required: false,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const id = parseInt(value);
        if (isNaN(id) || id <= 0)
          return 'Salesperson ID must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'Salesperson/User ID (optional, must exist in users table)',
    },
    {
      key: 'description',
      header: 'Description',
      width: 30,
      required: false,
      type: 'string',
      validation: value =>
        !value || value.length <= 500 || 'Max 500 characters',
      description: 'Route description (optional, max 500 chars)',
    },
    {
      key: 'start_location',
      header: 'Start Location',
      width: 25,
      required: false,
      type: 'string',
      validation: value =>
        !value || value.length <= 255 || 'Max 255 characters',
      description: 'Route start location (optional)',
    },
    {
      key: 'end_location',
      header: 'End Location',
      width: 25,
      required: false,
      type: 'string',
      validation: value =>
        !value || value.length <= 255 || 'Max 255 characters',
      description: 'Route end location (optional)',
    },
    {
      key: 'estimated_distance',
      header: 'Est. Distance (km)',
      width: 15,
      required: false,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) return 'Must be a positive number';
        return true;
      },
      transform: value => (value ? parseFloat(value) : null),
      description: 'Estimated distance in km (optional, decimal)',
    },
    {
      key: 'estimated_time',
      header: 'Est. Time (mins)',
      width: 15,
      required: false,
      type: 'number',
      validation: value => {
        if (!value) return true;
        const num = parseInt(value);
        if (isNaN(num) || num < 0) return 'Must be a positive number';
        return true;
      },
      transform: value => (value ? parseInt(value) : null),
      description: 'Estimated time in minutes (optional)',
    },
    {
      key: 'outlet_group',
      header: 'Outlet Group',
      width: 20,
      required: false,
      type: 'string',
      description: 'Outlet group classification (optional)',
    },
    {
      key: 'route_type',
      header: 'Route Type Name',
      width: 20,
      required: false,
      type: 'string',
      description: 'Route type name (optional, for reference)',
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

  protected getColumnDescription(key: string): string {
    const column = this.columns.find(col => col.key === key);
    return column?.description || '';
  }

  protected async getSampleData(): Promise<any[]> {
    const zones = await prisma.zones.findMany({
      take: 2,
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const depots = await prisma.depots.findMany({
      take: 2,
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const routeTypes = await prisma.route_type.findMany({
      take: 2,
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const salespersons = await prisma.users.findMany({
      take: 1,
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const zoneId1 = zones[0]?.id;
    const depotId1 = depots[0]?.id;
    const routeTypeId1 = routeTypes[0]?.id;
    const salespersonId = salespersons[0]?.id;

    if (!zoneId1 || !depotId1 || !routeTypeId1) {
      console.warn(
        '⚠️ Missing required data for route sample. Cannot generate.'
      );
      return [];
    }

    return [
      {
        name: 'Morning City Route',
        code: '',
        parent_id: zoneId1,
        depot_id: depotId1,
        route_type_id: routeTypeId1,
        salesperson_id: salespersonId || '',
        description: 'Daily morning delivery route covering city center',
        start_location: 'Depot A, Main Street',
        end_location: 'City Center Plaza',
        estimated_distance: '25.5',
        estimated_time: 120,
        outlet_group: 'Retail',
        route_type: 'Daily',
        is_active: 'Y',
      },
      {
        name: 'Evening Suburban Route',
        code: '',
        parent_id: zoneId1,
        depot_id: depots[1]?.id || depotId1,
        route_type_id: routeTypes[1]?.id || routeTypeId1,
        salesperson_id: '',
        description: 'Evening route for suburban retail outlets',
        start_location: 'Depot B',
        end_location: 'Suburban Mall',
        estimated_distance: '35.2',
        estimated_time: 150,
        outlet_group: 'Wholesale',
        route_type: 'Evening',
        is_active: 'Y',
      },
    ];
  }

  protected async checkDuplicate(data: any, tx?: any): Promise<string | null> {
    const model = tx ? tx.routes : prisma.routes;

    if (data.code) {
      const existingByCode = await model.findFirst({
        where: {
          code: data.code,
          is_active: 'Y',
        },
      });

      if (existingByCode) {
        return `Route with code "${data.code}" already exists`;
      }
    }

    return null;
  }

  protected async validateForeignKeys(
    data: any,
    tx?: any
  ): Promise<string | null> {
    const prismaClient = tx || prisma;

    if (data.parent_id) {
      const zone = await prismaClient.zones.findUnique({
        where: { id: data.parent_id },
      });
      if (!zone) return `Zone with ID ${data.parent_id} does not exist`;
      const isActive = zone.is_active || (zone as any).isactive;
      if (isActive !== 'Y') return `Zone with ID ${data.parent_id} is inactive`;
    }

    if (data.depot_id) {
      const depot = await prismaClient.depots.findUnique({
        where: { id: data.depot_id },
      });
      if (!depot) return `Depot with ID ${data.depot_id} does not exist`;
      const isActive = depot.is_active || (depot as any).isactive;
      if (isActive !== 'Y') return `Depot with ID ${data.depot_id} is inactive`;
    }

    if (data.route_type_id) {
      const routeType = await prismaClient.route_type.findUnique({
        where: { id: data.route_type_id },
      });
      if (!routeType)
        return `Route Type with ID ${data.route_type_id} does not exist`;
      const isActive = routeType.is_active || (routeType as any).isactive;
      if (isActive !== 'Y')
        return `Route Type with ID ${data.route_type_id} is inactive`;
    }

    if (data.salesperson_id) {
      const salesperson = await prismaClient.users.findUnique({
        where: { id: data.salesperson_id },
      });
      if (!salesperson)
        return `Salesperson with ID ${data.salesperson_id} does not exist`;
      const isActive = salesperson.is_active || (salesperson as any).isactive;
      if (isActive !== 'Y')
        return `Salesperson with ID ${data.salesperson_id} is inactive`;
    }

    return null;
  }

  protected async prepareDataForImport(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    let routeCode = data.code;
    if (!routeCode || routeCode.trim() === '') {
      routeCode = await this.generateRoutesCode(data.name, true);
    }

    const preparedData: any = {
      name: data.name,
      code: routeCode,
      description: data.description || null,
      route_type: data.route_type || null,
      outlet_group: data.outlet_group || null,
      start_location: data.start_location || null,
      end_location: data.end_location || null,
      estimated_distance: data.estimated_distance || null,
      estimated_time: data.estimated_time || null,
      parent_id: data.parent_id,
      depot_id: data.depot_id,
      route_type_id: data.route_type_id,
      is_active: data.is_active || 'Y',
      createdby: userId,
      createdate: new Date(),
      log_inst: 1,
    };

    if (data.salesperson_id) {
      preparedData.salesperson_id = data.salesperson_id;
    }

    return preparedData;
  }

  protected async transformDataForExport(data: any[]): Promise<any[]> {
    return data.map(route => ({
      id: route.id || '',
      code: route.code || '',
      name: route.name || '',
      parent_id: route.parent_id || '',
      zone_name: route.routes_zones?.name || '',
      depot_id: route.depot_id || '',
      depot_name: route.routes_depots?.name || '',
      route_type_id: route.route_type_id || '',
      route_type_name: route.routes_route_type?.name || '',
      salesperson_id: route.salesperson_id || '',
      salesperson_name: route.routes_salesperson?.name || '',
      description: route.description || '',
      start_location: route.start_location || '',
      end_location: route.end_location || '',
      estimated_distance: route.estimated_distance || '',
      estimated_time: route.estimated_time || '',
      outlet_group: route.outlet_group || '',
      is_active: route.is_active || 'Y',
      created_date: route.createdate
        ? new Date(route.createdate).toISOString().split('T')[0]
        : '',
      created_by: route.createdby || '',
      updated_date: route.updatedate
        ? new Date(route.updatedate).toISOString().split('T')[0]
        : '',
      updated_by: route.updatedby || '',
    }));
  }

  protected async updateExisting(
    data: any,
    userId: number,
    tx?: any
  ): Promise<any> {
    const model = tx ? tx.routes : prisma.routes;

    const existing = await model.findFirst({
      where: { code: data.code },
    });

    if (!existing) return null;

    const updateData: any = {
      name: data.name || existing.name,
      description:
        data.description !== undefined
          ? data.description
          : existing.description,
      route_type:
        data.route_type !== undefined ? data.route_type : existing.route_type,
      outlet_group:
        data.outlet_group !== undefined
          ? data.outlet_group
          : existing.outlet_group,
      start_location:
        data.start_location !== undefined
          ? data.start_location
          : existing.start_location,
      end_location:
        data.end_location !== undefined
          ? data.end_location
          : existing.end_location,
      estimated_distance:
        data.estimated_distance !== undefined
          ? data.estimated_distance
          : existing.estimated_distance,
      estimated_time:
        data.estimated_time !== undefined
          ? data.estimated_time
          : existing.estimated_time,
      parent_id:
        data.parent_id !== undefined ? data.parent_id : existing.parent_id,
      depot_id: data.depot_id !== undefined ? data.depot_id : existing.depot_id,
      route_type_id:
        data.route_type_id !== undefined
          ? data.route_type_id
          : existing.route_type_id,
      salesperson_id:
        data.salesperson_id !== undefined
          ? data.salesperson_id
          : existing.salesperson_id,
      is_active: data.is_active || existing.is_active,
      updatedby: userId,
      updatedate: new Date(),
    };

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
        routes_zones: { select: { name: true } },
        routes_depots: { select: { name: true } },
        routes_route_type: { select: { name: true } },
        routes_salesperson: { select: { name: true, email: true } },
      },
    };

    if (options.limit) query.take = options.limit;

    const data = await prisma.routes.findMany(query);

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      { header: 'Route ID', key: 'id', width: 10 },
      ...this.columns,
      { header: 'Zone Name', key: 'zone_name', width: 20 },
      { header: 'Depot Name', key: 'depot_name', width: 20 },
      { header: 'Route Type Name', key: 'route_type_name', width: 20 },
      { header: 'Salesperson Name', key: 'salesperson_name', width: 20 },
      { header: 'Created Date', key: 'created_date', width: 15 },
      { header: 'Created By', key: 'created_by', width: 12 },
      { header: 'Updated Date', key: 'updated_date', width: 15 },
      { header: 'Updated By', key: 'updated_by', width: 12 },
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

    let totalRoutes = 0;
    let activeRoutes = 0;

    exportData.forEach((row: any, index: number) => {
      const route = data[index];
      totalRoutes++;
      if (route.is_active === 'Y') activeRoutes++;

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

      if (route.is_active === 'N') {
        excelRow.getCell('is_active').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
      }
    });

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 15 },
    ];

    const summaryHeader = summarySheet.getRow(1);
    summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    summarySheet.addRow({ metric: 'Total Routes', value: totalRoutes });
    summarySheet.addRow({ metric: 'Active Routes', value: activeRoutes });
    summarySheet.addRow({
      metric: 'Inactive Routes',
      value: totalRoutes - activeRoutes,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
