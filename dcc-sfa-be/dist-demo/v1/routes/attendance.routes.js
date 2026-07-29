"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const attendance_controller_1 = require("../controllers/attendance.controller");
const router = (0, express_1.Router)();
router.post('/attendance/punch', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('attendance'), attendance_controller_1.attendanceController.punch);
router.get('/attendance/punch/status', auth_middleware_1.authenticateToken, attendance_controller_1.attendanceController.getPunchStatus);
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map