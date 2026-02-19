"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerTypes_controller_1 = require("../controllers/customerTypes.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.post('/customer-types', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('customer_type'), customerTypes_controller_1.customerTypesController.createCustomerTypes);
router.get('/customer-types', auth_middleware_1.authenticateToken, customerTypes_controller_1.customerTypesController.getAllCustomerTypes);
router.get('/customer-types/:id', auth_middleware_1.authenticateToken, customerTypes_controller_1.customerTypesController.getCustomerTypesById);
router.put('/customer-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('customer_type'), customerTypes_controller_1.customerTypesController.updateCustomerTypes);
router.delete('/customer-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('customer_type'), customerTypes_controller_1.customerTypesController.deleteCustomerTypes);
exports.default = router;
//# sourceMappingURL=customerTypes.routes.js.map