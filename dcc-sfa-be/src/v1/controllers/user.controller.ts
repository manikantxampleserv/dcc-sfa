import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { paginate } from '../../utils/paginate';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const serializeUser = (
  user: any,
  includeCreatedAt = false,
  includeUpdatedAt = false
) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role_id: user.role_id,
  parent_id: user.parent_id,
  depot_id: user.depot_id,
  zone_id: user.zone_id,
  phone_number: user.phone_number,
  address: user.address,
  employee_id: user.employee_id,
  joining_date: user.joining_date,
  reporting_to: user.reporting_to,
  profile_image: user.profile_image,
  last_login: user.last_login,
  is_active: user.is_active,
  ...(includeCreatedAt && { created_at: user.createdate }),
  ...(includeUpdatedAt && { updated_at: user.updatedate }),
  role: user.user_role
    ? {
        id: user.user_role.id,
        name: user.user_role.name,
        description: user.user_role.description,
      }
    : null,
  company: user.companies
    ? {
        id: user.companies.id,
        name: user.companies.name,
        code: user.companies.code,
      }
    : null,
  depot: user.depots
    ? {
        id: user.depots.id,
        name: user.depots.name,
        code: user.depots.code,
      }
    : null,
  zone: user.zones
    ? {
        id: user.zones.id,
        name: user.zones.name,
        code: user.zones.code,
      }
    : null,
  reporting_manager: user.users
    ? {
        id: user.users.id,
        name: user.users.name,
        email: user.users.email,
      }
    : null,
});

export const userController = {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const {
        email,
        password,
        name,
        role_id,
        parent_id,
        depot_id,
        zone_id,
        phone_number,
        address,
        employee_id,
        joining_date,
        reporting_to,
        profile_image,
        is_active,
      } = req.body;

      // Check if email already exists
      const existingUser = await prisma.users.findFirst({
        where: {
          email,
          is_active: 'Y',
        },
      });

      if (existingUser) {
        res.error('Email already exists', 400);
        return;
      }

      // Check if employee_id already exists (if provided)
      if (employee_id) {
        const existingEmployee = await prisma.users.findFirst({
          where: {
            employee_id,
            is_active: 'Y',
          },
        });

        if (existingEmployee) {
          res.error('Employee ID already exists', 400);
          return;
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.users.create({
        data: {
          email,
          password_hash: hashedPassword,
          name,
          role_id,
          parent_id,
          depot_id,
          zone_id,
          phone_number,
          address,
          employee_id,
          joining_date: joining_date ? new Date(joining_date) : null,
          reporting_to,
          profile_image,
          is_active: is_active ?? 'Y',
          createdby: req.user?.id ?? 0,
          createdate: new Date(),
          log_inst: 1,
        },
        include: {
          user_role: true,
          companies: true,
          depots: true,
          zones: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.success('User created successfully', serializeUser(newUser), 201);
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.error(error.message);
    }
  },

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        isActive = 'Y',
        role_id,
        depot_id,
        zone_id,
      } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        is_active: isActive as string,
        ...(search && {
          OR: [
            {
              name: {
                contains: searchLower,
              },
            },
            {
              email: {
                contains: searchLower,
              },
            },
            {
              employee_id: {
                contains: searchLower,
              },
            },
          ],
        }),
        ...(role_id && { role_id: Number(role_id) }),
        ...(depot_id && { depot_id: Number(depot_id) }),
        ...(zone_id && { zone_id: Number(zone_id) }),
      };

      const { data, pagination } = await paginate({
        model: prisma.users,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          user_role: true,
          companies: true,
          depots: true,
          zones: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.success(
        'Users retrieved successfully',
        data.map((user: any) => serializeUser(user, true, true)),
        200,
        pagination
      );
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.error(error.message);
    }
  },

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);
      const user = await prisma.users.findFirst({
        where: {
          id,
          is_active: 'Y',
        },
        include: {
          user_role: true,
          companies: true,
          depots: true,
          zones: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!user) {
        res.error('User not found', 404);
        return;
      }

      res.success('User fetched successfully', serializeUser(user), 200);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      res.error(error.message);
    }
  },

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);
      const { createdate, updatedate, password, ...userData } = req.body;

      // Remove id from update data if present
      if ('id' in userData) {
        delete userData.id;
      }

      // Check if user exists
      const existingUser = await prisma.users.findFirst({
        where: {
          id,
          is_active: 'Y',
        },
      });

      if (!existingUser) {
        res.error('User not found', 404);
        return;
      }

      // Check if email is being changed and if new email already exists
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await prisma.users.findFirst({
          where: {
            email: userData.email,
            is_active: 'Y',
            id: { not: id },
          },
        });

        if (emailExists) {
          res.error('Email already exists', 400);
          return;
        }
      }

      // Check if employee_id is being changed and if new employee_id already exists
      if (
        userData.employee_id &&
        userData.employee_id !== existingUser.employee_id
      ) {
        const employeeIdExists = await prisma.users.findFirst({
          where: {
            employee_id: userData.employee_id,
            is_active: 'Y',
            id: { not: id },
          },
        });

        if (employeeIdExists) {
          res.error('Employee ID already exists', 400);
          return;
        }
      }

      // Prepare update data
      const updateData: any = {
        ...userData,
        updatedby: req.user?.id ?? 0,
        updatedate: new Date(),
      };

      // Hash password if provided
      if (password) {
        updateData.password_hash = await bcrypt.hash(password, 10);
      }

      // Convert joining_date to Date if provided
      if (userData.joining_date) {
        updateData.joining_date = new Date(userData.joining_date);
      }

      const updatedUser = await prisma.users.update({
        where: { id },
        data: updateData,
        include: {
          user_role: true,
          companies: true,
          depots: true,
          zones: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.success('User updated successfully', serializeUser(updatedUser), 200);
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.error(error.message);
    }
  },

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);

      // Check if user exists
      const existingUser = await prisma.users.findFirst({
        where: {
          id,
          is_active: 'Y',
        },
      });

      if (!existingUser) {
        res.error('User not found', 404);
        return;
      }

      const dependentRecords = await prisma.users.count({
        where: {
          reporting_to: id,
          is_active: 'Y',
        },
      });

      if (dependentRecords > 0) {
        res.error(
          'Cannot delete user as they have team members reporting to them',
          400
        );
        return;
      }

      await prisma.users.update({
        where: { id },
        data: {
          is_active: 'N',
          updatedby: req.user?.id ?? 0,
          updatedate: new Date(),
        },
      });

      res.success('User deleted successfully', null, 200);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.error(error.message);
    }
  },
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.error('User not authenticated', 401);
        return;
      }

      const user = await prisma.users.findFirst({
        where: {
          id: userId,
          is_active: 'Y',
        },
        include: {
          user_role: true,
          companies: true,
          depots: true,
          zones: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!user) {
        res.error('User not found', 404);
        return;
      }

      res.success(
        'User profile fetched successfully',
        serializeUser(user),
        200
      );
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.error(error.message);
    }
  },

  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { name, phone_number, address, profile_image } = req.body;

      if (!userId) {
        res.error('User not authenticated', 401);
        return;
      }

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          name,
          phone_number,
          address,
          profile_image,
          updatedby: userId,
          updatedate: new Date(),
        },
        include: {
          user_role: true,
          companies: true,
          depots: true,
          zones: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.success(
        'Profile updated successfully',
        serializeUser(updatedUser),
        200
      );
    } catch (error: any) {
      console.error('Error updating profile:', error);
      res.error(error.message);
    }
  },
};
