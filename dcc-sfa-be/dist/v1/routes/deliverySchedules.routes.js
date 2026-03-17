"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const deliverySchedule_controller_1 = require("../controllers/deliverySchedule.controller");
const deliverySchedules_validation_1 = require("../validations/deliverySchedules.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const multer_1 = require("../../utils/multer");
const router = (0, express_1.Router)();
router.post('/delivery-schedules', multer_1.upload.single('customer_signature'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('delivery_schedules'), (0, auth_middleware_1.requirePermission)([{ module: 'delivery', action: 'create' }]), deliverySchedules_validation_1.deliverySchedulesValidation, validation_middleware_1.validate, deliverySchedule_controller_1.deliverySchedulesController.createDeliverySchedule);
router.get('/delivery-schedules', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'delivery', action: 'read' }]), deliverySchedule_controller_1.deliverySchedulesController.getAllDeliverySchedules);
router.put('/delivery-schedules/:id', multer_1.upload.single('customer_signature'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('delivery_schedules'), (0, auth_middleware_1.requirePermission)([{ module: 'delivery', action: 'update' }]), deliverySchedule_controller_1.deliverySchedulesController.updateDeliverySchedule);
router.get('/delivery-schedules/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'delivery', action: 'read' }]), deliverySchedule_controller_1.deliverySchedulesController.getDeliveryScheduleById);
router.delete('/delivery-schedules/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('delivery_schedules'), (0, auth_middleware_1.requirePermission)([{ module: 'delivery', action: 'delete' }]), deliverySchedule_controller_1.deliverySchedulesController.deleteDeliverySchedule);
exports.default = router;
//# sourceMappingURL=deliverySchedules.routes.js.map