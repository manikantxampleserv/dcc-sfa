"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vanInventory_controller_1 = require("../controllers/vanInventory.controller");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/van-inventory', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('van_inventory'), (0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'create' }]), 
// createVanInventoryValidation,
validation_middleware_1.validate, vanInventory_controller_1.vanInventoryController.createOrUpdateVanInventory);
router.get('/van-inventory', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'read' }]), vanInventory_controller_1.vanInventoryController.getAllVanInventory);
router.get('/van-inventory/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'read' }]), vanInventory_controller_1.vanInventoryController.getVanInventoryById);
router.put('/van-inventory/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('van_inventory'), (0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'update' }]), vanInventory_controller_1.vanInventoryController.updateVanInventory);
router.delete('/van-inventory/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('van_inventory'), (0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'delete' }]), vanInventory_controller_1.vanInventoryController.deleteVanInventory);
router.post('/van-inventory/:vanInventoryId/items', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('van_inventory_items'), (0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'create' }]), vanInventory_controller_1.vanInventoryController.createVanInventoryItem);
router.get('/van-inventory/:vanInventoryId/items', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'read' }]), vanInventory_controller_1.vanInventoryController.getVanInventoryItems);
router.put('/van-inventory/:vanInventoryId/items/:itemId', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('van_inventory_items'), (0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'update' }]), vanInventory_controller_1.vanInventoryController.updateVanInventoryItem);
router.delete('/van-inventory/:vanInventoryId/items/:itemId', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('van_inventory_items'), (0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'delete' }]), vanInventory_controller_1.vanInventoryController.deleteVanInventoryItem);
router.put('/van-inventory/:vanInventoryId/items', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('van_inventory_items'), (0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'update' }]), vanInventory_controller_1.vanInventoryController.bulkUpdateVanInventoryItems);
router.get('/products/:productId/batches', vanInventory_controller_1.vanInventoryController.getProductBatches);
router.get('/products/:productId/batches/:batchId', vanInventory_controller_1.vanInventoryController.getProductBatchDetails);
router.post('/products/batches/bulk', vanInventory_controller_1.vanInventoryController.getBulkProductBatches);
exports.default = router;
//# sourceMappingURL=vanInventory.routes.js.map