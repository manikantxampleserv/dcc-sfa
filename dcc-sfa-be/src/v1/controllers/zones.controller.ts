import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface RoleSerialized {
  id: number;
  name: string;
  description?: string | null;
  is_active: string;
  createdby: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  user_role?: { id: number; email: string; name: string }[];
  roles_permission?: { id: number; permission: string }[];
}

const serializeRole = (role: any): RoleSerialized => ({
  id: role.id,
  name: role.name,
  description: role.description,
  is_active: role.is_active,
  createdby: role.createdby,
  createdate: role.createdate,
  updatedate: role.updatedate,
  updatedby: role.updatedby,
  log_inst: role.log_inst,
  user_role: role.user_role
    ? role.user_role.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
      }))
    : [],
  roles_permission: role.roles_permission
    ? role.roles_permission.map((rp: any) => ({
        id: rp.id,
        permission: rp.permission,
      }))
    : [],
});

export const rolesController = {
  // Create a role
  async createRole(req: Request, res: Response) {
    try {
      const data = req.body;
      const role = await prisma.roles.create({
        data: {
          ...data,
          createdby: data.createdby || 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: { user_role: true, roles_permission: true },
      });

      res.status(201).json({
        message: 'Role created successfully',
        data: serializeRole(role),
      });
    } catch (error: any) {
      console.error('Create Role Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Get all roles with pagination and optional search
  async getRoles(req: Request, res: Response) {
    try {
      const { page = '1', limit = '10', search = '' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(search && {
          OR: [{ name: { contains: searchLower } }],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.roles,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: { user_role: true, roles_permission: true },
      });

      res.json({
        message: 'Roles retrieved successfully',
        data: data.map(serializeRole),
        pagination,
      });
    } catch (error: any) {
      console.error('Get Roles Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Get role by ID
  async getRoleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const role = await prisma.roles.findUnique({
        where: { id: Number(id) },
        include: { user_role: true, roles_permission: true },
      });

      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      res.json({
        message: 'Role fetched successfully',
        data: serializeRole(role),
      });
    } catch (error: any) {
      console.error('Get Role Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Update role
  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingRole = await prisma.roles.findUnique({
        where: { id: Number(id) },
      });

      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }

      const data = { ...req.body, updatedate: new Date() };
      const role = await prisma.roles.update({
        where: { id: Number(id) },
        data,
        include: { user_role: true, roles_permission: true },
      });

      res.json({
        message: 'Role updated successfully',
        data: serializeRole(role),
      });
    } catch (error: any) {
      console.error('Update Role Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Delete role
  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingRole = await prisma.roles.findUnique({
        where: { id: Number(id) },
      });

      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }

      await prisma.roles.delete({ where: { id: Number(id) } });

      res.json({ message: 'Role deleted successfully' });
    } catch (error: any) {
      console.error('Delete Role Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
