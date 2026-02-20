"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerGroups_controller_1 = require("../controllers/customerGroups.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const customerGroups_validation_1 = require("../validations/customerGroups.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/customer-groups', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('customer_groups'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet-group', action: 'create' }]), customerGroups_validation_1.createCustomerGroupsValidation, validation_middleware_1.validate, customerGroups_controller_1.customerGroupsController.createCustomerGroups);
router.get('/customer-groups', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'outlet-group', action: 'read' }]), customerGroups_controller_1.customerGroupsController.getAllCustomerGroups);
router.get('/customer-groups/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'outlet-group', action: 'read' }]), customerGroups_controller_1.customerGroupsController.getCustomerGroupsById);
router.put('/customer-groups/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('customer_groups'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet-group', action: 'update' }]), customerGroups_controller_1.customerGroupsController.updateCustomerGroups);
router.delete('/customer-groups/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('customer_groups'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet-group', action: 'delete' }]), customerGroups_controller_1.customerGroupsController.deleteCustomerGroups);
exports.default = router;
//# sourceMappingURL=customerGroups.routes.js.map