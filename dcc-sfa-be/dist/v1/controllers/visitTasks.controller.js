"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitTasksController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeVisitTask = (task) => ({
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
exports.visitTasksController = {
    async createVisitTasks(req, res) {
        try {
            const data = req.body;
            if (!data.visit_id) {
                return res.status(400).json({ message: 'Visit ID is required' });
            }
            const task = await prisma_client_1.default.visit_tasks.create({
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
        }
        catch (error) {
            console.error('Create Visit Task Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAllVisitTasks(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase() : '';
            const statusLower = status ? status.toLowerCase() : '';
            const filters = {
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
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.visit_tasks,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: { createdate: 'desc' },
                include: {
                    visit_tasks_users: true,
                    visit_tasks_visits: true,
                },
            });
            res.success('Visit tasks retrieved successfully', data.map((task) => serializeVisitTask(task)), 200, pagination);
        }
        catch (error) {
            console.error('Get Visit Tasks Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getVisitTasksById(req, res) {
        try {
            const { id } = req.params;
            const task = await prisma_client_1.default.visit_tasks.findUnique({
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
        }
        catch (error) {
            console.error('Get Visit Task Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateVisitTasks(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.visit_tasks.findUnique({
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
            const task = await prisma_client_1.default.visit_tasks.update({
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
        }
        catch (error) {
            console.error('Update Visit Task Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteVisitTasks(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.visit_tasks.findUnique({
                where: { id: Number(id) },
            });
            if (!existing)
                return res.status(404).json({ message: 'Visit task not found' });
            await prisma_client_1.default.visit_tasks.delete({ where: { id: Number(id) } });
            res.json({ message: 'Visit task deleted successfully' });
        }
        catch (error) {
            console.error('Delete Visit Task Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=visitTasks.controller.js.map