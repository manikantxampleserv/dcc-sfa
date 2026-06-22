"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const auditLogs_controller_1 = require("../controllers/auditLogs.controller");
const router = (0, express_1.Router)();
/**
 * @route GET /api/v1/audit-logs
 * @description Get Audit Logs with filtering and pagination
 * @access Private (requires authentication)
 * @params Query: page, limit, table_name, action, user_id, start_date, end_date
 */
router.get('/audit-logs', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'report', action: 'read' }]), auditLogs_controller_1.auditLogsController.getAuditLogs);
exports.default = router;
//# sourceMappingURL=auditLogs.routes.js.map