import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { paginate } from '../../utils/paginate';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { deleteFile, uploadFile } from '../../utils/blackbaze';

const prisma = new PrismaClient();
const serializeUser = (
  user: any,
  includeCreatedAt = false,
  includeUpdatedAt = false
) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role_id: Number(user.role_id),
  parent_id: user.parent_id,
  depot_id: user.depot_id,
  zone_id: user.zone_id,
  phone_number: user.phone_number,
  address: user.address,
  employee_id: user.employee_id,
  joining_date: user.joining_date,
  reporting_to: Number(user.reporting_to),
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
  user_depot: user.user_depot
    ? {
        id: user.user_depot.id,
        name: user.user_depot.name,
        code: user.user_depot.code,
      }
    : null,

  user_zones: user.zones
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
  async createUser(req: any, res: any): Promise<void> {
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
        is_active,
      } = req.body;

      const existingUser = await prisma.users.findFirst({
        where: { email, is_active: 'Y' },
      });
      if (existingUser) {
        res.error('Email already exists', 400);
        return;
      }

      if (employee_id) {
        const existingEmployee = await prisma.users.findFirst({
          where: { employee_id, is_active: 'Y' },
        });
        if (existingEmployee) {
          res.error('Employee ID already exists', 400);
          return;
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let profile_image_url: string | null = null;
      const file = (req as any).file;
      if (file) {
        try {
          const userFolder = req.user?.id ?? 'guest';
          const fileExt = file.originalname.split('.').pop();
          const fileName = `profiles/profile_${userFolder}_${Date.now()}.${fileExt}`;

          console.log(' Uploading file:', {
            originalName: file.originalname,
            fileName,
            mimetype: file.mimetype,
            size: file.size,
          });

          profile_image_url = await uploadFile(
            file.buffer,
            fileName,
            file.mimetype
          );

          console.log('File uploaded successfully:', profile_image_url);
        } catch (uploadError: any) {
          console.error(' File upload failed:', uploadError);
          console.warn(' Continuing without profile image');
        }
      }

      const newUser = await prisma.users.create({
        data: {
          email,
          password_hash: hashedPassword,
          name,
          role_id: Number(role_id),
          parent_id,
          depot_id,
          zone_id,
          phone_number,
          address,
          employee_id,
          joining_date: joining_date ? new Date(joining_date) : null,
          reporting_to: Number(reporting_to),
          profile_image: profile_image_url,
          is_active: is_active ?? 'Y',
          createdby: req.user?.id ?? 0,
          createdate: new Date(),
          log_inst: 1,
        },
        include: {
          user_role: true,
          companies: true,
          user_depot: true,
          user_zones: true,
          users: { select: { id: true, name: true, email: true } },
        },
      });

      res.success('User created successfully', serializeUser(newUser), 201);
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.error(error.message);
    }
  },

  async getUsers(req: any, res: any): Promise<void> {
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
          user_depot: true,
          user_zones: true,
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

  async getUserById(req: any, res: any): Promise<void> {
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
          user_depot: true,
          user_zones: true,
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

  // async updateUser(req: any, res: any): Promise<void> {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       res.validationError(errors.array(), 400);
  //       return;
  //     }

  //     const targetUserId = Number(req.params.id);
  //     const currentUserId = req.user?.id;

  //     console.log('Target User ID:', targetUserId);
  //     console.log('Current User ID:', currentUserId);
  //     console.log('Req body:', req.body);
  //     const uploadedFile = (req as any).file;
  //     console.log('Req file:', uploadedFile ? 'File present' : 'No file');

  //     if (!currentUserId) {
  //       res.error('User not authenticated', 401);
  //       return;
  //     }

  //     const existingUser = await prisma.users.findFirst({
  //       where: {
  //         id: targetUserId,
  //         is_active: 'Y',
  //       },
  //     });

  //     if (!existingUser) {
  //       res.error('User not found', 404);
  //       return;
  //     }

  //     const { createdate, updatedate, password, id, ...userData } = req.body;

  //     const restrictedFields = ['role_id', 'is_active', 'employee_id', 'email'];
  //     restrictedFields.forEach(field => {
  //       if (field in userData) {
  //         delete userData[field];
  //       }
  //     });

  //     let profile_image_url = undefined;

  //     if (uploadedFile) {
  //       console.log(
  //         '[UPDATE USER] File upload triggered for user:',
  //         targetUserId
  //       );

  //       if (existingUser.profile_image) {
  //         try {
  //           const oldFileUrl = new URL(existingUser.profile_image);
  //           const pathParts = oldFileUrl.pathname.split('/');
  //           const fileName = pathParts.slice(3).join('/');

  //           console.log('[UPDATE USER] Deleting old profile image:', fileName);
  //           await deleteFile(fileName);
  //         } catch (error) {
  //           console.error(' Error deleting old profile image:', error);
  //         }
  //       }

  //       const fileExt = uploadedFile.originalname.split('.').pop();
  //       const fileName = `profiles/profile_${targetUserId}_${Date.now()}.${fileExt}`;

  //       console.log(' Uploading new file:', {
  //         fileName,
  //         mimetype: uploadedFile.mimetype,
  //         size: uploadedFile.size,
  //       });

  //       try {
  //         profile_image_url = await uploadFile(
  //           uploadedFile.buffer,
  //           fileName,
  //           uploadedFile.mimetype
  //         );
  //         console.log(' File uploaded successfully:', profile_image_url);
  //       } catch (error) {
  //         console.error('[UPDATE USER] Error uploading profile image:', error);
  //         res.error('Failed to upload profile image', 500);
  //         return;
  //       }
  //     }

  //     const updateData: any = {
  //       ...userData,
  //       ...(profile_image_url && { profile_image: profile_image_url }),
  //       updatedby: currentUserId,
  //       updatedate: new Date(),
  //     };

  //     if (password) {
  //       updateData.password_hash = await bcrypt.hash(password, 10);
  //     }

  //     if (userData.joining_date) {
  //       updateData.joining_date = new Date(userData.joining_date);
  //     }

  //     const updatedUser = await prisma.users.update({
  //       where: { id: targetUserId },
  //       data: updateData,
  //       include: {
  //         user_role: true,
  //         companies: true,
  //         user_depot: true,
  //         user_zones: true,
  //         users: { select: { id: true, name: true, email: true } },
  //       },
  //     });

  //     res.success(
  //       'Profile updated successfully',
  //       serializeUser(updatedUser),
  //       200
  //     );
  //   } catch (error: any) {
  //     console.error('Error updating user:', error);
  //     res.error(error.message);
  //   }
  // },

  async updateUser(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const targetUserId = Number(req.params.id);
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        res.error('User not authenticated', 401);
        return;
      }

      const existingUser = await prisma.users.findFirst({
        where: {
          id: targetUserId,
          is_active: 'Y',
        },
      });

      if (!existingUser) {
        res.error('User not found', 404);
        return;
      }

      const { createdate, updatedate, password, id, ...userData } = req.body;

      const restrictedFields = ['role_id', 'is_active', 'employee_id', 'email'];
      restrictedFields.forEach(field => {
        if (field in userData) delete userData[field];
      });

      let profile_image_url: string | undefined;

      const uploadedFile = (req as any).file;
      if (uploadedFile) {
        if (existingUser.profile_image) {
          try {
            const oldFileUrl = new URL(existingUser.profile_image);
            const pathParts = oldFileUrl.pathname.split('/');
            const fileName = pathParts.slice(3).join('/');
            await deleteFile(fileName);
          } catch (err) {
            console.error('Error deleting old profile image:', err);
          }
        }

        const fileExt = uploadedFile.originalname.split('.').pop();
        const fileName = `profiles/profile_${targetUserId}_${Date.now()}.${fileExt}`;
        try {
          profile_image_url = await uploadFile(
            uploadedFile.buffer,
            fileName,
            uploadedFile.mimetype
          );
        } catch (err) {
          console.error('Error uploading new profile image:', err);
          res.error('Failed to upload profile image', 500);
          return;
        }
      }

      const updateData: any = {
        ...userData,
        ...(profile_image_url && { profile_image: profile_image_url }),
        updatedby: currentUserId,
        updatedate: new Date(),
      };

      if (password) {
        updateData.password_hash = await bcrypt.hash(password, 10);
      }

      if (userData.joining_date) {
        updateData.joining_date = new Date(userData.joining_date);
      }
      if (
        userData.reporting_to !== undefined &&
        userData.reporting_to !== null
      ) {
        updateData.reporting_to = Number(userData.reporting_to);
      }

      const updatedUser = await prisma.users.update({
        where: { id: targetUserId },
        data: updateData,
        include: {
          user_role: true,
          companies: true,
          user_depot: true,
          user_zones: true,
          users: { select: { id: true, name: true, email: true } },
        },
      });

      const serializedUser = serializeUser(updatedUser, true, true);

      res.success('Profile updated successfully', serializedUser, 200);
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.error(error.message);
    }
  },

  async deleteUser(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const id = Number(req.params.id);

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

      // if (dependentRecords > 0) {
      //   res.error(
      //     'Cannot delete user as they have team members reporting to them',
      //     400
      //   );
      //   return;
      // }

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

  async getUserProfile(req: any, res: any): Promise<void> {
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
          user_depot: true,
          user_zones: true,
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

  async updateUserProfile(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const userId = req.user?.id;

      if (!userId) {
        res.error('User not authenticated', 401);
        return;
      }

      const existingUser = await prisma.users.findFirst({
        where: { id: userId, is_active: 'Y' },
      });

      if (!existingUser) {
        res.error('User not found', 404);
        return;
      }

      const {
        createdate,
        updatedate,
        id,
        role_id,
        is_active,
        employee_id,
        email,
        ...userData
      } = req.body;

      let profile_image_url: string | undefined;
      const uploadedFile = (req as any).file;
      if (uploadedFile) {
        if (existingUser.profile_image) {
          try {
            const oldFileUrl = new URL(existingUser.profile_image);
            const fileName = oldFileUrl.pathname.split('/').slice(3).join('/');
            await deleteFile(fileName);
          } catch (err) {
            console.error('Error deleting old profile image:', err);
          }
        }

        const fileExt = uploadedFile.originalname.split('.').pop();
        const fileName = `profiles/profile_${userId}_${Date.now()}.${fileExt}`;
        try {
          profile_image_url = await uploadFile(
            uploadedFile.buffer,
            fileName,
            uploadedFile.mimetype
          );
        } catch (err) {
          console.error('Error uploading new profile image:', err);
          res.error('Failed to upload profile image', 500);
          return;
        }
      }

      const updateData: any = {
        ...userData,
        ...(profile_image_url && { profile_image: profile_image_url }),
        updatedby: userId,
        updatedate: new Date(),
      };

      if (userData.password) {
        updateData.password_hash = await bcrypt.hash(userData.password, 10);
      }

      if (userData.joining_date) {
        updateData.joining_date = new Date(userData.joining_date);
      }

      if (
        userData.reporting_to !== undefined &&
        userData.reporting_to !== null
      ) {
        updateData.reporting_to = Number(userData.reporting_to);
      }

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: updateData,
        include: {
          user_role: true,
          companies: true,
          user_depot: true,
          user_zones: true,
          users: { select: { id: true, name: true, email: true } },
        },
      });

      res.success(
        'Profile updated successfully',
        serializeUser(updatedUser, true, true),
        200
      );
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.error(error.message);
    }
  },
};
