"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const customerComplaints_controller_1 = require("../controllers/customerComplaints.controller");
const customerComplaints_validation_1 = require("../validations/customerComplaints.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/customer-complaints', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('customerComplaints'), (0, auth_middleware_1.requirePermission)([{ module: 'customer-complaint', action: 'create' }]), customerComplaints_validation_1.createCustomerComplaintsValidation, validation_middleware_1.validate, customerComplaints_controller_1.customerComplaintsController.createOrUpdateCustomerComplaints);
router.get('/customer-complaints/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'customer-complaint', action: 'read' }]), customerComplaints_controller_1.customerComplaintsController.getCustomerComplaintsById);
router.get('/customer-complaints', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'customer-complaint', action: 'read' }]), customerComplaints_controller_1.customerComplaintsController.getAllCustomerComplaints);
// router.put(
//   '/customer-complaints/:id',
//   authenticateToken,
//   auditUpdate('customerComplaints'),
//   customerComplaintsController.updateCustomerComplaints
// );
router.delete('/customer-complaints/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('customerComplaints'), (0, auth_middleware_1.requirePermission)([{ module: 'customer-complaint', action: 'delete' }]), customerComplaints_controller_1.customerComplaintsController.deleteCustomerComplaints);
exports.default = router;
//# sourceMappingURL=customerComplaints.routes.js.map