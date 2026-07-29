"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerGroupMember_controller_1 = require("../controllers/customerGroupMember.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const customerGroupMember_validation_1 = require("../validations/customerGroupMember.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/customer-group-member', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('customer_group_members'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet-group', action: 'create' }]), customerGroupMember_validation_1.createCustomerGroupMemberValidation, validation_middleware_1.validate, customerGroupMember_controller_1.customerGroupMemberController.createCustomerGroupMember);
router.get('/customer-group-member', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'outlet-group', action: 'read' }]), customerGroupMember_controller_1.customerGroupMemberController.getAllCustomerGroupMember);
router.get('/customer-group-member/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'outlet-group', action: 'read' }]), customerGroupMember_controller_1.customerGroupMemberController.getCustomerGroupMemberById);
router.put('/customer-group-member/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('customer_group_members'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet-group', action: 'update' }]), customerGroupMember_controller_1.customerGroupMemberController.updateCustomerGroupMember);
router.delete('/customer-group-member/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('customer_group_members'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet-group', action: 'delete' }]), customerGroupMember_controller_1.customerGroupMemberController.deleteCustomerGroupMember);
exports.default = router;
//# sourceMappingURL=customerGroupMembers.routes.js.map