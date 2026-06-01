"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const inventoryStock_controller_1 = require("../controllers/inventoryStock.controller");
const router = (0, express_1.Router)();
router.post('/inventory-stock', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('inventory_stock'), (0, auth_middleware_1.requirePermission)([{ module: 'warehouse', action: 'create' }]), inventoryStock_controller_1.inventoryStockController.createInventoryStock);
router.get('/inventory-stock', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'warehouse', action: 'read' }]), inventoryStock_controller_1.inventoryStockController.getAllInventoryStock);
router.get('/inventory-stock/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'warehouse', action: 'read' }]), inventoryStock_controller_1.inventoryStockController.getInventoryStockById);
router.put('/inventory-stock/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('inventory_stock'), (0, auth_middleware_1.requirePermission)([{ module: 'warehouse', action: 'update' }]), inventoryStock_controller_1.inventoryStockController.updateInventoryStock);
router.delete('/inventory-stock/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('inventory_stock'), (0, auth_middleware_1.requirePermission)([{ module: 'warehouse', action: 'delete' }]), inventoryStock_controller_1.inventoryStockController.deleteInventoryStock);
exports.default = router;
//# sourceMappingURL=inventoryStock.routes.js.map