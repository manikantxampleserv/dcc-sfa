import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password, role, parent_id, name } = req.body;

    const existing = await prisma.users.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existing) {
      res.error('Username or Email already exists', 400);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
        role: role || 'user',
        name,
        parent_id,
        createdby: 1,
        createdate: new Date(),
        is_active: 'Y',
      },
    });
    res.success(
      'User created successfully',
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      201
    );
  } catch (error) {
    console.error(error);
    res.error('Error creating user', 500);
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.users.findMany({
      where: { is_active: 'Y' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdate: true,
      },
    });

    res.success('Users fetched successfully', users);
  } catch (error) {
    console.error(error);
    res.error('Error fetching users', 500);
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      res.error('User not found', 404);
      return;
    }

    res.success('User fetched successfully', user);
  } catch (error) {
    console.error(error);
    res.error('Error fetching user', 500);
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const { username, email, password, role } = req.body;

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedby: 1,
        updatedate: new Date(),
      },
      select: { id: true, username: true, email: true, role: true },
    });

    res.success('User updated successfully', updatedUser);
  } catch (error) {
    console.error(error);
    res.error('Error updating user', 500);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    await prisma.users.update({
      where: { id: userId },
      data: {
        is_active: 'N',
        updatedate: new Date(),
        updatedby: 1,
      },
    });

    res.success('User deleted successfully');
  } catch (error) {
    console.error(error);
    res.error('Error deleting user', 500);
  }
};
