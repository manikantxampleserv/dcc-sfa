"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sapController = void 0;
const sap_service_1 = require("../services/sap.service");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
exports.sapController = {
    async syncVanInventory(req, res) {
        try {
            const result = await sap_service_1.sapService.createOrUpdateVanInventorySAP(req.body);
            return res.status(201).json({
                success: true,
                message: 'SAP inventory synced successfully',
                data: result,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    },
    async searchUsers(req, res) {
        try {
            const name = req.query.name || '';
            if (!name)
                return res
                    .status(400)
                    .json({ success: false, message: 'name query param required' });
            const users = await prisma_client_1.default.users.findMany({
                where: {
                    name: { contains: name },
                    is_active: 'Y',
                },
                select: { id: true, name: true },
                take: 50,
            });
            return res.json({ success: true, data: users });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    },
    async searchLocations(req, res) {
        try {
            const name = req.query.name || '';
            if (!name)
                return res
                    .status(400)
                    .json({ success: false, message: 'name query param required' });
            const depots = await prisma_client_1.default.depots.findMany({
                where: { name: { contains: name } },
                select: { id: true, name: true },
                take: 50,
            });
            return res.json({ success: true, data: depots });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    },
    async searchVehicles(req, res) {
        try {
            const name = req.query.name || '';
            if (!name)
                return res
                    .status(400)
                    .json({ success: false, message: 'name query param required' });
            const vehicles = await prisma_client_1.default.vehicles.findMany({
                where: {
                    OR: [
                        { vehicle_number: { contains: name } },
                        { make: { contains: name } },
                        { model: { contains: name } },
                    ],
                },
                select: { id: true, vehicle_number: true },
                take: 50,
            });
            // normalize to id/name shape
            const result = vehicles.map(v => ({ id: v.id, name: v.vehicle_number }));
            return res.json({ success: true, data: result });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    },
};
//# sourceMappingURL=sap.controller.js.map