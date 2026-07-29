"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const requests_controller_1 = require("../controllers/requests.controller");
const router = (0, express_1.Router)();
router.post('/requests', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('sfa_d_requests'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'create' }]), requests_controller_1.requestsController.createRequest);
router.get('/requests/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), requests_controller_1.requestsController.getRequestsById);
router.get('/requests', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), requests_controller_1.requestsController.getAllRequests);
router.put('/requests/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('sfa_d_requests'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'update' }]), requests_controller_1.requestsController.updateRequests);
router.delete('/requests/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('sfa_d_requests'), (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'delete' }]), requests_controller_1.requestsController.deleteRequests);
router.post('/requests/action', auth_middleware_1.authenticateToken, requests_controller_1.requestsController.takeActionOnRequest);
router.get('/requests-by-users', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), requests_controller_1.requestsController.getRequestsByUsers);
router.get('/requests-by-users-without-permission', auth_middleware_1.authenticateToken, requests_controller_1.requestsController.getRequestsByUsers);
router.get('/request-by-type-reference', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), requests_controller_1.requestsController.getRequestByTypeAndReference);
router.get('/approval-setup/request-types', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'approval', action: 'read' }]), requests_controller_1.requestsController.getRequestTypes);
exports.default = router;
//# sourceMappingURL=requests.routes.js.map