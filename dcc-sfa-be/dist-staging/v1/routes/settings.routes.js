"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const settings_controller_1 = require("../controllers/settings.controller");
const multer_1 = require("../../utils/multer");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.get('/settings', auth_middleware_1.authenticateToken, settings_controller_1.settingsController.getAllSettings);
router.put('/settings/:id', multer_1.upload.single('logo'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('settings'), settings_controller_1.settingsController.updateSettings);
exports.default = router;
//# sourceMappingURL=settings.routes.js.map