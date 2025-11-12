import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface VisitTaskSerialized {
  id: number;
  visit_id: number;
  task_type?: string | null;
  description?: string | null;
  assigned_to?: number | null;
  due_date?: Date | null;
  completed_date?: Date | null;
  status?: string | null;
  priority?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  assigned_user?: { id: number; name: string } | null;
  visit?: { id: number; customer_id: number } | null;
}

const serializeVisitTask = (task: any): VisitTaskSerialized => ({
  id: task.id,
  visit_id: task.visit_id,
  task_type: task.task_type,
  description: task.description,
  assigned_to: task.assigned_to,
  due_date: task.due_date,
  completed_date: task.completed_date,
  status: task.status,
  priority: task.priority,
  is_active: task.is_active,
  createdate: task.createdate,
  createdby: task.createdby,
  updatedate: task.updatedate,
  updatedby: task.updatedby,
  log_inst: task.log_inst,
  assigned_user: task.visit_tasks_users
    ? { id: task.visit_tasks_users.id, name: task.visit_tasks_users.name }
    : null,
  visit: task.visit_tasks_visits
    ? {
        id: task.visit_tasks_visits.id,
        customer_id: task.visit_tasks_visits.customer_id,
      }
    : null,
});

export const visitTasksController = {
  async createVisitTasks(req: any, res: any) {
    try {
      const data = req.body;

      if (!data.visit_id) {
        return res.status(400).json({ message: 'Visit ID is required' });
      }

      const task = await prisma.visit_tasks.create({
        data: {
          visit_id: Number(data.visit_id),
          task_type: data.task_type || null,
          description: data.description || null,
          assigned_to: data.assigned_to ? Number(data.assigned_to) : null,
          due_date: data.due_date ? new Date(data.due_date) : null,
          completed_date: data.completed_date
            ? new Date(data.completed_date)
            : null,
          status: data.status || 'pending',
          priority: data.priority || 'medium',
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          visit_tasks_users: true,
          visit_tasks_visits: true,
        },
      });

      res.status(201).json({
        message: 'Visit task created successfully',
        data: serializeVisitTask(task),
      });
    } catch (error: any) {
      console.error('Create Visit Task Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllVisitTasks(req: any, res: any) {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { task_type: { contains: searchLower } },
            { description: { contains: searchLower } },
            { status: { contains: searchLower } },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
      };

      const { data, pagination } = await paginate({
        model: prisma.visit_tasks,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          visit_tasks_users: true,
          visit_tasks_visits: true,
        },
      });

      res.success(
        'Visit tasks retrieved successfully',
        data.map((task: any) => serializeVisitTask(task)),
        200,
        pagination
      );
    } catch (error: any) {
      console.error('Get Visit Tasks Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getVisitTasksById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await prisma.visit_tasks.findUnique({
        where: { id: Number(id) },
        include: {
          visit_tasks_users: true,
          visit_tasks_visits: true,
        },
      });

      if (!task)
        return res.status(404).json({ message: 'Visit task not found' });

      res.json({
        message: 'Visit task fetched successfully',
        data: serializeVisitTask(task),
      });
    } catch (error: any) {
      console.error('Get Visit Task Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateVisitTasks(req: any, res: any) {
    try {
      const { id } = req.params;
      const existing = await prisma.visit_tasks.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Visit task not found' });

      const data = {
        ...req.body,
        due_date: req.body.due_date ? new Date(req.body.due_date) : null,
        completed_date: req.body.completed_date
          ? new Date(req.body.completed_date)
          : null,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };

      const task = await prisma.visit_tasks.update({
        where: { id: Number(id) },
        data,
        include: {
          visit_tasks_users: true,
          visit_tasks_visits: true,
        },
      });

      res.json({
        message: 'Visit task updated successfully',
        data: serializeVisitTask(task),
      });
    } catch (error: any) {
      console.error('Update Visit Task Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteVisitTasks(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.visit_tasks.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Visit task not found' });

      await prisma.visit_tasks.delete({ where: { id: Number(id) } });

      res.json({ message: 'Visit task deleted successfully' });
    } catch (error: any) {
      console.error('Delete Visit Task Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
