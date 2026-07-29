"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const errorLogs_controller_1 = require("../controllers/errorLogs.controller");
const router = (0, express_1.Router)();
/**
 * @route GET /api/v1/error-logs
 * @description Get Error Logs with filtering and pagination
 * @access Private (requires authentication)
 */
router.get('/error-logs', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'setting', action: 'read' }]), errorLogs_controller_1.errorLogsController.getErrorLogs);
exports.default = router;
//# sourceMappingURL=errorLogs.routes.js.map