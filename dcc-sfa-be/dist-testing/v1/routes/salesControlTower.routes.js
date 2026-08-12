"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const salesControlTower_controller_1 = require("../controllers/salesControlTower.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/dashboard', auth_middleware_1.authenticateToken, salesControlTower_controller_1.salesControlTowerController.getDashboardData);
router.get('/export', auth_middleware_1.authenticateToken, salesControlTower_controller_1.salesControlTowerController.exportSalesData);
exports.default = router;
//# sourceMappingURL=salesControlTower.routes.js.map