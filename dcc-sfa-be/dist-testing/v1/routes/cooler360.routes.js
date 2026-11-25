"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const cooler360_controller_1 = require("../controllers/cooler360.controller");
const router = (0, express_1.Router)();
/**
 * Route: Cooler 360 overview payload for default/first asset.
 */
router.get('/cooler-360', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'read' }]), cooler360_controller_1.cooler360Controller.getCooler360Data);
/**
 * Route: Cooler 360 overview payload by identifier (id, serial number, barcode, asset code).
 */
router.get('/cooler-360/:identifier', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'read' }]), cooler360_controller_1.cooler360Controller.getCooler360Data);
exports.default = router;
//# sourceMappingURL=cooler360.routes.js.map