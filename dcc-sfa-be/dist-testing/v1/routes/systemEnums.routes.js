"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const systemEnums_controller_1 = require("../controllers/systemEnums.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/:key', auth_middleware_1.authenticateToken, systemEnums_controller_1.systemEnumsController.getEnumByKey);
exports.default = router;
//# sourceMappingURL=systemEnums.routes.js.map