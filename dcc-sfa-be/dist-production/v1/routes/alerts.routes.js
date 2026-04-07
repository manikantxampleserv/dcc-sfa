"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerts_controller_1 = require("../controllers/alerts.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/alerts', auth_middleware_1.authenticateToken, alerts_controller_1.alertsController.createAlert);
router.put('/alerts/:id', auth_middleware_1.authenticateToken, alerts_controller_1.alertsController.updateAlert);
router.get('/alerts', auth_middleware_1.authenticateToken, alerts_controller_1.alertsController.getAllAlerts);
router.get('/alerts/:id', auth_middleware_1.authenticateToken, alerts_controller_1.alertsController.getAlertById);
router.delete('/alerts/:id', auth_middleware_1.authenticateToken, alerts_controller_1.alertsController.deleteAlert);
router.post('/alerts/:id/process', auth_middleware_1.authenticateToken, alerts_controller_1.alertsController.processAlert);
router.post('/alerts/bulk-process', auth_middleware_1.authenticateToken, alerts_controller_1.alertsController.bulkProcessAlerts);
router.get('/alerts/stats', auth_middleware_1.authenticateToken, alerts_controller_1.alertsController.getAlertStats);
exports.default = router;
//# sourceMappingURL=alerts.routes.js.map