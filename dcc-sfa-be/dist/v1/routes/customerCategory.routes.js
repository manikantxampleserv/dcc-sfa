"use strict";
// import express from 'express';
// import {
//   authenticateToken,
//   requirePermission,
// } from '../../middlewares/auth.middleware';
// import { customerCategoryController } from '../controllers/customerCategory.controller';
// import { auditCreate, auditDelete } from '../../middlewares/audit.middleware';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// router.post(
//   '/customer-category/bulk',
//   authenticateToken,
//   auditCreate('customer_category'),
//   requirePermission([{ module: 'customer-category', action: 'create' }]),
//   customerCategoryController.bulkCustomerCategory
// );
// router.get(
//   '/customer-category',
//   authenticateToken,
//   requirePermission([{ module: 'customer-category', action: 'read' }]),
//   customerCategoryController.getAllCustomerCategory
// );
// router.get(
//   '/customer-category/:id',
//   authenticateToken,
//   requirePermission([{ module: 'customer-category', action: 'read' }]),
//   customerCategoryController.getCustomerCategoryById
// );
// router.delete(
//   '/customer-category/:id',
//   authenticateToken,
//   auditDelete('customer_category'),
//   requirePermission([{ module: 'customer-category', action: 'delete' }]),
//   customerCategoryController.deleteCustomerCategory
// );
// export default router;
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const customerCategory_controller_1 = require("../controllers/customerCategory.controller");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = express_1.default.Router();
router.post('/customer-category/bulk', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('customer_category'), (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'create' }]), customerCategory_controller_1.customerCategoryController.bulkCustomerCategory);
router.get('/customer-category', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'read' }]), customerCategory_controller_1.customerCategoryController.getAllCustomerCategory);
router.get('/customer-category/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'read' }]), customerCategory_controller_1.customerCategoryController.getCustomerCategoryById);
router.delete('/customer-category/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('customer_category'), (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'delete' }]), customerCategory_controller_1.customerCategoryController.deleteCustomerCategory);
router.post('/customer-category/assign-all', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'update' }]), customerCategory_controller_1.customerCategoryController.assignCategoriesToCustomers);
router.post('/customer-category/assign/:customerId', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'update' }]), customerCategory_controller_1.customerCategoryController.assignCategoryToSingleCustomer);
router.get('/customer-category/stats/assignment', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'read' }]), customerCategory_controller_1.customerCategoryController.getCategoryAssignmentStats);
exports.default = router;
//# sourceMappingURL=customerCategory.routes.js.map