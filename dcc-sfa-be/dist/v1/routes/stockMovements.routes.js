"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stockMovements_controller_1 = require("../controllers/stockMovements.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const stockMovements_validation_1 = require("../validations/stockMovements.validation");
const router = express_1.default.Router();
router.post('/stock-movements', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('stock_movements'), (0, auth_middleware_1.requirePermission)([{ module: 'stock-movement', action: 'create' }]), stockMovements_validation_1.createStockMovementValidation, validation_middleware_1.validate, stockMovements_controller_1.stockMovementsController.createStockMovement);
router.put('/stock-movements/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('stock_movements'), (0, auth_middleware_1.requirePermission)([{ module: 'stock-movement', action: 'update' }]), stockMovements_validation_1.updateStockMovementValidation, validation_middleware_1.validate, stockMovements_controller_1.stockMovementsController.updateStockMovement);
router.get('/stock-movements/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'stock-movement', action: 'read' }]), stockMovements_controller_1.stockMovementsController.getStockMovementById);
router.get('/stock-movements', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'stock-movement', action: 'read' }]), stockMovements_controller_1.stockMovementsController.getAllStockMovements);
router.delete('/stock-movements/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('stock_movements'), (0, auth_middleware_1.requirePermission)([{ module: 'stock-movement', action: 'delete' }]), stockMovements_controller_1.stockMovementsController.deleteStockMovement);
exports.default = router;
//# sourceMappingURL=stockMovements.routes.js.map