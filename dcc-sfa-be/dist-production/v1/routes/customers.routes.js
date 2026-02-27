"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const multer_1 = require("../../utils/multer");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const customers_validation_1 = require("../validations/customers.validation");
const router = (0, express_1.Router)();
router.post('/customers', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('customers'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'create' }]), customers_validation_1.createCustomerValidation, validation_middleware_1.validate, customer_controller_1.customerController.createCustomers);
router.get('/customers', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'read' }]), customer_controller_1.customerController.getAllCustomers);
router.get('/customers/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'read' }]), customer_controller_1.customerController.getCustomersById);
router.put('/customers/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('customers'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'update' }]), customer_controller_1.customerController.updateCustomers);
router.delete('/customers/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('customers'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'delete' }]), customer_controller_1.customerController.deleteCustomers);
router.post('/customers-upload/:id/images', multer_1.upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'outlet_images', maxCount: 10 },
]), customer_controller_1.customerController.uploadCustomerImages);
router.post('/customers/bulk-upsert', auth_middleware_1.authenticateToken, multer_1.upload.fields([
    { name: 'profile_picture', maxCount: 10 },
    { name: 'outlet_images', maxCount: 10 },
    { name: 'profile_pics', maxCount: 10 },
    { name: 'customer_images', maxCount: 10 },
]), (0, audit_middleware_1.auditCreate)('customers'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'create' }]), customer_controller_1.customerController.bulkUpsertCustomers);
router.get('/customers-dropdown', auth_middleware_1.authenticateToken, customer_controller_1.customerController.getCustomersDropdown);
router.get('/customers/:id/relations', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'read' }]), customer_controller_1.customerController.getCustomerRelations);
exports.default = router;
//# sourceMappingURL=customers.routes.js.map