"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const multer_1 = require("../../utils/multer");
const router = (0, express_1.Router)();
router.post('/auth/register', auth_controller_1.register);
router.post('/auth/login', multer_1.upload.none(), auth_controller_1.login);
router.post('/auth/logout', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'profile', action: 'update' }]), auth_controller_1.logout);
router.post('/auth/refresh', auth_controller_1.refresh);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map