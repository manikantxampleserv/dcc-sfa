"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehiclesController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const serializeVehicle = (vehicle) => ({
    id: vehicle.id,
    vehicle_number: vehicle.vehicle_number,
    type: vehicle.type,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year ? parseInt(vehicle.year.toString()) : null,
    capacity: vehicle.capacity ? parseFloat(vehicle.capacity.toString()) : null,
    fuel_type: vehicle.fuel_type,
    current_latitude: vehicle.current_latitude
        ? parseFloat(vehicle.current_latitude.toString())
        : null,
    current_longitude: vehicle.current_longitude
        ? parseFloat(vehicle.current_longitude.toString())
        : null,
    last_location_update: vehicle.last_location_update,
    assigned_to: vehicle.assigned_to,
    status: vehicle.status,
    fuel_level: vehicle.fuel_level
        ? parseFloat(vehicle.fuel_level.toString())
        : null,
    mileage: vehicle.mileage ? parseFloat(vehicle.mileage.toString()) : null,
    last_service_date: vehicle.last_service_date,
    next_service_due: vehicle.next_service_due,
    insurance_expiry: vehicle.insurance_expiry,
    registration_expiry: vehicle.registration_expiry,
    is_active: vehicle.is_active,
    created_by: vehicle.createdby,
    createdate: vehicle.createdate,
    updatedate: vehicle.updatedate,
    updatedby: vehicle.updatedby,
});
exports.vehiclesController = {
    async createVehicle(req, res) {
        try {
            const data = req.body;
            if (!data.vehicle_number || !data.type) {
                return res
                    .status(400)
                    .json({ message: 'Vehicle number and type are required' });
            }
            const duplicateVechile = await prisma_client_1.default.vehicles.findFirst({
                where: {
                    vehicle_number: data.vehicle_number,
                },
            });
            if (duplicateVechile) {
                return res.status(409).json({
                    message: 'Vehicle with this vehicle number already exists',
                });
            }
            const vehicle = await prisma_client_1.default.vehicles.create({
                data: {
                    ...data,
                    createdby: data.createdby ? Number(data.createdby) : 1,
                    log_inst: data.log_inst || 1,
                    createdate: new Date(),
                },
            });
            res.status(201).json({
                message: 'Vehicle created successfully',
                data: serializeVehicle(vehicle),
            });
        }
        catch (error) {
            console.error('Create Vehicle Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getVehicles(req, res) {
        try {
            const { page = '1', limit = '10', search = '', isActive, type, status, } = req.query;
            const page_num = parseInt(page, 10);
            const limit_num = parseInt(limit, 10);
            const searchLower = search.toLowerCase();
            const filters = {
                is_active: isActive,
                ...(search && {
                    OR: [
                        { vehicle_number: { contains: searchLower } },
                        { type: { contains: searchLower } },
                        { make: { contains: searchLower } },
                        { model: { contains: searchLower } },
                    ],
                }),
                ...(type && { type: type }),
                ...(status && { status: status }),
            };
            const totalVehicles = await prisma_client_1.default.vehicles.count();
            const activeVehicles = await prisma_client_1.default.vehicles.count({
                where: { is_active: 'Y' },
            });
            const inactiveVehicles = await prisma_client_1.default.vehicles.count({
                where: { is_active: 'N' },
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const newVehiclesThisMonth = await prisma_client_1.default.vehicles.count({
                where: {
                    createdate: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });
            const stats = {
                total_vehicles: totalVehicles,
                active_vehicles: activeVehicles,
                inactive_vehicles: inactiveVehicles,
                new_vehicles: newVehiclesThisMonth,
            };
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.vehicles,
                filters,
                page: page_num,
                limit: limit_num,
                orderBy: { createdate: 'desc' },
            });
            res.json({
                success: true,
                message: 'Vehicles retrieved successfully',
                data: data.map((d) => serializeVehicle(d)),
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                stats,
            });
        }
        catch (error) {
            console.error('Get Vehicles Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getVehicleById(req, res) {
        try {
            const { id } = req.params;
            const vehicle = await prisma_client_1.default.vehicles.findUnique({
                where: { id: Number(id) },
            });
            if (!vehicle) {
                return res.status(404).json({ message: 'Vehicle not found' });
            }
            res.json({
                message: 'Vehicle fetched successfully',
                data: serializeVehicle(vehicle),
            });
        }
        catch (error) {
            console.error('Get Vehicle Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateVehicle(req, res) {
        try {
            const { id } = req.params;
            const existingVehicle = await prisma_client_1.default.vehicles.findUnique({
                where: { id: Number(id) },
            });
            if (!existingVehicle) {
                return res.status(404).json({ message: 'Vehicle not found' });
            }
            const data = { ...req.body, updatedate: new Date() };
            const vehicle = await prisma_client_1.default.vehicles.update({
                where: { id: Number(id) },
                data,
            });
            res.json({
                message: 'Vehicle updated successfully',
                data: serializeVehicle(vehicle),
            });
        }
        catch (error) {
            console.error('Update Vehicle Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteVehicle(req, res) {
        try {
            const { id } = req.params;
            const existingVehicle = await prisma_client_1.default.vehicles.findUnique({
                where: { id: Number(id) },
            });
            if (!existingVehicle) {
                return res.status(404).json({ message: 'Vehicle not found' });
            }
            await prisma_client_1.default.vehicles.delete({ where: { id: Number(id) } });
            res.json({ message: 'Vehicle deleted successfully' });
        }
        catch (error) {
            console.error('Delete Vehicle Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
};
//# sourceMappingURL=vehicles.controller.js.map