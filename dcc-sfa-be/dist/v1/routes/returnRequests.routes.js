"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const returnRequests_controller_1 = require("../controllers/returnRequests.controller");
const returnRequests_validation_1 = require("../validations/returnRequests.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/return-requests', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('return_requests'), (0, auth_middleware_1.requirePermission)([{ module: 'return', action: 'create' }]), returnRequests_validation_1.returnRequestsValidation, validation_middleware_1.validate, returnRequests_controller_1.returnRequestsController.createReturnRequest);
router.get('/return-requests', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'return', action: 'read' }]), returnRequests_controller_1.returnRequestsController.getAllReturnRequests);
router.put('/return-requests/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('return_requests'), (0, auth_middleware_1.requirePermission)([{ module: 'return', action: 'update' }]), returnRequests_controller_1.returnRequestsController.updateReturnRequest);
router.get('/return-requests/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'return', action: 'read' }]), returnRequests_controller_1.returnRequestsController.getReturnRequestById);
router.delete('/return-requests/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('return_requests'), (0, auth_middleware_1.requirePermission)([{ module: 'return', action: 'delete' }]), returnRequests_controller_1.returnRequestsController.deleteReturnRequest);
exports.default = router;
//# sourceMappingURL=returnRequests.routes.js.map