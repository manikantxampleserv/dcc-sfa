"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const taxMaster_controller_1 = require("../controllers/taxMaster.controller");
const taxMaster_validation_1 = require("../validations/taxMaster.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/tax-masters', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('tax_master'), (0, auth_middleware_1.requirePermission)([{ module: 'tax-master', action: 'create' }]), taxMaster_validation_1.createTaxMasterValidation, validation_middleware_1.validate, taxMaster_controller_1.taxMasterController.createTaxMaster);
router.get('/tax-masters/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'tax-master', action: 'read' }]), taxMaster_controller_1.taxMasterController.getTaxMasterById);
router.get('/tax-masters', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'tax-master', action: 'read' }]), taxMaster_controller_1.taxMasterController.getTaxMasters);
router.put('/tax-masters/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('tax_master'), (0, auth_middleware_1.requirePermission)([{ module: 'tax-master', action: 'update' }]), taxMaster_controller_1.taxMasterController.updateTaxMaster);
router.delete('/tax-masters/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('tax_master'), (0, auth_middleware_1.requirePermission)([{ module: 'tax-master', action: 'delete' }]), taxMaster_controller_1.taxMasterController.deleteTaxMaster);
exports.default = router;
//# sourceMappingURL=taxMaster.routes.js.map