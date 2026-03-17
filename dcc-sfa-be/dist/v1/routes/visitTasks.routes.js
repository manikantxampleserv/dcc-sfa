"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const visitTasks_controller_1 = require("../controllers/visitTasks.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.post('/reports/visit-tasks', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('visit_tasks'), (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'create' }]), visitTasks_controller_1.visitTasksController.createVisitTasks);
router.get('/reports/visit-tasks', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'read' }]), visitTasks_controller_1.visitTasksController.getAllVisitTasks);
router.get('/reports/visit-tasks/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'read' }]), visitTasks_controller_1.visitTasksController.getVisitTasksById);
router.put('/reports/visit-tasks/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('visit_tasks'), (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'update' }]), visitTasks_controller_1.visitTasksController.updateVisitTasks);
router.delete('/reports/visit-tasks/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('visit_tasks'), (0, auth_middleware_1.requirePermission)([{ module: 'visit', action: 'delete' }]), visitTasks_controller_1.visitTasksController.deleteVisitTasks);
exports.default = router;
//# sourceMappingURL=visitTasks.routes.js.map