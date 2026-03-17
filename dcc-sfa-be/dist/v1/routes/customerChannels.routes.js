"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerChannels_controller_1 = require("../controllers/customerChannels.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.post('/customer-channels', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('customer_channel'), customerChannels_controller_1.customerChannelsController.createCustomerChannels);
router.get('/customer-channels', auth_middleware_1.authenticateToken, customerChannels_controller_1.customerChannelsController.getAllCustomerChannels);
router.get('/customer-channels/:id', auth_middleware_1.authenticateToken, customerChannels_controller_1.customerChannelsController.getCustomerChannelsById);
router.put('/customer-channels/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('customer_channel'), customerChannels_controller_1.customerChannelsController.updateCustomerChannels);
router.delete('/customer-channels/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('customer_channel'), customerChannels_controller_1.customerChannelsController.deleteCustomerChannels);
exports.default = router;
//# sourceMappingURL=customerChannels.routes.js.map