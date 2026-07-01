"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sap_controller_1 = require("../controllers/sap.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/sap/van-inventory', auth_middleware_1.authenticateToken, sap_controller_1.sapController.syncVanInventory);
router.get('/sap/search/users', auth_middleware_1.authenticateToken, sap_controller_1.sapController.searchUsers);
router.get('/sap/search/locations', auth_middleware_1.authenticateToken, sap_controller_1.sapController.searchLocations);
router.get('/sap/search/vehicles', auth_middleware_1.authenticateToken, sap_controller_1.sapController.searchVehicles);
router.get('/sap/search/product', auth_middleware_1.authenticateToken, sap_controller_1.sapController.searchProduct);
router.patch('/sap-van-inventory/:id/cancel', auth_middleware_1.authenticateToken, 
// auditUpdate('van_inventory'),
(0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'update' }]), sap_controller_1.sapController.updateVanInventoryCancellation);
// Cancel/Uncancel Van Inventory Item
router.patch('/sap-van-inventory/items/:itemId/cancel', auth_middleware_1.authenticateToken, 
// auditUpdate('van_inventory_items'),
(0, auth_middleware_1.requirePermission)([{ module: 'van-stock', action: 'update' }]), sap_controller_1.sapController.updateVanInventoryItemCancellation);
exports.default = router;
//# sourceMappingURL=sap.routes.js.map