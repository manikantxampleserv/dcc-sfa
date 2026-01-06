"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const customerCategory_controller_1 = require("../controllers/customerCategory.controller");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = express_1.default.Router();
router.post('/customer-category/bulk', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('customer_category'), (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'create' }]), customerCategory_controller_1.customerCategoryController.bulkCustomerCategory);
router.get('/customer-category', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'read' }]), customerCategory_controller_1.customerCategoryController.getAllCustomerCategory);
router.get('/customer-category/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'read' }]), customerCategory_controller_1.customerCategoryController.getCustomerCategoryById);
router.delete('/customer-category/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('customer_category'), (0, auth_middleware_1.requirePermission)([{ module: 'customer-category', action: 'delete' }]), customerCategory_controller_1.customerCategoryController.deleteCustomerCategory);
exports.default = router;
//# sourceMappingURL=customerCategory.routes.js.map