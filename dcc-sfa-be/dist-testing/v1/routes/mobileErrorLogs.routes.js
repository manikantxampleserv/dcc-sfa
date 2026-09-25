"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mobileErrorLogs_controller_1 = require("../controllers/mobileErrorLogs.controller");
const router = (0, express_1.Router)();
router.get('/mobile-error-logs', mobileErrorLogs_controller_1.mobileErrorLogsController.getMobileErrorLogs);
router.post('/mobile-error-logs/sync', mobileErrorLogs_controller_1.mobileErrorLogsController.syncMobileErrorLogs);
router.post('/mobile-error-logs', mobileErrorLogs_controller_1.mobileErrorLogsController.syncMobileErrorLogs);
exports.default = router;
//# sourceMappingURL=mobileErrorLogs.routes.js.map