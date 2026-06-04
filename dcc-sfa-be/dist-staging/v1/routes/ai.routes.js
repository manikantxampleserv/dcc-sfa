"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
// Endpoint for AI queries
router.post('/ai/query', auth_middleware_1.authenticateToken, ai_controller_1.aiController.query);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map