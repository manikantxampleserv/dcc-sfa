"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const columnPreferences_controller_1 = require("../controllers/columnPreferences.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.post('/column-preference', columnPreferences_controller_1.columnPreferencesController.saveColumnPreferences);
router.get('/column-preference', columnPreferences_controller_1.columnPreferencesController.getAllUserPreferences);
exports.default = router;
//# sourceMappingURL=columnPreference.routes.js.map