"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reconciliation_controller_1 = require("../controllers/reconciliation.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const reconciliation_validation_1 = require("../validations/reconciliation.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = express_1.default.Router();
router.get('/reconciliation', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'reconciliation', action: 'read' }]), reconciliation_controller_1.reconciliationController.getAllReconciliations);
router.get('/reconciliation/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'reconciliation', action: 'read' }]), reconciliation_controller_1.reconciliationController.getReconciliationById);
router.get('/reconciliation/:id/export', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'reconciliation', action: 'read' }]), reconciliation_controller_1.reconciliationController.exportReconciliationExcel);
router.post('/reconciliation/save', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'reconciliation', action: 'update' }]), reconciliation_validation_1.saveReconciliationValidation, validation_middleware_1.validate, (0, audit_middleware_1.auditUpdate)('reconciliation_items'), reconciliation_controller_1.reconciliationController.saveReconciliations);
exports.default = router;
//# sourceMappingURL=reconciliation.routes.js.map